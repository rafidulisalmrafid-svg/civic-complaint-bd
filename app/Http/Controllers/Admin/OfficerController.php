<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OfficerProfile;
use App\Models\OfficerAssignmentHistory;
use App\Models\User;
use App\Models\Organization;
use App\Models\Office;
use App\Models\District;
use App\Models\Upazila;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OfficerController extends Controller
{
    public function index(Request $request)
    {
        $query = OfficerProfile::with(['organization', 'office', 'district', 'upazila', 'user'])
            ->withCount('assignedComplaints');

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name_bn', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('designation_bn', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('office_id')) {
            $query->where('office_id', $request->office_id);
        }

        $officers = $query->paginate(15)->withQueryString();

        $organizations = Organization::where('status', 'active')->select('id', 'name_bn')->get();
        $offices = Office::where('status', 'active')->select('id', 'name_bn', 'organization_id')->get();
        $districts = District::where('status', 'active')->select('id', 'name_bn')->get();
        $upazilas = Upazila::where('status', 'active')->select('id', 'name_bn', 'district_id')->get();

        return Inertia::render('Admin/Officers/Index', [
            'officers' => $officers,
            'organizations' => $organizations,
            'offices' => $offices,
            'districts' => $districts,
            'upazilas' => $upazilas,
            'filters' => $request->only(['search', 'office_id']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_bn' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'employee_id' => 'nullable|string|max:50',
            'designation_bn' => 'required|string|max:100',
            'designation_en' => 'nullable|string|max:100',
            'official_phone' => 'nullable|string|max:20',
            'official_email' => 'nullable|email|max:100',
            'organization_id' => 'required|exists:organizations,id',
            'office_id' => 'required|exists:offices,id',
            'district_id' => 'nullable|exists:districts,id',
            'upazila_id' => 'nullable|exists:upazilas,id',
            'joining_date' => 'nullable|date',
            // Option to provision login immediately
            'create_login_account' => 'nullable|boolean',
            'password' => 'required_if:create_login_account,true|nullable|string|min:6',
        ]);

        return DB::transaction(function () use ($request) {
            $userId = null;
            if ($request->boolean('create_login_account')) {
                $user = User::create([
                    'name' => $request->name_bn,
                    'phone' => $request->official_phone ?: '017' . random_int(10000000, 99999999),
                    'email' => $request->official_email,
                    'password' => Hash::make($request->password ?: 'password123'),
                    'role' => 'officer',
                    'is_active' => true,
                ]);
                $userId = $user->id;
            }

            $profile = OfficerProfile::create(array_merge(
                $request->except(['create_login_account', 'password']),
                ['user_id' => $userId, 'status' => 'active']
            ));

            OfficerAssignmentHistory::create([
                'officer_profile_id' => $profile->id,
                'new_office_id' => $profile->office_id,
                'new_designation' => $profile->designation_bn,
                'change_type' => 'joining',
                'effective_date' => $profile->joining_date ?: now(),
                'changed_by_user_id' => auth()->id(),
                'notes' => 'কর্মকর্তার প্রাথমিক যোগদান ও পদায়ন সম্পন্ন।',
            ]);

            AuditLog::logEvent('officer_profile_created', $profile, null, $profile->toArray());

            return back()->with('success', 'কর্মকর্তার তথ্য সফলভাবে যোগ করা হয়েছে।');
        });
    }

    /**
     * Create Login Access for an existing Directory Officer
     */
    public function createLogin(Request $request, $id)
    {
        $officer = OfficerProfile::findOrFail($id);

        if ($officer->user_id) {
            return back()->with('info', 'এই কর্মকর্তার ইতিমধ্যে সক্রিয় লগইন অ্যাকাউন্ট রয়েছে।');
        }

        $request->validate([
            'phone' => 'required|string|unique:users,phone',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:officer,area_officer,dept_admin',
        ]);

        $user = User::create([
            'name' => $officer->name_bn,
            'phone' => $request->phone,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true,
        ]);

        $officer->update(['user_id' => $user->id]);

        AuditLog::logEvent('officer_login_created', $officer, null, ['user_id' => $user->id, 'role' => $request->role]);

        return back()->with('success', 'কর্মকর্তার লগইন অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে।');
    }

    /**
     * Transfer Officer to Another Office
     */
    public function transfer(Request $request, $id)
    {
        $request->validate([
            'new_office_id' => 'required|exists:offices,id',
            'new_designation' => 'nullable|string',
            'transfer_order_no' => 'nullable|string',
            'effective_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $officer = OfficerProfile::findOrFail($id);
        $prevOfficeId = $officer->office_id;
        $prevDesignation = $officer->designation_bn;

        DB::transaction(function () use ($officer, $prevOfficeId, $prevDesignation, $request) {
            $officer->update([
                'office_id' => $request->new_office_id,
                'designation_bn' => $request->new_designation ?: $officer->designation_bn,
                'status' => 'active',
            ]);

            OfficerAssignmentHistory::create([
                'officer_profile_id' => $officer->id,
                'previous_office_id' => $prevOfficeId,
                'new_office_id' => $request->new_office_id,
                'previous_designation' => $prevDesignation,
                'new_designation' => $officer->designation_bn,
                'change_type' => 'transfer',
                'transfer_order_no' => $request->transfer_order_no,
                'effective_date' => $request->effective_date,
                'changed_by_user_id' => auth()->id(),
                'notes' => $request->notes,
            ]);

            AuditLog::logEvent('officer_transferred', $officer, ['office_id' => $prevOfficeId], ['office_id' => $request->new_office_id]);
        });

        return back()->with('success', 'কর্মকর্তার বদলি ও পদায়ন ইতিহাস সফলভাবে রেকর্ড করা হয়েছে।');
    }
}
