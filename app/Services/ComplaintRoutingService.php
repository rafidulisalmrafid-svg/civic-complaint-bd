<?php

namespace App\Services;

use App\Models\ComplaintCategory;
use App\Models\Office;
use App\Models\OfficerProfile;
use App\Models\RoutingRule;

class ComplaintRoutingService
{
    /**
     * Resolve target Organization, Office, and Officer for a complaint
     */
    public static function resolveRoute(
        int $categoryId,
        ?int $subcategoryId = null,
        ?int $divisionId = null,
        ?int $districtId = null,
        ?int $upazilaId = null
    ): array {
        // 1. Check dynamic routing rules (ordered by specificity)
        $rules = RoutingRule::where('is_active', true)
            ->where(function ($q) use ($categoryId) {
                $q->whereNull('category_id')->orWhere('category_id', $categoryId);
            })
            ->where(function ($q) use ($subcategoryId) {
                $q->whereNull('subcategory_id')->orWhere('subcategory_id', $subcategoryId);
            })
            ->where(function ($q) use ($districtId) {
                $q->whereNull('district_id')->orWhere('district_id', $districtId);
            })
            ->where(function ($q) use ($upazilaId) {
                $q->whereNull('upazila_id')->orWhere('upazila_id', $upazilaId);
            })
            ->orderByRaw('CASE WHEN upazila_id IS NOT NULL THEN 1 ELSE 2 END')
            ->orderByRaw('CASE WHEN district_id IS NOT NULL THEN 1 ELSE 2 END')
            ->orderByRaw('CASE WHEN subcategory_id IS NOT NULL THEN 1 ELSE 2 END')
            ->first();

        if ($rules) {
            $office = $rules->targetOffice;
            if (! $office && $rules->target_organization_id) {
                // Find office in district or upazila for this organization
                $office = Office::where('organization_id', $rules->target_organization_id)
                    ->where(function ($q) use ($upazilaId, $districtId) {
                        if ($upazilaId) $q->where('upazila_id', $upazilaId);
                        elseif ($districtId) $q->where('district_id', $districtId);
                    })
                    ->first();
            }

            return [
                'organization_id' => $rules->target_organization_id,
                'office_id' => $office?->id ?? $rules->target_office_id,
                'assigned_officer_id' => null, // Let office queue/supervisor assign
            ];
        }

        // 2. Default fallback from category
        $category = ComplaintCategory::find($categoryId);
        $orgId = $category?->default_organization_id;

        $office = null;
        if ($orgId) {
            $office = Office::where('organization_id', $orgId)
                ->where(function ($q) use ($upazilaId, $districtId) {
                    if ($upazilaId) $q->where('upazila_id', $upazilaId);
                    elseif ($districtId) $q->where('district_id', $districtId);
                })
                ->first();
        }

        return [
            'organization_id' => $orgId,
            'office_id' => $office?->id,
            'assigned_officer_id' => null,
        ];
    }
}
