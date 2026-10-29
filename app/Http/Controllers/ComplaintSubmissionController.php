<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\ComplaintSubcategory;
use App\Models\ComplaintProblemType;
use App\Models\ComplaintSelectedIssue;
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
use App\Models\OfficeBranch;
use App\Models\OfficerProfile;
use App\Models\User;
use App\Models\Citizen;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Services\TrackingIdGenerator;
use App\Services\ComplaintRoutingService;
use App\Services\SlaCalculationService;
use App\Services\DocumentVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;

class ComplaintSubmissionController extends Controller
{
    /**
     * Show 9-step progressive complaint submission wizard
     */
    public function create()
    {
        $categories = Cache::remember('submission_form_categories', 1800, function () {
            return ComplaintCategory::where('status', 'active')
                ->with([
                    'problemTypes' => fn ($q) => $q->where('status', 'active')->orderBy('display_order'),
                    'subcategories' => fn ($q) => $q->where('status', 'active'),
                    'ministry' => fn ($q) => $q->select('id', 'name_bn', 'name_en', 'icon', 'code'),
                    'defaultOrganization' => fn ($q) => $q->select('id', 'name_bn', 'name_en', 'code'),
                ])
                ->orderBy('display_order')
                ->get()
                ->toArray();
        });

        $divisions = Cache::remember('submission_form_divisions', 3600, function () {
            return Division::where('status', 'active')->select('id', 'name_bn', 'name_en', 'code')->get()->toArray();
        });

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
            'division_id' => 'required|exists:divisions,id',
            'district_id' => 'required|exists:districts,id',
            'upazila_id' => 'nullable|exists:upazilas,id',
            'category_id' => 'required|exists:complaint_categories,id',
            'office_id' => 'required|exists:offices,id',
            'office_branch_id' => 'nullable|exists:office_branches,id',
            'specific_officer_id' => 'nullable|exists:officer_profiles,id',
            'is_person_unknown' => 'nullable|boolean',
            'accused_person_name' => 'nullable|string|max:255',
            'selected_problems' => 'nullable|array',
            'other_problem_description' => 'nullable|string|max:2000',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'is_anonymous' => 'nullable|boolean',
            'complainant_name' => 'required_without:is_anonymous|nullable|string|max:100',
            'complainant_phone' => 'required_without:is_anonymous|nullable|string|max:20',
            'camera_photos' => 'nullable|array',
            'attachments.*' => 'nullable|file|max:102400|mimes:jpg,jpeg,png,webp,gif,pdf,mp4,mov,avi,webm,mkv,3gp,3gpp,m4v,wmv,doc,docx,odt,rtf',
        ], [
            'division_id.required' => 'বিভাগ নির্বাচন করা আবশ্যক।',
            'district_id.required' => 'জেলা নির্বাচন করা আবশ্যক।',
            'category_id.required' => 'সেবা বা দপ্তরের ধরন নির্বাচন করুন।',
            'office_id.required' => 'অফিস নির্বাচন করা আবশ্যক।',
            'complainant_phone.required_without' => 'মোবাইল নম্বর প্রদান করা আবশ্যক।',
            'attachments.*.max' => 'সংযুক্ত ফাইলের আকার সর্বোচ্চ ১০০ মেগাবাইট পর্যন্ত হতে পারে।',
            'attachments.*.mimes' => 'অনুমোদিত ফরম্যাটের ফাইল বা ভিডিও নির্বাচন করুন (jpg, png, webp, mp4, webm, mov, avi, 3gp, mkv, pdf, doc)।',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Resolve Citizen User
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
                    ]
                );
            }

            // 2. Generate Tracking ID in COM-YEAR-XXXXXX format
            $trackingId = TrackingIdGenerator::generate($request->division_id);

            // 3. Category & Priority
            $category = ComplaintCategory::findOrFail($request->category_id);
            $hasLiveCameraEvidence = $request->has('camera_photos') && is_array($request->camera_photos) && count($request->camera_photos) > 0;
            $priority = $request->priority ?: ($category->default_priority ?: 'medium');
            if ($hasLiveCameraEvidence && in_array($priority, ['low', 'medium'])) {
                $priority = 'high'; // Live camera evidence gets direct priority boost
            }

            $office = Office::findOrFail($request->office_id);
            $branch = $request->office_branch_id ? OfficeBranch::find($request->office_branch_id) : null;
            $officer = $request->specific_officer_id ? OfficerProfile::find($request->specific_officer_id) : null;

            // 4. Resolve Route using 4-tier engine
            $routed = ComplaintRoutingService::resolveRoute(
                categoryId: $category->id,
                subcategoryId: null,
                divisionId: $request->division_id,
                districtId: $request->district_id,
                upazilaId: $request->upazila_id,
                officeId: $office->id,
                branchId: $branch?->id,
                specificOfficerId: $officer?->id,
                isPersonUnknown: $request->boolean('is_person_unknown')
            );

            // 5. Calculate SLA
            $dueAt = SlaCalculationService::calculateDueDate($category->id, $priority);

            // 6. Selected Issues Resolution & Summary
            $selectedProblemIds = $request->input('selected_problems', []);
            $selectedProblems = ComplaintProblemType::whereIn('id', $selectedProblemIds)->get();
            $issueTitles = $selectedProblems->pluck('title_bn')->toArray();
            if ($request->filled('other_problem_description')) {
                $issueTitles[] = 'অন্যান্য সমস্যা: ' . trim($request->other_problem_description);
            }
            $issuesSummary = implode(', ', $issueTitles);

            // Accused Person identification details
            $accusedPersonName = $request->boolean('is_person_unknown') 
                ? null 
                : ($officer ? $officer->name_bn : ($request->filled('accused_person_name') ? trim($request->accused_person_name) : null));

            // Generate clean title if not provided
            $title = $request->title;
            if (empty($title)) {
                $targetName = $request->boolean('is_person_unknown')
                    ? ($branch ? $branch->name_bn : $office->name_bn)
                    : ($accusedPersonName ?: ($branch ? $branch->name_bn : $office->name_bn));

                $firstIssue = $selectedProblems->first()?->title_bn ?? ($request->filled('other_problem_description') ? trim($request->other_problem_description) : 'নাগরিক সেবা প্রাপ্তিতে বিঘ্ন');
                $title = "{$targetName} — {$firstIssue}";
            }

            // Generate description if not provided
            $description = $request->description;
            if (empty($description)) {
                $description = "স্থান: " . ($office->name_bn ?? '') . "। ";
                if ($branch) $description .= "শাখা: {$branch->name_bn}। ";
                if ($accusedPersonName) {
                    $designation = $officer ? " ({$officer->designation_bn})" : "";
                    $description .= "অভিযুক্ত কর্মকর্তা/ব্যক্তি: {$accusedPersonName}{$designation}। ";
                } elseif ($request->boolean('is_person_unknown')) {
                    $description .= "অভিযুক্ত ব্যক্তি: অজ্ঞাত (দপ্তর প্রধানের দৃষ্টি আকর্ষণ)। ";
                }
                if (! empty($issuesSummary)) $description .= "চিহ্নিত সমস্যা: {$issuesSummary}।";
            }

            // 7. Create Complaint
            $complaint = Complaint::create([
                'tracking_id' => $trackingId,
                'user_id' => $user->id,
                'complainant_name' => $request->boolean('is_anonymous') ? 'গোপন নাগরিক' : ($request->complainant_name ?: $user->name),
                'complainant_phone' => $request->complainant_phone ?: $user->phone,
                'is_anonymous' => $request->boolean('is_anonymous'),
                'category_id' => $category->id,
                'title' => $title,
                'description' => $description,
                'priority' => $priority,
                'is_sensitive' => $category->is_sensitive || $request->boolean('is_sensitive'),
                'division_id' => $request->division_id,
                'district_id' => $request->district_id,
                'upazila_id' => $request->upazila_id,
                'organization_id' => $office->organization_id,
                'office_id' => $office->id,
                'office_branch_id' => $branch?->id,
                'specific_officer_id' => $officer?->id,
                'is_person_unknown' => $request->boolean('is_person_unknown'),
                'accused_person_name' => $accusedPersonName,
                'assigned_officer_id' => $routed['assigned_officer_id'],
                'current_status' => 'submitted',
                'selected_issues_summary' => $issuesSummary,
                'other_problem_description' => $request->filled('other_problem_description') ? trim($request->other_problem_description) : null,
                'due_at' => $dueAt,
                'conflict_of_interest_detected' => $routed['conflict_of_interest'] ?? false,
                'conflict_resolution_note' => $routed['conflict_note'] ?? null,
                'routing_dispatch_time' => now(),
                'delivery_status' => 'delivered',
            ]);

            // 8. Store Selected Issues in normalized table
            foreach ($selectedProblems as $prob) {
                ComplaintSelectedIssue::create([
                    'complaint_id' => $complaint->id,
                    'problem_type_id' => $prob->id,
                    'cluster_name_bn' => $prob->cluster_name_bn,
                    'title_bn' => $prob->title_bn,
                ]);
            }

            $anyAiTamperDetected = false;

            // 9. Store Camera Photos (Base64 data URLs from HTML5 camera) with AI Document Verification
            if ($request->has('camera_photos') && is_array($request->camera_photos)) {
                foreach ($request->camera_photos as $index => $dataUrl) {
                    if (str_starts_with($dataUrl, 'data:image')) {
                        $imageParts = explode(';base64,', $dataUrl);
                        $imageTypeAux = explode('image/', $imageParts[0]);
                        $imageType = $imageTypeAux[1] ?? 'png';
                        $imageBase64 = base64_decode($imageParts[1]);

                        $fileName = 'complaint_' . $complaint->id . '_cam_' . ($index + 1) . '_' . time() . '.' . $imageType;
                        $filePath = 'evidence/' . $fileName;

                        Storage::disk('public')->put($filePath, $imageBase64);

                        // Run verification on saved camera photo with is_camera_capture = true
                        $verification = DocumentVerificationService::verifyDocument($filePath, [
                            'complainant_name' => $complaint->complainant_name,
                            'office_name' => $office->name_bn,
                            'incident_date' => date('d/m/Y'),
                            'title' => $complaint->title,
                            'is_camera_capture' => true,
                        ]);

                        if (! empty($verification['ai_tamper_detected'])) {
                            $anyAiTamperDetected = true;
                        }

                        ComplaintAttachment::create([
                            'complaint_id' => $complaint->id,
                            'file_path' => $filePath,
                            'original_filename' => 'ক্যামেরা লাইভ ছবি ' . ($index + 1) . '.' . $imageType,
                            'mime_type' => 'image/' . $imageType,
                            'file_size' => strlen($imageBase64),
                            'is_camera_capture' => true,
                            'is_private' => true,
                            'uploaded_by_user_id' => $user->id,
                            'verification_status' => $verification['verification_status'],
                            'confidence_score' => $verification['confidence_score'],
                            'document_type' => 'photo_evidence',
                            'ocr_extracted_text' => $verification['ocr_extracted_text'],
                            'extracted_entities' => $verification['extracted_entities'],
                            'file_hash' => $verification['file_hash'],
                            'is_duplicate' => $verification['is_duplicate'],
                            'duplicate_of_attachment_id' => $verification['duplicate_of_attachment_id'],
                            'analysis_flags' => $verification['analysis_flags'],
                            'ai_tamper_detected' => $verification['ai_tamper_detected'] ?? false,
                            'verification_method' => $verification['verification_method'],
                            'admin_review_status' => $verification['admin_review_status'],
                        ]);
                    }
                }
            }

            // 10. Store standard uploaded files (Gallery/File upload) with AI Document Verification Pipeline
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    if (! $file || ! $file->isValid()) {
                        continue;
                    }

                    try {
                        $path = $file->store('evidence', 'public');

                        $verification = DocumentVerificationService::verifyDocument($file, [
                            'complainant_name' => $complaint->complainant_name,
                            'office_name' => $office->name_bn,
                            'incident_date' => date('d/m/Y'),
                            'title' => $complaint->title,
                            'is_camera_capture' => false,
                        ]);

                        if (! empty($verification['ai_tamper_detected'])) {
                            $anyAiTamperDetected = true;
                        }

                        ComplaintAttachment::create([
                            'complaint_id' => $complaint->id,
                            'file_path' => $path,
                            'original_filename' => $file->getClientOriginalName(),
                            'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
                            'file_size' => $file->getSize() ?: 0,
                            'is_camera_capture' => false,
                            'is_private' => true,
                            'uploaded_by_user_id' => $user->id,
                            'verification_status' => $verification['verification_status'] ?? 'likely_authentic',
                            'confidence_score' => $verification['confidence_score'] ?? 70,
                            'document_type' => $verification['document_type'] ?? 'other_document',
                            'ocr_extracted_text' => $verification['ocr_extracted_text'] ?? '',
                            'extracted_entities' => $verification['extracted_entities'] ?? [],
                            'file_hash' => $verification['file_hash'] ?? '',
                            'is_duplicate' => $verification['is_duplicate'] ?? false,
                            'duplicate_of_attachment_id' => $verification['duplicate_of_attachment_id'] ?? null,
                            'analysis_flags' => $verification['analysis_flags'] ?? [],
                            'ai_tamper_detected' => $verification['ai_tamper_detected'] ?? false,
                            'verification_method' => $verification['verification_method'] ?? 'Heuristic_V2',
                            'admin_review_status' => $verification['admin_review_status'] ?? 'approved',
                        ]);
                    } catch (\Throwable $fileEx) {
                        \Illuminate\Support\Facades\Log::warning('Attachment upload error: ' . $fileEx->getMessage());
                    }
                }
            }

            if ($anyAiTamperDetected) {
                $complaint->update(['ai_tamper_detected' => true]);
            }

            // 11. Initial Status History & Audit Log
            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->id,
                'from_status' => 'submitted',
                'to_status' => 'submitted',
                'action_type' => 'submitted',
                'remarks_bn' => 'নাগরিক কর্তৃক অনলাইনে অভিযোগ সফলভাবে দাখিল করা হয়েছে। ট্র্যাকিং কোড: ' . $trackingId,
                'changed_by_user_id' => $user->id,
                'is_public_to_citizen' => true,
            ]);

            AuditLog::logEvent('complaint_created', $complaint, null, [
                'tracking_id' => $trackingId,
                'category' => $category->name_bn,
                'office' => $office->name_bn,
                'issues' => $issuesSummary,
                'priority' => $priority,
            ], $user);

            // In-app Notification to Complainant
            Notification::create([
                'user_id' => $user->id,
                'title_bn' => 'অভিযোগ সফলভাবে গৃহীত হয়েছে',
                'message_bn' => "আপনার অভিযোগ নম্বর {$trackingId} সফলভাবে সিস্টেমে যুক্ত হয়েছে। শীঘ্রই প্রয়োজনীয় ব্যবস্থা নেওয়া হবে।",
                'type' => 'success',
                'link' => route('complaint.track', ['id' => $trackingId]),
            ]);

            // Dispatch instant dual notifications to Super Admin & Designated Category/Region Officer
            \App\Services\ComplaintNotificationService::dispatchNewComplaintNotifications($complaint);

            // Clear cache
            Cache::forget('public_home_data');
            Cache::forget('admin_dashboard_metrics');

            return redirect()->route('complaint.track', ['id' => $trackingId])->with([
                'success' => 'আপনার অভিযোগ সফলভাবে দাখিল হয়েছে। ট্র্যাকিং নম্বরটি সংরক্ষণ করুন।',
                'submittedComplaint' => [
                    'tracking_id' => $trackingId,
                    'title' => $complaint->title,
                ],
            ]);
        });
    }

    // ==========================================
    // CASCADING LOCATION, SERVICE & OFFICE APIS
    // ==========================================

    // ==========================================
    // CASCADING LOCATION, SERVICE & OFFICE APIS
    // ==========================================

    public function getDistricts($divisionId)
    {
        $data = Cache::remember("geo_districts_{$divisionId}", 3600, function () use ($divisionId) {
            return District::where('division_id', $divisionId)
                ->where('status', 'active')
                ->select('id', 'name_bn', 'name_en', 'code')
                ->orderBy('name_bn')
                ->get()
                ->toArray();
        });
        return response()->json($data);
    }

    public function getUpazilas($districtId)
    {
        $data = Cache::remember("geo_upazilas_{$districtId}", 3600, function () use ($districtId) {
            return Upazila::where('district_id', $districtId)
                ->where('status', 'active')
                ->select('id', 'name_bn', 'name_en')
                ->orderBy('name_bn')
                ->get()
                ->toArray();
        });
        return response()->json($data);
    }

    /**
     * Filter offices automatically by Division + District + Service/Category
     */
    public function getOfficesByService(Request $request)
    {
        $categoryId = $request->query('category_id');
        $divisionId = $request->query('division_id');
        $districtId = $request->query('district_id');
        $upazilaId = $request->query('upazila_id');

        $cacheKey = "offices_svc_{$categoryId}_{$divisionId}_{$districtId}_{$upazilaId}";
        $data = Cache::remember($cacheKey, 1800, function () use ($categoryId, $divisionId, $districtId, $upazilaId) {
            $category = ComplaintCategory::find($categoryId);
            $orgId = $category?->default_organization_id;
            $ministryId = $category?->ministry_id;

            $query = Office::where('status', 'active')
                ->with(['organization:id,name_bn,name_en,code'])
                ->withCount('branches');

            // 1. Try exact district match with orgId
            if ($districtId && $orgId) {
                $matched = (clone $query)->where('district_id', $districtId)->where('organization_id', $orgId)->get();
                if ($matched->isNotEmpty()) {
                    return $matched->toArray();
                }
            }

            // 2. Try ministry child organizations in that district
            if ($districtId && $ministryId) {
                $childOrgIds = Organization::where('parent_id', $ministryId)->pluck('id')->push($ministryId);
                $matched = (clone $query)->where('district_id', $districtId)->whereIn('organization_id', $childOrgIds)->get();
                if ($matched->isNotEmpty()) {
                    return $matched->toArray();
                }
            }

            // 3. Try any office in that district
            if ($districtId) {
                $matched = (clone $query)->where('district_id', $districtId)->get();
                if ($matched->isNotEmpty()) {
                    return $matched->toArray();
                }
            }

            // 4. Try any office matching the organization across the division or generally
            if ($orgId) {
                $matched = (clone $query)->where('organization_id', $orgId)->get();
                if ($matched->isNotEmpty()) {
                    return $matched->toArray();
                }
            }

            // 5. Fallback: If still empty for this district, dynamically provide a District Focal Office
            if ($districtId) {
                $district = District::find($districtId);
                $districtName = $district?->name_bn ?? 'জেলা';
                $fallbackOffice = Office::firstOrCreate(
                    ['name_bn' => "জেলা অভিযোগ ও সেবা সমন্বয় সেল, {$districtName}", 'district_id' => $districtId],
                    [
                        'name_en' => "District Grievance & Service Coordination Cell, " . ($district?->name_en ?? 'District'),
                        'organization_id' => $orgId ?: 1,
                        'division_id' => $district?->division_id,
                        'address' => "জেলা প্রশাসকের কার্যালয়, {$districtName}",
                        'phone' => '01711000000',
                        'status' => 'active',
                    ]
                );
                $fallbackOffice->load(['organization:id,name_bn,name_en,code']);
                return [$fallbackOffice->toArray()];
            }

            return $query->take(20)->get()->toArray();
        });

        return response()->json($data);
    }

    /**
     * Get configured branches / departments / service units for an office
     */
    public function getBranches($officeId)
    {
        $data = Cache::remember("geo_branches_{$officeId}", 3600, function () use ($officeId) {
            $branches = OfficeBranch::where('office_id', $officeId)
                ->where('status', 'active')
                ->select('id', 'office_id', 'name_bn', 'name_en', 'code', 'room_number', 'floor')
                ->get();

            // If an office has no branches seeded yet, provide a default general branch
            if ($branches->isEmpty()) {
                $defaultBranch = OfficeBranch::firstOrCreate(
                    ['office_id' => $officeId, 'name_bn' => 'সাধারণ সেবা ও অভিযোগ শাখা'],
                    [
                        'name_en' => 'General Service & Grievance Desk',
                        'code' => 'GEN_DESK',
                        'room_number' => '১০১',
                        'floor' => '১ম তলা',
                        'status' => 'active',
                    ]
                );
                return [$defaultBranch->toArray()];
            }

            return $branches->toArray();
        });

        return response()->json($data);
    }

    /**
     * Get active officers for an office (optionally filtered by branch)
     */
    public function getOfficers($officeId, Request $request)
    {
        $branchId = $request->query('branch_id');
        $cacheKey = "geo_officers_{$officeId}_" . ($branchId ?: 'all');
        $data = Cache::remember($cacheKey, 1800, function () use ($officeId, $branchId) {
            $query = OfficerProfile::where('office_id', $officeId)
                ->where('status', 'active')
                ->with(['post:id,name_bn,name_en', 'branch:id,name_bn,name_en']);

            if ($branchId) {
                $query->where('office_branch_id', $branchId);
            }

            return $query->select('id', 'office_id', 'office_branch_id', 'post_id', 'name_bn', 'name_en', 'designation_bn', 'employee_id')
                ->get()
                ->toArray();
        });

        return response()->json($data);
    }

    /**
     * Get predefined clickable problem types for a category
     */
    public function getProblemTypes($categoryId)
    {
        $grouped = Cache::remember("geo_problem_types_{$categoryId}", 3600, function () use ($categoryId) {
            $items = ComplaintProblemType::where('category_id', $categoryId)
                ->where('status', 'active')
                ->orderBy('display_order')
                ->get();

            $res = [];
            foreach ($items as $item) {
                $cluster = $item->cluster_name_bn ?: 'সাধারণ';
                if (!isset($res[$cluster])) {
                    $res[$cluster] = [];
                }
                $res[$cluster][] = [
                    'id' => $item->id,
                    'category_id' => $item->category_id,
                    'cluster_name_bn' => $item->cluster_name_bn,
                    'title_bn' => $item->title_bn,
                    'title_en' => $item->title_en,
                    'severity' => $item->severity,
                    'default_sla_days' => $item->default_sla_days,
                    'display_order' => $item->display_order,
                ];
            }
            return $res;
        });

        return response()->json($grouped);
    }

    public function getOffices(Request $request)
    {
        $query = Office::where('status', 'active')->select('id', 'organization_id', 'name_bn', 'name_en', 'address', 'phone', 'district_id', 'upazila_id');

        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->filled('district_id')) {
            $districtOffices = (clone $query)->where(function ($q) use ($request) {
                $q->where('district_id', $request->district_id)
                    ->orWhereNull('district_id');
            })->get();

            if ($districtOffices->isNotEmpty()) {
                return response()->json($districtOffices->toArray());
            }
        }

        return response()->json($query->get()->toArray());
    }
}
