<?php

namespace App\Http\Controllers\Citizen;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Notification;
use App\Models\Citizen;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CitizenDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $statusFilter = $request->query('status');

        $query = Complaint::where('user_id', $user->id)
            ->with(['category', 'district', 'upazila', 'office', 'feedback'])
            ->latest();

        if ($statusFilter && $statusFilter !== 'all') {
            if ($statusFilter === 'active') {
                $query->whereNotIn('current_status', ['resolved', 'closed', 'rejected']);
            } elseif ($statusFilter === 'resolved') {
                $query->whereIn('current_status', ['resolved', 'closed']);
            } else {
                $query->where('current_status', $statusFilter);
            }
        }

        $complaints = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Complaint::where('user_id', $user->id)->count(),
            'active' => Complaint::where('user_id', $user->id)->whereNotIn('current_status', ['resolved', 'closed', 'rejected'])->count(),
            'resolved' => Complaint::where('user_id', $user->id)->whereIn('current_status', ['resolved', 'closed'])->count(),
            'under_investigation' => Complaint::where('user_id', $user->id)->whereIn('current_status', ['investigation_started', 'action_taken'])->count(),
        ];

        return Inertia::render('Citizen/Dashboard', [
            'complaints' => $complaints,
            'stats' => $stats,
            'currentFilter' => $statusFilter ?: 'all',
        ]);
    }

    public function show($trackingId)
    {
        $user = auth()->user();
        $complaint = Complaint::where('user_id', $user->id)
            ->where('tracking_id', $trackingId)
            ->with([
                'category',
                'subcategory',
                'district',
                'upazila',
                'localGovernment',
                'ward',
                'organization',
                'office',
                'attachments',
                'statusHistories' => fn ($q) => $q->where('is_public_to_citizen', true)->orderBy('created_at', 'asc'),
                'actions',
                'feedback',
            ])
            ->firstOrFail();

        return Inertia::render('Citizen/ComplaintDetail', [
            'complaint' => $complaint,
        ]);
    }

    public function profile()
    {
        $user = auth()->user()->load('citizenProfile');

        return Inertia::render('Citizen/Profile', [
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'nid_number' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        Citizen::updateOrCreate(
            ['user_id' => $user->id],
            [
                'nid_number' => $request->nid_number,
                'address' => $request->address,
            ]
        );

        return back()->with('success', 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।');
    }

    public function notifications(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Citizen/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function markNotificationAsRead($id)
    {
        $notification = Notification::where('user_id', auth()->id())->findOrFail($id);
        $notification->update(['is_read' => true]);

        return back();
    }
}
