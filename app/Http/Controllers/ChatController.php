<?php

namespace App\Http\Controllers;

use App\Models\AdminOfficerMessage;
use App\Models\Complaint;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ChatController extends Controller
{
    /**
     * Fetch conversation thread between Admin and Officer for a complaint
     */
    public function getMessages(Request $request)
    {
        $request->validate([
            'complaint_id' => 'required|exists:complaints,id',
        ]);

        $complaintId = $request->input('complaint_id');
        $user = auth()->user();

        $messages = AdminOfficerMessage::with([
            'sender:id,name,role,email',
            'receiver:id,name,role,email',
        ])
        ->where('complaint_id', $complaintId)
        ->orderBy('created_at', 'asc')
        ->get();

        // Mark incoming messages as read
        AdminOfficerMessage::where('complaint_id', $complaintId)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);

        return response()->json([
            'success' => true,
            'messages' => $messages,
        ]);
    }

    /**
     * Send direct message between Admin and Officer
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'complaint_id' => 'required|exists:complaints,id',
            'message' => 'required|string|max:3000',
            'receiver_id' => 'nullable|exists:users,id',
        ], [
            'message.required' => 'বার্তার বিবরণ লিখুন।',
        ]);

        $sender = auth()->user();
        $complaint = Complaint::findOrFail($request->input('complaint_id'));
        $receiverId = $request->input('receiver_id');

        // If officer is sending, receiver defaults to Super Admin
        if (! $receiverId) {
            if ($sender->isMainAdmin()) {
                // Admin sending to assigned officer
                $assignedOfficer = $complaint->assignedOfficer;
                $receiverId = $assignedOfficer?->user_id ?? User::where('role', 'officer')->first()?->id;
            } else {
                // Officer sending to Main Admin
                $receiverId = User::where('role', 'main_admin')->first()?->id;
            }
        }

        if (! $receiverId) {
            return response()->json([
                'success' => false,
                'message' => 'বার্তার প্রাপক নির্বাচন করা যায়নি।',
            ], 422);
        }

        $messageRecord = AdminOfficerMessage::create([
            'complaint_id' => $complaint->id,
            'sender_id' => $sender->id,
            'receiver_id' => $receiverId,
            'message' => trim($request->input('message')),
            'is_read' => false,
        ]);

        $messageRecord->load(['sender:id,name,role,email', 'receiver:id,name,role,email']);

        // Send instant notification to receiver
        $senderTitle = $sender->isMainAdmin() ? 'সুপার অ্যাডমিন' : 'দায়িত্বপ্রাপ্ত কর্মকর্তা (' . $sender->name . ')';
        Notification::create([
            'user_id' => $receiverId,
            'title_bn' => "{$senderTitle} থেকে নতুন বার্তা এসেছে",
            'message_bn' => "অভিযোগ #{$complaint->tracking_id} নিয়ে নতুন বার্তা: " . mb_substr($messageRecord->message, 0, 80) . '...',
            'type' => 'info',
            'link' => $sender->isMainAdmin() ? "/officer/complaint/{$complaint->id}" : "/officer/complaint/{$complaint->id}",
        ]);

        return response()->json([
            'success' => true,
            'message' => $messageRecord,
        ]);
    }
}
