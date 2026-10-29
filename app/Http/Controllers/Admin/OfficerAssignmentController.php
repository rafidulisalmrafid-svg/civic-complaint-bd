<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CategoryOfficerAssignment;
use App\Models\ComplaintCategory;
use App\Models\Division;
use App\Models\District;
use App\Models\OfficerProfile;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OfficerAssignmentController extends Controller
{
    /**
     * Display Division/District & Category-wise Designated Officer Assignments
     */
    public function index(Request $request)
    {
        $assignments = CategoryOfficerAssignment::with([
            'category:id,name_bn,name_en,icon',
            'division:id,name_bn,name_en',
            'district:id,name_bn,name_en',
            'officerProfile.office:id,name_bn',
            'officerProfile.user:id,name,email,phone',
            'assignedByUser:id,name',
        ])
        ->latest()
        ->paginate(20)
        ->withQueryString();

        $categories = ComplaintCategory::where('status', 'active')->select('id', 'name_bn', 'name_en')->orderBy('display_order')->get();
        $divisions = Division::where('status', 'active')->select('id', 'name_bn', 'name_en')->get();
        $districts = District::where('status', 'active')->select('id', 'name_bn', 'division_id')->get();
        $officers = OfficerProfile::where('status', 'active')
            ->with(['office:id,name_bn', 'user:id,name,email,phone'])
            ->select('id', 'user_id', 'name_bn', 'designation_bn', 'office_id', 'district_id')
            ->get();

        return Inertia::render('Admin/OfficerAssignments/Index', [
            'assignments' => $assignments,
            'categories' => $categories,
            'divisions' => $divisions,
            'districts' => $districts,
            'officers' => $officers,
        ]);
    }

    /**
     * Store a newly created assignment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:complaint_categories,id',
            'division_id' => 'nullable|exists:divisions,id',
            'district_id' => 'nullable|exists:districts,id',
            'officer_profile_id' => 'required|exists:officer_profiles,id',
            'notes' => 'nullable|string|max:1000',
        ], [
            'category_id.required' => 'সেবা খাত বা ক্যাটাগরি নির্বাচন করুন।',
            'officer_profile_id.required' => 'দায়িত্বপ্রাপ্ত কর্মকর্তা নির্বাচন করুন।',
        ]);

        $officer = OfficerProfile::findOrFail($validated['officer_profile_id']);

        $assignment = CategoryOfficerAssignment::create([
            'category_id' => $validated['category_id'],
            'division_id' => $validated['division_id'] ?? null,
            'district_id' => $validated['district_id'] ?? null,
            'officer_profile_id' => $officer->id,
            'user_id' => $officer->user_id,
            'assigned_by_user_id' => auth()->id(),
            'is_active' => true,
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLog::logEvent('officer_assignment_created', $assignment, null, $assignment->toArray());

        return back()->with('success', 'দায়িত্বপ্রাপ্ত কর্মকর্তা সফলভাবে বণ্টন ও নির্ধারিত করা হয়েছে।');
    }

    /**
     * Update an assignment
     */
    public function update(Request $request, $id)
    {
        $assignment = CategoryOfficerAssignment::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'required|exists:complaint_categories,id',
            'division_id' => 'nullable|exists:divisions,id',
            'district_id' => 'nullable|exists:districts,id',
            'officer_profile_id' => 'required|exists:officer_profiles,id',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        $officer = OfficerProfile::findOrFail($validated['officer_profile_id']);
        $old = $assignment->toArray();

        $assignment->update([
            'category_id' => $validated['category_id'],
            'division_id' => $validated['division_id'] ?? null,
            'district_id' => $validated['district_id'] ?? null,
            'officer_profile_id' => $officer->id,
            'user_id' => $officer->user_id,
            'is_active' => $request->boolean('is_active', true),
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLog::logEvent('officer_assignment_updated', $assignment, $old, $assignment->toArray());

        return back()->with('success', 'কর্মকর্তার দায়িত্ব বণ্টন তথ্য সফলভাবে হালনাগাদ করা হয়েছে।');
    }

    /**
     * Toggle active status
     */
    public function toggle($id)
    {
        $assignment = CategoryOfficerAssignment::findOrFail($id);
        $assignment->update(['is_active' => ! $assignment->is_active]);

        return back()->with('success', 'কর্মকর্তা দায়িত্বের স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে।');
    }

    /**
     * Remove an assignment
     */
    public function destroy($id)
    {
        $assignment = CategoryOfficerAssignment::findOrFail($id);
        $assignment->delete();

        return back()->with('success', 'কর্মকর্তার দায়িত্ব বণ্টন সফলভাবে অপসারণ করা হয়েছে।');
    }
}
