<?php

namespace App\Services;

use App\Models\ComplaintCategory;
use App\Models\Office;
use App\Models\OfficeBranch;
use App\Models\OfficerProfile;
use App\Models\RoutingRule;

class ComplaintRoutingService
{
    /**
     * Resolve target Organization, Office, Branch, and Responsible Officer for a complaint
     * following the 4-tier progressive hierarchy:
     * 1. Direct Person / Officer (if citizen selected a specific officer)
     * 2. Branch / Department Responsible Officer (if person unknown or department-level issue)
     * 3. Office Focal Point / Head Officer
     * 4. District Complaint Officer (if no office focal found)
     */
    public static function resolveRoute(
        int $categoryId,
        ?int $subcategoryId = null,
        ?int $divisionId = null,
        ?int $districtId = null,
        ?int $upazilaId = null,
        ?int $officeId = null,
        ?int $branchId = null,
        ?int $specificOfficerId = null,
        bool $isPersonUnknown = false
    ): array {
        $assignedOfficerId = null;

        // Tier 1: Direct Person-Level Assignment
        if (! $isPersonUnknown && $specificOfficerId) {
            $officer = OfficerProfile::where('id', $specificOfficerId)->where('status', 'active')->first();
            if ($officer) {
                return [
                    'organization_id' => $officer->organization_id,
                    'office_id' => $officer->office_id,
                    'office_branch_id' => $officer->office_branch_id ?? $branchId,
                    'assigned_officer_id' => $officer->id,
                    'routing_tier' => 'tier_1_person',
                ];
            }
        }

        // Tier 2: Branch / Department Responsible Officer
        if ($branchId) {
            $branchOfficer = OfficerProfile::where('office_branch_id', $branchId)
                ->where('status', 'active')
                ->orderByDesc('is_office_focal_point')
                ->first();

            if ($branchOfficer) {
                return [
                    'organization_id' => $branchOfficer->organization_id,
                    'office_id' => $branchOfficer->office_id,
                    'office_branch_id' => $branchId,
                    'assigned_officer_id' => $branchOfficer->id,
                    'routing_tier' => 'tier_2_branch',
                ];
            }
        }

        // Tier 3: Office Focal Point / Head Officer
        if ($officeId) {
            $office = Office::find($officeId);
            $officeFocal = OfficerProfile::where('office_id', $officeId)
                ->where('status', 'active')
                ->where('is_office_focal_point', true)
                ->first()
                ?? OfficerProfile::where('office_id', $officeId)->where('status', 'active')->first();

            if ($officeFocal) {
                return [
                    'organization_id' => $officeFocal->organization_id ?? $office?->organization_id,
                    'office_id' => $officeId,
                    'office_branch_id' => $branchId,
                    'assigned_officer_id' => $officeFocal->id,
                    'routing_tier' => 'tier_3_office_focal',
                ];
            }

            if ($office) {
                return [
                    'organization_id' => $office->organization_id,
                    'office_id' => $officeId,
                    'office_branch_id' => $branchId,
                    'assigned_officer_id' => null,
                    'routing_tier' => 'tier_3_office_queue',
                ];
            }
        }

        // Tier 4: District Complaint Officer
        if ($districtId) {
            $districtOfficer = OfficerProfile::where('district_id', $districtId)
                ->where('is_district_complaint_officer', true)
                ->where('status', 'active')
                ->first();

            if ($districtOfficer) {
                return [
                    'organization_id' => $districtOfficer->organization_id,
                    'office_id' => $districtOfficer->office_id,
                    'office_branch_id' => $branchId,
                    'assigned_officer_id' => $districtOfficer->id,
                    'routing_tier' => 'tier_4_district_complaint_officer',
                ];
            }
        }

        // Fallback: Dynamic Routing Rules
        $rules = RoutingRule::where('is_active', true)
            ->where(function ($q) use ($categoryId) {
                $q->whereNull('category_id')->orWhere('category_id', $categoryId);
            })
            ->where(function ($q) use ($districtId) {
                $q->whereNull('district_id')->orWhere('district_id', $districtId);
            })
            ->where(function ($q) use ($upazilaId) {
                $q->whereNull('upazila_id')->orWhere('upazila_id', $upazilaId);
            })
            ->orderByRaw('CASE WHEN upazila_id IS NOT NULL THEN 1 ELSE 2 END')
            ->orderByRaw('CASE WHEN district_id IS NOT NULL THEN 1 ELSE 2 END')
            ->first();

        if ($rules) {
            return [
                'organization_id' => $rules->target_organization_id,
                'office_id' => $rules->target_office_id,
                'office_branch_id' => $branchId,
                'assigned_officer_id' => null,
                'routing_tier' => 'fallback_routing_rule',
            ];
        }

        // Final Category Default Fallback
        $category = ComplaintCategory::find($categoryId);
        return [
            'organization_id' => $category?->default_organization_id,
            'office_id' => $officeId,
            'office_branch_id' => $branchId,
            'assigned_officer_id' => null,
            'routing_tier' => 'fallback_category_default',
        ];
    }
}
