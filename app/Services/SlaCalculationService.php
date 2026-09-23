<?php

namespace App\Services;

use App\Models\ComplaintCategory;
use App\Models\SlaRule;
use Carbon\Carbon;

class SlaCalculationService
{
    /**
     * Calculate due date based on Category and Priority
     */
    public static function calculateDueDate(int $categoryId, string $priority = 'medium'): Carbon
    {
        $rule = SlaRule::where('is_active', true)
            ->where(function ($q) use ($categoryId) {
                $q->whereNull('category_id')->orWhere('category_id', $categoryId);
            })
            ->where('priority', $priority)
            ->first();

        if ($rule && $rule->resolution_sla_hours > 0) {
            return Carbon::now()->addHours($rule->resolution_sla_hours);
        }

        // Category default SLA days fallback
        $category = ComplaintCategory::find($categoryId);
        $days = $category?->default_sla_days ?? 7;

        // Multiply by priority factor
        $hours = match ($priority) {
            'urgent' => max(24, intval($days * 24 * 0.25)),
            'high' => max(48, intval($days * 24 * 0.5)),
            'low' => intval($days * 24 * 1.5),
            default => $days * 24,
        };

        return Carbon::now()->addHours($hours);
    }
}
