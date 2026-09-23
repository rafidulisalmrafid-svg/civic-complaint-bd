<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\ComplaintSubcategory;
use App\Models\ComplaintAttachment;
use App\Models\ComplaintStatusHistory;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\LocalGovernment;
use App\Models\Ward;
use App\Models\Area;
use App\Models\PostOffice;
use App\Models\Organization;
use App\Models\Office;
use App\Models\OfficerProfile;
use App\Models\User;
use App\Models\Citizen;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Services\TrackingIdGenerator;
use App\Services\ComplaintRoutingService;
use App\Services\SlaCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class ComplaintSubmissionController extends Controller
{
    /**
     * Show 6-step multi-step complaint submission form
     */
    public function create()
    {
        $categories = ComplaintCategory::where('status', 'active')
            ->with([
                'subcategories' => fn ($q) => $q->where('status', 'active'),
                'customFields',
                'ministry' => fn ($q) => $q->select('id', 'name_bn', 'name_en', 'icon'),
                'ministry.children' => fn ($q) => $q->where('status', 'active')->select('id', 'parent_id', 'name_bn', 'name_en', 'icon', 'code'),
                'defaultOrganization' => fn ($q) => $q->select('id', 'name_bn', 'name_en'),
            ])
            ->orderBy('display_order')
            ->get();

        $divisions = Division::where('status', 'active')->get();

        return Inertia::render('Public/SubmitComplaint', [
            'categories' => $categories,
            'divisions' => $divisions,
            'currentUser' => auth()->user(),
        ]);
    }

    /**
     * Store submitted complaint
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:complaint_categories,id',
            'subcategory_id' => 'nullable|exists:complaint_subcategories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:15|max:5000',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'division_id' => 'required|exists:divisions,id',
            'district_id' => 'required|exists:districts,id',
            'upazila_id' => 'required|exists:upazilas,id',
            'local_government_id' => 'nullable|exists:local_governments,id',
            'ward_id' => 'nullable|exists:wards,id',
            'area_id' => 'nullable|exists:areas,id',
            'post_office_id' => 'nullable|exists:post_offices,id',
            'specific_location_details' => 'nullable|string|max:500',
            'organization_id' => 'nullable|exists:organizations,id',
            'office_id' => 'nullable|exists:offices,id',
            'specific_officer_id' => 'nullable|exists:officer_profiles,id',
            'is_anonymous' => 'nullable|boolean',
            'complainant_name' => 'required_without:is_anonymous|nullable|string|max:100',
            'complainant_phone' => 'required_without:is_anonymous|nullable|string|max:20',
            'custom_fields' => 'nullable|array',
            'attachments.*' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,webp,pdf,doc,docx',
        ], [
            'category_id.required' => 'অভিযোগের ধরন নির্বাচন করা আবশ্যক।',
            'title.required' => 'অভিযোগের শিরোনাম প্রদান করুন।',
            'description.required' => 'অভিযোগের বিস্তারিত বিবরণ লিখুন।',
            'division_id.required' => 'বিভাগ নির্বাচন করুন।',
            'district_id.required' => 'জেলা নির্বাচন করুন।',
            'upazila_id.required' => 'উপজেলা নির্বাচন করুন।',
            'complainant_phone.required_without' => 'মোবাইল নম্বর প্রদান করা আবশ্যক।',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Resolve User
            $user = auth()->user();
            if (! $user) {
                $phone = $request->complainant_phone ?: '01700000000';
                $user = User::firstOrCreate(
                    ['phone' => $phone],
                    [
                        'name' => $request->complainant_name ?: 'বেনামী নাগরিক',
                        'role' => 'citizen',
                    ]
                );

                Citizen::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'division_id' => $request->division_id,
                        'district_id' => $request->district_id,
                        'upazila_id' => $request->upazila_id,
                        'address' => $request->specific_location_details,
                    ]
                );
            }

            // 2. Generate Collision-Safe Tracking ID
            $trackingId = TrackingIdGenerator::generate($request->division_id);

            // 3. Category & Sensitivity
            $category = ComplaintCategory::findOrFail($request->category_id);
            $priority = $request->priority ?: $category->default_priority;
            $isSensitive = $category->is_sensitive || $request->boolean('is_sensitive');

            // 4. Resolve Route via Engine
            $routed = ComplaintRoutingService::resolveRoute(
                categoryId: $category->id,
                subcategoryId: $request->subcategory_id,
                divisionId: $request->division_id,
                districtId: $request->district_id,
                upazilaId: $request->upazila_id
            );

            $targetOrgId = $request->organization_id ?: $routed['organization_id'];
            $targetOfficeId = $request->office_id ?: $routed['office_id'];

            // 5. Calculate SLA Due Date
            $dueAt = SlaCalculationService::calculateDueDate($category->id, $priority);

            // 6. Create Complaint Record
            $complaint = Complaint::create([
                'tracking_id' => $trackingId,
                'user_id' => $user->id,
                'complainant_name' => $request->boolean('is_anonymous') ? 'গোপন নাগরিক' : ($request->complainant_name ?: $user->name),
                'complainant_phone' => $request->complainant_phone ?: $user->phone,
                'is_anonymous' => $request->boolean('is_anonymous'),
                'category_id' => $category->id,
                'subcategory_id' => $request->subcategory_id,
                'title' => $request->title,
                'description' => $request->description,
                'priority' => $priority,
                'is_sensitive' => $isSensitive,
                'division_id' => $request->division_id,
                'district_id' => $request->district_id,
                'upazila_id' => $request->upazila_id,
                'local_government_id' => $request->local_government_id,
                'ward_id' => $request->ward_id,
                'area_id' => $request->area_id,
                'post_office_id' => $request->post_office_id,
                'specific_location_details' => $request->specific_location_details,
                'organization_id' => $targetOrgId,
                'office_id' => $targetOfficeId,
                'specific_officer_id' => $request->specific_officer_id, // Accused officer (not assigned)
                'assigned_officer_id' => null,
                'current_status' => 'submitted',
                'custom_fields_data' => $request->custom_fields ?: [],
                'due_at' => $dueAt,
            ]);

            // 7. Process Evidence / Attachments
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('complaint_attachments/' . $complaint->id, 'public');
                    ComplaintAttachment::create([
                        'complaint_id' => $complaint->id,
                        'file_path' => $path,
                        'original_filename' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                        'is_camera_capture' => $request->boolean('is_camera_capture'),
                        'is_private' => $isSensitive,
                        'uploaded_by_user_id' => $user->id,
                    ]);
                }
            }

            // 8. Timeline Record
            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->id,
                'from_status' => 'submitted',
                'to_status' => 'submitted',
                'action_type' => 'submitted',
                'remarks_bn' => 'নাগরিক কর্তৃক অনলাইনে অভিযোগ সফলভাবে দাখিল করা হয়েছে। ট্র্যাকিং নম্বর: ' . $trackingId,
                'changed_by_user_id' => $user->id,
                'is_public_to_citizen' => true,
            ]);

            // 9. Audit Log
            AuditLog::logEvent('complaint_created', $complaint, null, [
                'tracking_id' => $trackingId,
                'category' => $category->name_bn,
                'priority' => $priority,
            ], $user);

            // 10. In-App Notification
            Notification::create([
                'user_id' => $user->id,
                'title_bn' => 'অভিযোগ সফলভাবে দাখিল হয়েছে',
                'message_bn' => "আপনার অভিযোগ নম্বর {$trackingId} সফলভাবে গৃহীত হয়েছে। শীঘ্রই প্রয়োজনীয় ব্যবস্থা গ্রহণ করা হবে।",
                'type' => 'success',
                'link' => route('complaint.track', ['id' => $trackingId]),
            ]);

            return redirect()->route('complaint.track', ['id' => $trackingId])->with([
                'success' => 'আপনার অভিযোগ সফলভাবে জমা হয়েছে। অভিযোগ ট্র্যাকিং নম্বর সংরক্ষণ করুন।',
                'submittedComplaint' => [
                    'tracking_id' => $trackingId,
                    'title' => $complaint->title,
                ],
            ]);
        });
    }

    // Cascading Location & Organization APIs
    public function getDistricts($divisionId)
    {
        return response()->json(
            District::where('division_id', $divisionId)->where('status', 'active')->select('id', 'name_bn', 'name_en', 'code')->get()
        );
    }

    public function getUpazilas($districtId)
    {
        return response()->json(
            Upazila::where('district_id', $districtId)->where('status', 'active')->select('id', 'name_bn', 'name_en')->get()
        );
    }

    public function getCategoryAuthority($categoryId)
    {
        $category = ComplaintCategory::with([
            'ministry' => fn ($q) => $q->select('id', 'name_bn', 'name_en', 'icon'),
            'ministry.children' => fn ($q) => $q->where('status', 'active')->select('id', 'parent_id', 'name_bn', 'name_en', 'icon', 'code'),
            'defaultOrganization' => fn ($q) => $q->select('id', 'name_bn', 'name_en'),
        ])->findOrFail($categoryId);

        return response()->json([
            'ministry' => $category->ministry,
            'agencies' => $category->ministry ? $category->ministry->children : [],
            'default_organization_id' => $category->default_organization_id,
        ]);
    }

    public function getLocalGovernmentsByDistrict($districtId)
    {
        return response()->json(
            LocalGovernment::whereHas('upazila', function ($q) use ($districtId) {
                $q->where('district_id', $districtId);
            })->where('status', 'active')->select('id', 'upazila_id', 'name_bn', 'name_en', 'type')->get()
        );
    }

    public function getLocalGovernments($upazilaId)
    {
        return response()->json(
            LocalGovernment::where('upazila_id', $upazilaId)->where('status', 'active')->select('id', 'name_bn', 'name_en', 'type')->get()
        );
    }

    public function getWards($localGovernmentId)
    {
        return response()->json(
            Ward::where('local_government_id', $localGovernmentId)->where('status', 'active')->select('id', 'ward_number', 'name_bn', 'name_en')->get()
        );
    }

    public function getAreas($wardId)
    {
        return response()->json(
            Area::where('ward_id', $wardId)->where('status', 'active')->select('id', 'name_bn', 'name_en', 'type')->get()
        );
    }

    public function getPostOffices($upazilaId)
    {
        return response()->json(
            PostOffice::where('upazila_id', $upazilaId)->where('status', 'active')->select('id', 'name_bn', 'name_en', 'post_code')->get()
        );
    }

    public function getOffices(Request $request)
    {
        $query = Office::where('status', 'active')->select('id', 'organization_id', 'name_bn', 'name_en', 'address', 'phone', 'district_id', 'upazila_id');

        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        // If district provided, first try matching district
        if ($request->filled('district_id')) {
            $districtOffices = (clone $query)->where(function ($q) use ($request) {
                $q->where('district_id', $request->district_id)
                  ->orWhereNull('district_id');
            })->get();

            if ($districtOffices->isNotEmpty()) {
                return response()->json($districtOffices);
            }
        }

        return response()->json($query->get());
    }

    public function getOfficers($officeId)
    {
        return response()->json(
            OfficerProfile::where('office_id', $officeId)
                ->where('status', 'active')
                ->select('id', 'name_bn', 'name_en', 'designation_bn', 'employee_id')
                ->get()
        );
    }
}
