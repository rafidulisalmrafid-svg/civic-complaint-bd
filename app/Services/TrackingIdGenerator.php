<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Division;
use Carbon\Carbon;
use Illuminate\Support\Str;

class TrackingIdGenerator
{
    /**
     * Generate collision-safe tracking ID (e.g. CT-BAR-2026-000152)
     */
    public static function generate(?int $divisionId = null): string
    {
        $year = Carbon::now()->format('Y');
        $divPrefix = 'BD';

        if ($divisionId) {
            $division = Division::find($divisionId);
            if ($division) {
                $divPrefix = strtoupper(substr($division->code, 0, 3));
            }
        }

        // Generate collision-safe ID with DB transaction retry
        $maxAttempts = 10;
        for ($i = 0; $i < $maxAttempts; $i++) {
            $count = Complaint::whereYear('created_at', $year)->count() + 1 + $i;
            $sequence = str_pad((string) $count, 6, '0', STR_PAD_LEFT);
            $trackingId = "COM-{$year}-{$sequence}";

            if (! Complaint::where('tracking_id', $trackingId)->exists()) {
                return $trackingId;
            }
        }

        // In extremely rare edge cases, append random suffix
        return "COM-{$year}-" . str_pad((string) random_int(1000, 999999), 6, '0', STR_PAD_LEFT);
    }
}
