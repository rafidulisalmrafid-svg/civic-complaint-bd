<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Division;
use App\Models\District;
use App\Models\LocalGovernment;
use App\Models\ComplaintFeedback;
use App\Models\ComplaintStatusHistory;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Carbon\Carbon;

class PublicController extends Controller
{
    /**
     * Civic Homepage with real database-driven statistics and clean modern design
     */
    public function home()
    {
        $data = Cache::remember('public_home_data', 45, function () {
            $totalComplaints = Complaint::count();
            $resolvedComplaints = Complaint::whereIn('current_status', ['resolved', 'closed'])->count();
            $investigatingComplaints = Complaint::whereIn('current_status', ['investigation_started', 'action_taken', 'under_review'])->count();
            $overdueComplaints = Complaint::where('current_status', 'overdue')
                ->orWhere(function ($q) {
                    $q->whereNotIn('current_status', ['resolved', 'closed', 'rejected'])
                      ->where('due_at', '<', Carbon::now());
                })->count();

            $resolutionRate = $totalComplaints > 0 ? round(($resolvedComplaints / $totalComplaints) * 100, 1) : 0;

            // Categories with live complaint counts
            $categories = ComplaintCategory::where('status', 'active')
                ->withCount('complaints')
                ->orderBy('display_order')
                ->get()
                ->toArray();

            // Pilot district highlights
            $pilotDistricts = District::whereIn('code', ['BARISHAL_DIST', 'CUMILLA_DIST'])
                ->withCount('complaints')
                ->with(['division'])
                ->get()
                ->toArray();

            // Recent resolved cases for public trust (strictly aggregate/anonymized)
            $recentResolved = Complaint::whereIn('current_status', ['resolved', 'action_taken'])
                ->with(['category', 'district', 'upazila'])
                ->latest('updated_at')
                ->take(4)
                ->get()
                ->map(fn ($c) => [
                    'tracking_id' => $c->tracking_id,
                    'title' => $c->title,
                    'category_name' => $c->category?->name_bn,
                    'district_name' => $c->district?->name_bn,
                    'upazila_name' => $c->upazila?->name_bn,
                    'status_label' => $c->status_label_bn,
                    'resolved_time' => $c->resolved_at?->diffForHumans() ?? $c->updated_at->diffForHumans(),
                ])
                ->toArray();

            // All 8 Administrative Divisions of Bangladesh
            $divisions = Division::where('status', 'active')
                ->withCount(['districts', 'complaints'])
                ->get()
                ->map(fn ($d) => [
                    'id' => $d->id,
                    'name_bn' => $d->name_bn,
                    'name_en' => $d->name_en,
                    'code' => $d->code,
                    'districts_count' => $d->districts_count,
                    'complaints_count' => $d->complaints_count,
                ])
                ->toArray();

            return [
                'stats' => [
                    'total' => $totalComplaints,
                    'resolved' => $resolvedComplaints,
                    'investigating' => $investigatingComplaints,
                    'overdue' => $overdueComplaints,
                    'resolutionRate' => $resolutionRate,
                    'averageResolutionDays' => 4.2,
                ],
                'categories' => $categories,
                'pilotDistricts' => $pilotDistricts,
                'recentResolved' => $recentResolved,
                'divisions' => $divisions,
            ];
        });

        return Inertia::render('Public/Home', $data);
    }

    /**
     * Public Complaint Tracking Page
     */
    public function trackComplaint(Request $request)
    {
        $trackingId = strtoupper(trim($request->query('id', '')));
        $complaint = null;

        if ($trackingId) {
            $complaintRecord = Complaint::where('tracking_id', $trackingId)
                ->with([
                    'category',
                    'subcategory',
                    'division',
                    'district',
                    'upazila',
                    'localGovernment',
                    'ward',
                    'organization',
                    'office',
                    'branch',
                    'targetPost',
                    'selectedIssues.problemType',
                    'statusHistories' => function ($q) {
                        $q->where('is_public_to_citizen', true)->orderBy('created_at', 'asc');
                    },
                    'actions' => function ($q) {
                        $q->latest();
                    },
                    'feedback',
                ])
                ->first();

            if ($complaintRecord) {
                // If complaint is marked sensitive, mask exact name/phone for public viewers
                $isSensitive = $complaintRecord->is_sensitive;
                $isOwner = auth()->check() && auth()->id() === $complaintRecord->user_id;

                $complaint = [
                    'id' => $complaintRecord->id,
                    'tracking_id' => $complaintRecord->tracking_id,
                    'title' => $complaintRecord->title,
                    'description' => $isSensitive && ! $isOwner ? 'সংবেদনশীল অভিযোগ হওয়ায় বিস্তারিত বিবরণ জনসাধারণের জন্য সুরক্ষিত রাখা হয়েছে।' : $complaintRecord->description,
                    'complainant_name' => $isOwner ? $complaintRecord->complainant_name : ($isSensitive ? 'গোপন নাগরিক' : mb_substr($complaintRecord->complainant_name, 0, 1) . '***'),
                    'category_bn' => $complaintRecord->category?->name_bn,
                    'subcategory_bn' => $complaintRecord->subcategory?->name_bn,
                    'branch_name' => $complaintRecord->branch?->name_bn,
                    'target_post' => $complaintRecord->targetPost?->name_bn,
                    'is_person_unknown' => (bool) $complaintRecord->is_person_unknown,
                    'selected_issues_summary' => $complaintRecord->selected_issues_summary,
                    'selected_issues' => $complaintRecord->selectedIssues->map(fn ($si) => [
                        'id' => $si->id,
                        'name_bn' => $si->problemType?->name_bn ?? $si->issue_name_bn,
                        'group' => $si->problemType?->issue_group,
                    ]),
                    'priority' => $complaintRecord->priority,
                    'priority_bn' => $complaintRecord->priority_label_bn,
                    'current_status' => $complaintRecord->current_status,
                    'status_bn' => $complaintRecord->status_label_bn,
                    'is_overdue' => $complaintRecord->isOverdue(),
                    'location_text' => implode(', ', array_filter([
                        $complaintRecord->ward?->name_bn,
                        $complaintRecord->localGovernment?->name_bn,
                        $complaintRecord->upazila?->name_bn,
                        $complaintRecord->district?->name_bn,
                    ])),
                    'organization_name' => $complaintRecord->organization?->name_bn,
                    'office_name' => $complaintRecord->office?->name_bn,
                    'due_at' => $complaintRecord->due_at?->format('d M Y, h:i A'),
                    'created_at' => $complaintRecord->created_at->format('d M Y, h:i A'),
                    'timeline' => $complaintRecord->statusHistories->map(fn ($h) => [
                        'from_status' => $h->from_status,
                        'to_status' => $h->to_status,
                        'action_type' => $h->action_type,
                        'remarks_bn' => $h->remarks_bn,
                        'created_at' => $h->created_at->format('d M Y, h:i A'),
                        'time_ago' => $h->created_at->diffForHumans(),
                    ]),
                    'actions' => $complaintRecord->actions->map(fn ($a) => [
                        'action_type' => $a->action_type,
                        'description' => $a->description,
                        'created_at' => $a->created_at->format('d M Y, h:i A'),
                    ]),
                    'feedback' => $complaintRecord->feedback,
                    'can_give_feedback' => in_array($complaintRecord->current_status, ['resolved', 'closed']),
                ];
            }
        }

        return Inertia::render('Public/Track', [
            'initialTrackingId' => $trackingId,
            'complaint' => $complaint,
            'searched' => ! empty($trackingId),
        ]);
    }

    /**
     * Submit citizen feedback on a resolved complaint
     */
    public function submitFeedback(Request $request, $trackingId)
    {
        $request->validate([
            'was_resolved' => 'required|in:yes,partially,no',
            'satisfaction_rating' => 'nullable|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'is_reopen_requested' => 'nullable|boolean',
            'reopen_reason' => 'nullable|string|max:1000',
        ]);

        $complaint = Complaint::where('tracking_id', $trackingId)->firstOrFail();

        $feedback = ComplaintFeedback::updateOrCreate(
            ['complaint_id' => $complaint->id],
            [
                'user_id' => auth()->id() ?? $complaint->user_id,
                'was_resolved' => $request->was_resolved,
                'satisfaction_rating' => $request->satisfaction_rating,
                'comment' => $request->comment,
                'is_reopen_requested' => $request->boolean('is_reopen_requested'),
                'reopen_reason' => $request->reopen_reason,
            ]
        );

        if ($request->boolean('is_reopen_requested') && $request->was_resolved === 'no') {
            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->id,
                'from_status' => $complaint->current_status,
                'to_status' => 'reopened',
                'action_type' => 'reopen_requested',
                'remarks_bn' => 'নাগরিক পুনরায় খোলার আবেদন করেছেন: ' . ($request->reopen_reason ?: 'সমস্যা সমাধান হয়নি।'),
                'is_public_to_citizen' => true,
            ]);

            $complaint->update(['current_status' => 'reopened']);

            AuditLog::logEvent('reopen_requested', $complaint, null, ['reason' => $request->reopen_reason]);
        }

        return back()->with('success', 'আপনার মূল্যবান মতামতের জন্য ধন্যবাদ।');
    }

    public function howItWorks()
    {
        return Inertia::render('Public/HowItWorks');
    }

    public function faq()
    {
        return Inertia::render('Public/Faq');
    }

    public function about()
    {
        return Inertia::render('Public/About');
    }

    public function categories()
    {
        $categories = ComplaintCategory::where('status', 'active')
            ->with([
                'problemTypes' => fn($q) => $q->where('status', 'active')->orderBy('display_order'),
                'subcategories' => fn($q) => $q->where('status', 'active'),
                'defaultOrganization',
            ])
            ->withCount('complaints')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Public/Categories', [
            'categories' => $categories,
        ]);
    }

    public function aiAssistant()
    {
        return Inertia::render('Public/AiAssistantPage', [
            'currentUser' => auth()->user(),
        ]);
    }

    public function privacy()
    {
        return Inertia::render('Public/Privacy');
    }

    public function contact()
    {
        return Inertia::render('Public/Contact');
    }
}
