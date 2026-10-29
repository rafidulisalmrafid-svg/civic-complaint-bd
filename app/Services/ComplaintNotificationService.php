<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Notification;
use App\Models\OfficerProfile;
use App\Models\User;
use App\Models\CategoryOfficerAssignment;
use Illuminate\Support\Facades\Log;

class ComplaintNotificationService
{
    /**
     * Dispatch Dual Notifications to Super Admin and Assigned Category/Region Officer
     */
    public static function dispatchNewComplaintNotifications(Complaint $complaint): void
    {
        try {
            $trackingId = $complaint->tracking_id;
            $catName = $complaint->category?->name_bn ?? 'নাগরিক সেবা';
            $divName = $complaint->division?->name_bn ?? 'বিভাগ';

            // 1. Notify all Super Admins
            $adminUsers = User::where('role', 'main_admin')->where('is_active', true)->get();
            foreach ($adminUsers as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'title_bn' => 'নতুন অভিযোগ দাখিল হয়েছে',
                    'message_bn' => "{$divName}ে {$catName} খাতে নতুন অভিযোগ দাখিল হয়েছে। ট্র্যাকিং কোড: {$trackingId}",
                    'type' => 'info',
                    'link' => route('admin.dashboard', ['tracking' => $trackingId]),
                ]);
            }

            // 2. Determine Assigned Officer's User Account
            $notifiedUserIds = [];

            if ($complaint->assigned_officer_id) {
                $officer = OfficerProfile::find($complaint->assigned_officer_id);
                if ($officer && $officer->user_id) {
                    Notification::create([
                        'user_id' => $officer->user_id,
                        'title_bn' => 'আপনার দায়িত্বে নতুন অভিযোগ এসেছে',
                        'message_bn' => "আপনার দায়িত্বপ্রাপ্ত খাতে একটি নতুন অভিযোগ (কোড: {$trackingId}) আপনার প্যানেলে যুক্ত হয়েছে।",
                        'type' => 'warning',
                        'link' => "/officer/complaint/{$complaint->id}",
                    ]);
                    $notifiedUserIds[] = $officer->user_id;
                }
            }

            // 3. Also check if there's an assigned nodal officer for this category & division/district
            $assignments = CategoryOfficerAssignment::with('officerProfile')
                ->where('category_id', $complaint->category_id)
                ->where('is_active', true)
                ->where(function ($q) use ($complaint) {
                    $q->whereNull('division_id')
                      ->orWhere('division_id', $complaint->division_id);
                })
                ->get();

            foreach ($assignments as $asn) {
                $uid = $asn->officerProfile?->user_id;
                if ($uid && !in_array($uid, $notifiedUserIds)) {
                    Notification::create([
                        'user_id' => $uid,
                        'title_bn' => 'আপনার দায়িত্বে নতুন অভিযোগ এসেছে',
                        'message_bn' => "আপনার দায়িত্বপ্রাপ্ত {$catName} খাতে নতুন অভিযোগ (কোড: {$trackingId}) এসেছে।",
                        'type' => 'warning',
                        'link' => "/officer/complaint/{$complaint->id}",
                    ]);
                    $notifiedUserIds[] = $uid;
                }
            }
        } catch (\Throwable $e) {
            Log::error('Failed to dispatch dual notifications: ' . $e->getMessage());
        }
    }
}
