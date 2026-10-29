<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintStatusHistory;
use App\Models\ComplaintInternalNote;
use App\Models\ComplaintAction;
use App\Models\ComplaintAttachment;
use App\Models\ComplaintAssignment;
use App\Models\Office;
use App\Models\OfficerProfile;
use App\Models\AuditLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class OfficerComplaintController extends Controller
{
    /**
     * Officer Queue & Dashboard
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $officerProfile = $user->officerProfile;

        $query = Complaint::with(['category', 'subcategory', 'district', 'upazila', 'office', 'assignedOfficer', 'feedback']);

        $assignedCategoryIds = [];
        if ($officerProfile) {
            $assignedCategoryIds = \App\Models\CategoryOfficerAssignment::where('is_active', true)
                ->where(function ($aq) use ($officerProfile, $user) {
                    $aq->where('officer_profile_id', $officerProfile->id)
                      ->orWhere('user_id', $user->id);
                })
                ->pluck('category_id')
                ->toArray();
        }

        // Scope access based on officer profile & role:
        // STRICT RULE: If not Super Admin, officer can ONLY see complaints in their assigned scope
        if (! $user->isMainAdmin()) {
            $query->where(function ($q) use ($officerProfile, $user, $assignedCategoryIds) {
                if ($officerProfile) {
                    $q->where('assigned_officer_id', $officerProfile->id);

                    if (!empty($assignedCategoryIds)) {
                        $q->orWhereIn('category_id', $assignedCategoryIds);
                    } else {
                        $q->orWhere('office_id', $officerProfile->office_id);
                    }

                    if ($user->isAreaOfficer() && $officerProfile->upazila_id) {
                        $q->orWhere('upazila_id', $officerProfile->upazila_id);
                    }
                } else {
                    $q->whereRaw('0 = 1');
                }
            });
        }

        $tab = $request->query('tab', 'assigned');

        if ($tab === 'assigned' && $officerProfile) {
            $query->where('assigned_officer_id', $officerProfile->id);
        } elseif ($tab === 'office' && $officerProfile) {
            $query->where('office_id', $officerProfile->office_id)->whereNull('assigned_officer_id');
        } elseif ($tab === 'investigating') {
            $query->whereIn('current_status', ['investigation_started', 'action_taken', 'under_review']);
        } elseif ($tab === 'overdue') {
            $query->where(function ($q) {
                $q->where('current_status', 'overdue')
                  ->orWhere(function ($sub) {
                      $sub->whereNotIn('current_status', ['resolved', 'closed', 'rejected'])
                          ->where('due_at', '<', Carbon::now());
                  });
            });
        } elseif ($tab === 'resolved') {
            $query->whereIn('current_status', ['resolved', 'closed']);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('tracking_id', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('complainant_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $complaints = $query->latest()->paginate(12)->withQueryString();

        // Queue Statistics (Single aggregated query)
        $baseQuery = Complaint::query();
        if (! $user->isMainAdmin() && $officerProfile) {
            $baseQuery->where(function ($q) use ($officerProfile, $assignedCategoryIds) {
                $q->where('assigned_officer_id', $officerProfile->id);
                if (!empty($assignedCategoryIds)) {
                    $q->orWhereIn('category_id', $assignedCategoryIds);
                } else {
                    $q->orWhere('office_id', $officerProfile->office_id);
                }
            });
        }

        $officerId = (int) ($officerProfile?->id ?? 0);
        $officeId = (int) ($officerProfile?->office_id ?? 0);
        $nowStr = Carbon::now()->toDateTimeString();

        $statsRow = (clone $baseQuery)
            ->selectRaw("
                SUM(CASE WHEN assigned_officer_id = {$officerId} THEN 1 ELSE 0 END) as assigned,
                SUM(CASE WHEN office_id = {$officeId} AND assigned_officer_id IS NULL THEN 1 ELSE 0 END) as office,
                SUM(CASE WHEN current_status IN ('investigation_started', 'action_taken') THEN 1 ELSE 0 END) as investigating,
                SUM(CASE WHEN current_status = 'overdue' OR (current_status NOT IN ('resolved', 'closed', 'rejected') AND due_at < '{$nowStr}') THEN 1 ELSE 0 END) as overdue,
                SUM(CASE WHEN current_status IN ('resolved', 'closed') THEN 1 ELSE 0 END) as resolved
            ")
            ->first();

        $stats = [
            'assigned' => (int) ($statsRow->assigned ?? 0),
            'office' => (int) ($statsRow->office ?? 0),
            'investigating' => (int) ($statsRow->investigating ?? 0),
            'overdue' => (int) ($statsRow->overdue ?? 0),
            'resolved' => (int) ($statsRow->resolved ?? 0),
        ];

        return Inertia::render('Officer/Dashboard', [
            'complaints' => $complaints,
            'stats' => $stats,
            'currentTab' => $tab,
            'filters' => $request->only(['search', 'priority', 'tab']),
            'officerProfile' => $officerProfile ? [
                'name_bn' => $officerProfile->name_bn,
                'designation_bn' => $officerProfile->designation_bn,
                'office_name' => $officerProfile->office?->name_bn,
            ] : null,
        ]);
    }

    /**
     * Show complaint details with internal notes & action panels
     */
    public function show($id)
    {
        $user = auth()->user();
        $officerProfile = $user?->officerProfile;

        $complaint = Complaint::with([
            'category',
            'subcategory',
            'division',
            'district',
            'upazila',
            'localGovernment',
            'ward',
            'area',
            'organization',
            'office',
            'assignedOfficer',
            'specificOfficer',
            'attachments',
            'statusHistories.changedBy',
            'internalNotes.author',
            'actions.officer',
            'actions.proofAttachment',
            'feedback',
            'adminOfficerMessages.sender',
            'adminOfficerMessages.receiver',
        ])->findOrFail($id);

        // Security Authorization Check:
        if ($user && ! $user->isMainAdmin()) {
            $assignedCategoryIds = $officerProfile
                ? \App\Models\CategoryOfficerAssignment::where('is_active', true)
                    ->where(function ($aq) use ($officerProfile, $user) {
                        $aq->where('officer_profile_id', $officerProfile->id)
                           ->orWhere('user_id', $user->id);
                    })
                    ->pluck('category_id')
                    ->toArray()
                : [];

            $isAllowed = false;
            if ($officerProfile && $complaint->assigned_officer_id === $officerProfile->id) {
                $isAllowed = true;
            } elseif ($officerProfile && in_array($complaint->category_id, $assignedCategoryIds)) {
                $isAllowed = true;
            } elseif ($officerProfile && $complaint->office_id === $officerProfile->office_id) {
                $isAllowed = true;
            }

            if (! $isAllowed) {
                abort(403, 'আপনার এই ক্যাটাগরি বা বিভাগের অভিযোগ দেখার অনুমতি নেই।');
            }
        }

        // Mark as read automatically when opened
        if ($user && $user->isMainAdmin()) {
            if (! $complaint->is_read_by_admin) {
                $complaint->update([
                    'is_read_by_admin' => true,
                    'admin_read_at' => Carbon::now(),
                ]);
            }
        } elseif ($user) {
            if (! $complaint->is_read_by_officer) {
                $complaint->update([
                    'is_read_by_officer' => true,
                    'officer_read_at' => Carbon::now(),
                ]);
            }
        }

        $offices = Office::where('status', 'active')->select('id', 'name_bn', 'name_en')->get();
        $officers = OfficerProfile::where('status', 'active')->select('id', 'name_bn', 'designation_bn', 'office_id')->get();

        return Inertia::render('Officer/ComplaintDetail', [
            'complaint' => $complaint,
            'offices' => $offices,
            'officers' => $officers,
            'currentUser' => $user,
        ]);
    }

    /**
     * Update Complaint Status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:received,under_review,assigned,forwarded,investigation_started,action_taken,resolution_submitted,resolved,closed,rejected',
            'remarks_bn' => 'required|string|max:1000',
            'is_public_to_citizen' => 'nullable|boolean',
        ], [
            'status.required' => 'অবস্থা নির্বাচন করুন।',
            'remarks_bn.required' => 'পদক্ষেপ বা পর্যালোচনার বিবরণ প্রদান করুন।',
        ]);

        $complaint = Complaint::findOrFail($id);
        $fromStatus = $complaint->current_status;
        $toStatus = $request->status;
        $user = $request->user();

        DB::transaction(function () use ($complaint, $fromStatus, $toStatus, $request, $user) {
            $complaint->current_status = $toStatus;
            if ($toStatus === 'resolved') {
                $complaint->resolved_at = Carbon::now();
            } elseif ($toStatus === 'closed') {
                $complaint->closed_at = Carbon::now();
            }
            $complaint->save();

            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->id,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'action_type' => 'status_updated',
                'remarks_bn' => $request->remarks_bn,
                'changed_by_user_id' => $user->id,
                'is_public_to_citizen' => $request->boolean('is_public_to_citizen', true),
            ]);

            AuditLog::logEvent('status_changed', $complaint, ['status' => $fromStatus], ['status' => $toStatus]);

            // Notify citizen
            Notification::create([
                'user_id' => $complaint->user_id,
                'title_bn' => "অভিযোগের অবস্থা পরিবর্তিত হয়েছে: {$complaint->status_label_bn}",
                'message_bn' => $request->remarks_bn,
                'type' => in_array($toStatus, ['resolved', 'action_taken']) ? 'success' : 'info',
                'link' => route('complaint.track', ['id' => $complaint->tracking_id]),
            ]);
        });

        return back()->with('success', 'অভিযোগের অবস্থা সফলভাবে আপডেট হয়েছে।');
    }

    /**
     * Add Internal Confidential Note
     */
    public function addInternalNote(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|max:2000',
        ]);

        $complaint = Complaint::findOrFail($id);

        ComplaintInternalNote::create([
            'complaint_id' => $complaint->id,
            'author_user_id' => $request->user()->id,
            'note' => $request->note,
            'is_confidential' => true,
        ]);

        AuditLog::logEvent('internal_note_added', $complaint);

        return back()->with('success', 'অভ্যন্তরীণ নোট সংরক্ষণ করা হয়েছে (এটি নাগরিক দেখতে পাবেন না)।');
    }

    /**
     * Forward / Reassign Complaint
     */
    public function forwardComplaint(Request $request, $id)
    {
        $request->validate([
            'target_office_id' => 'required|exists:offices,id',
            'target_officer_id' => 'nullable|exists:officer_profiles,id',
            'instruction' => 'required|string|max:1000',
        ]);

        $complaint = Complaint::findOrFail($id);
        $user = $request->user();

        DB::transaction(function () use ($complaint, $request, $user) {
            $prevOfficer = $complaint->assigned_officer_id;
            $prevOffice = $complaint->office_id;

            $complaint->update([
                'office_id' => $request->target_office_id,
                'assigned_officer_id' => $request->target_officer_id,
                'current_status' => 'forwarded',
            ]);

            ComplaintAssignment::create([
                'complaint_id' => $complaint->id,
                'assigned_by_user_id' => $user->id,
                'assigned_to_officer_id' => $request->target_officer_id ?: ($complaint->assigned_officer_id ?: 1),
                'assigned_office_id' => $request->target_office_id,
                'instruction' => $request->instruction,
                'status' => 'active',
            ]);

            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->id,
                'from_status' => 'forwarded',
                'to_status' => 'forwarded',
                'action_type' => 'forwarded',
                'remarks_bn' => 'অভিযোগটি সংশ্লিষ্ট দপ্তরে ফরওয়ার্ড করা হয়েছে। নির্দেশনা: ' . $request->instruction,
                'changed_by_user_id' => $user->id,
                'is_public_to_citizen' => true,
            ]);

            AuditLog::logEvent('complaint_reassigned', $complaint, [
                'office_id' => $prevOffice,
                'officer_id' => $prevOfficer,
            ], [
                'office_id' => $request->target_office_id,
                'officer_id' => $request->target_officer_id,
                'instruction' => $request->instruction,
            ]);
        });

        return back()->with('success', 'অভিযোগ সফলভাবে ফরওয়ার্ড করা হয়েছে।');
    }

    /**
     * Submit Official Resolution with Proof
     */
    public function submitResolution(Request $request, $id)
    {
        if (!$request->has('description') && $request->has('resolution_summary')) {
            $request->merge(['description' => $request->input('resolution_summary')]);
        }

        $request->validate([
            'description' => 'required|string|min:15|max:3000',
            'action_type' => 'required|string',
            'proof_file' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx',
        ], [
            'description.required' => 'গৃহীত ব্যবস্থা ও সমাধানের বিবরণ লিখুন।',
            'description.min' => 'গৃহীত ব্যবস্থা ও সমাধানের বিবরণ কমপক্ষে ১৫ অক্ষরের হতে হবে।',
        ]);

        $complaint = Complaint::findOrFail($id);
        $user = $request->user();
        $officerProfile = $user->officerProfile;

        DB::transaction(function () use ($complaint, $request, $user, $officerProfile) {
            $proofId = null;
            if ($request->hasFile('proof_file')) {
                $file = $request->file('proof_file');
                $path = $file->store('resolution_proofs/' . $complaint->id, 'public');
                $att = ComplaintAttachment::create([
                    'complaint_id' => $complaint->id,
                    'file_path' => $path,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                    'is_private' => false,
                    'uploaded_by_user_id' => $user->id,
                ]);
                $proofId = $att->id;
            }

            ComplaintAction::create([
                'complaint_id' => $complaint->id,
                'officer_id' => $officerProfile?->id ?? 1,
                'action_type' => $request->action_type,
                'description' => $request->description,
                'proof_attachment_id' => $proofId,
            ]);

            $complaint->update([
                'current_status' => 'resolved',
                'resolved_at' => Carbon::now(),
            ]);

            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->id,
                'from_status' => $complaint->current_status,
                'to_status' => 'resolved',
                'action_type' => 'resolved',
                'remarks_bn' => 'কর্তৃপক্ষ কর্তৃক কার্যকর ব্যবস্থা গ্রহণ করে অভিযোগটির সমাধান করা হয়েছে: ' . $request->description,
                'changed_by_user_id' => $user->id,
                'is_public_to_citizen' => true,
            ]);

            AuditLog::logEvent('complaint_resolved', $complaint, null, ['description' => $request->description]);

            Notification::create([
                'user_id' => $complaint->user_id,
                'title_bn' => 'আপনার অভিযোগটি সমাধান হয়েছে',
                'message_bn' => 'কর্তৃপক্ষ কার্যকর ব্যবস্থা গ্রহণ করেছে। বিস্তারিত দেখতে ট্র্যাকিং পেজে যান এবং আপনার মতামত প্রদান করুন।',
                'type' => 'success',
                'link' => route('complaint.track', ['id' => $complaint->tracking_id]),
            ]);
        });

        return back()->with('success', 'সমাধান সফলভাবে দাখিল হয়েছে এবং নাগরিককে অবহিত করা হয়েছে।');
    }
}
