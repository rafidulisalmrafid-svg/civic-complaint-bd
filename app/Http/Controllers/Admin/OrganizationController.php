<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationType;
use App\Models\Office;
use App\Models\OfficeBranch;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class OrganizationController extends Controller
{
    public function index()
    {
        $now = Carbon::now();

        // Organizations with nested hierarchy, types, office count, and real complaint statistics
        $organizations = Organization::with([
            'type',
            'children.type',
            'offices.district',
        ])
        ->withCount([
            'offices',
            'officerProfiles',
            'complaints',
            'complaints as resolved_complaints_count' => fn ($q) => $q->whereIn('current_status', ['resolved', 'closed']),
            'complaints as overdue_complaints_count' => fn ($q) => $q->where('current_status', 'overdue')->orWhere(fn ($sub) => $sub->whereNotIn('current_status', ['resolved', 'closed', 'rejected'])->where('due_at', '<', $now)),
        ])
        ->whereNull('parent_id') // Top-level root nodes
        ->get();

        $allOffices = Office::with(['organization', 'district', 'upazila', 'branches'])
            ->withCount(['officers', 'complaints', 'branches'])
            ->paginate(15);

        $allBranches = OfficeBranch::with('office.organization')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        $orgTypes = OrganizationType::orderBy('level_order')->get();
        $parentOrgs = Organization::where('status', 'active')->select('id', 'name_bn')->get();
        $districts = District::where('status', 'active')->select('id', 'name_bn')->get();
        $upazilas = Upazila::where('status', 'active')->select('id', 'name_bn', 'district_id')->get();
        $officeSelect = Office::where('status', 'active')->select('id', 'name_bn', 'organization_id')->get();

        return Inertia::render('Admin/Organizations/Index', [
            'organizationsTree' => $organizations,
            'offices' => $allOffices,
            'branches' => $allBranches,
            'officeSelect' => $officeSelect,
            'organizationTypes' => $orgTypes,
            'parentOrganizations' => $parentOrgs,
            'districts' => $districts,
            'upazilas' => $upazilas,
        ]);
    }

    public function storeOrganization(Request $request)
    {
        $request->validate([
            'organization_type_id' => 'required|exists:organization_types,id',
            'parent_id' => 'nullable|exists:organizations,id',
            'name_bn' => 'required|string|max:200',
            'name_en' => 'required|string|max:200',
            'code' => 'required|string|unique:organizations,code',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'website' => 'nullable|url',
        ]);

        $org = Organization::create($request->all());
        AuditLog::logEvent('organization_created', $org, null, $org->toArray());

        return back()->with('success', 'নতুন সংস্থা/দপ্তর সফলভাবে তৈরি করা হয়েছে।');
    }

    public function storeOffice(Request $request)
    {
        $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'name_bn' => 'required|string|max:200',
            'name_en' => 'required|string|max:200',
            'district_id' => 'nullable|exists:districts,id',
            'upazila_id' => 'nullable|exists:upazilas,id',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $office = Office::create($request->all());
        AuditLog::logEvent('office_created', $office, null, $office->toArray());

        return back()->with('success', 'নতুন অফিস সফলভাবে তৈরি করা হয়েছে।');
    }

    public function updateOffice(Request $request, Office $office)
    {
        $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'name_bn' => 'required|string|max:200',
            'name_en' => 'required|string|max:200',
            'district_id' => 'nullable|exists:districts,id',
            'upazila_id' => 'nullable|exists:upazilas,id',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'status' => 'nullable|in:active,inactive',
        ]);

        $office->update($request->all());
        AuditLog::logEvent('office_updated', $office, null, $office->toArray());

        return back()->with('success', 'অফিসের তথ্য সফলভাবে আপডেট করা হয়েছে।');
    }

    public function destroyOffice(Office $office)
    {
        $officeName = $office->name_bn;
        $office->delete();

        return back()->with('success', "অফিস '{$officeName}' সফলভাবে মুছে ফেলা হয়েছে।");
    }

    public function storeBranch(Request $request)
    {
        $request->validate([
            'office_id' => 'required|exists:offices,id',
            'name_bn' => 'required|string|max:200',
            'name_en' => 'nullable|string|max:200',
            'code' => 'nullable|string|max:50',
            'room_number' => 'nullable|string|max:50',
            'floor' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'description' => 'nullable|string|max:500',
        ]);

        $branch = OfficeBranch::create([
            'office_id' => $request->office_id,
            'name_bn' => $request->name_bn,
            'name_en' => $request->name_en ?: $request->name_bn,
            'code' => $request->code,
            'room_number' => $request->room_number,
            'floor' => $request->floor,
            'phone' => $request->phone,
            'email' => $request->email,
            'description' => $request->description,
            'status' => 'active',
        ]);

        AuditLog::logEvent('branch_created', $branch, null, $branch->toArray());

        return back()->with('success', "নতুন শাখা '{$branch->name_bn}' সফলভাবে যোগ করা হয়েছে।");
    }

    public function updateBranch(Request $request, OfficeBranch $branch)
    {
        $request->validate([
            'office_id' => 'required|exists:offices,id',
            'name_bn' => 'required|string|max:200',
            'name_en' => 'nullable|string|max:200',
            'room_number' => 'nullable|string|max:50',
            'floor' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive',
        ]);

        $branch->update($request->all());
        AuditLog::logEvent('branch_updated', $branch, null, $branch->toArray());

        return back()->with('success', "শাখা '{$branch->name_bn}' সফলভাবে আপডেট করা হয়েছে।");
    }

    public function destroyBranch(OfficeBranch $branch)
    {
        $branchName = $branch->name_bn;
        $branch->delete();

        return back()->with('success', "শাখা '{$branchName}' সফলভাবে মুছে ফেলা হয়েছে।");
    }

    public function toggleStatus(Request $request, $id)
    {
        $org = Organization::findOrFail($id);
        $newStatus = $org->status === 'active' ? 'inactive' : 'active';
        $org->update(['status' => $newStatus]);

        AuditLog::logEvent('organization_status_toggled', $org, null, ['status' => $newStatus]);

        return back()->with('success', 'সংস্থার অবস্থা পরিবর্তন করা হয়েছে।');
    }
}
