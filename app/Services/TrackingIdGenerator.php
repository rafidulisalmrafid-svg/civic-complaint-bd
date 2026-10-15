<?php

namespace App\Services;

use App\Models\Complaint;
use Carbon\Carbon;

class TrackingIdGenerator
{
    /**
     * Generate standard Citizen Grievance Tracking ID (e.g. CGR-2026-000123)
     */
    public static function generate(?int $divisionId = null): string
    {
        $year = Carbon::now()->format('Y');

        // Generate collision-safe sequential ID
        $maxAttempts = 15;
        for ($i = 0; $i < $maxAttempts; $i++) {
            $count = Complaint::whereYear('created_at', $year)->count() + 1 + $i;
            $sequence = str_pad((string) $count, 6, '0', STR_PAD_LEFT);
            $trackingId = "CGR-{$year}-{$sequence}";

            if (! Complaint::where('tracking_id', $trackingId)->exists()) {
                return $trackingId;
            }
        }

        // Random fallback if sequence collision
        return "CGR-{$year}-" . str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }
}
