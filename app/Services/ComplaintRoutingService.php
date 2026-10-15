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
     * with STRICT Conflict-of-Interest prevention and administrative escalation hierarchy:
     *
     * 1. Conflict-of-Interest Check: If complaint names a specific officer ($specificOfficerId),
     *    that officer is the SUBJECT of the grievance. They CANNOT be assigned to investigate themselves!
     * 2. Branch / Department Head Officer (excluding the targeted officer)
     * 3. Office Focal Point / Head Officer (excluding the targeted officer)
     * 4. District Complaint Officer (neutral administrative investigator)
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
        $conflictOfInterest = false;
        $conflictNote = null;

        // If citizen targeted a specific officer, trigger CONFLICT OF INTEREST guard
        if (! $isPersonUnknown && $specificOfficerId) {
            $conflictOfInterest = true;
            $targetedOfficer = OfficerProfile::find($specificOfficerId);
            $targetedName = $targetedOfficer ? "{$targetedOfficer->name_bn} ({$targetedOfficer->designation_bn})" : "আইডি #{$specificOfficerId}";
            $conflictNote = "স্বার্থের সংঘাত রোধ: অভিযোগটি কর্মকর্তা {$targetedName}-এর বিরুদ্ধে উত্থাপিত হওয়ায় তাঁকে তদন্তভার থেকে বাদ দিয়ে নিরপেক্ষ ঊর্ধ্বতন কর্তৃপক্ষের কাছে ন্যস্ত করা হয়েছে।";
        }

        // Tier 1: Branch / Department Responsible Officer (excluding targeted officer)
        if ($branchId) {
            $branchOfficer = OfficerProfile::where('office_branch_id', $branchId)
                ->where('status', 'active')
                ->when($specificOfficerId, fn($q) => $q->where('id', '!=', $specificOfficerId))
                ->orderByDesc('is_office_focal_point')
                ->first();

            if ($branchOfficer) {
                return [
                    'organization_id' => $branchOfficer->organization_id,
                    'office_id' => $branchOfficer->office_id,
                    'office_branch_id' => $branchId,
                    'assigned_officer_id' => $branchOfficer->id,
                    'routing_tier' => 'tier_branch_neutral',
                    'conflict_of_interest' => $conflictOfInterest,
                    'conflict_note' => $conflictNote,
                ];
            }
        }

        // Tier 2: Office Focal Point / Head Officer (excluding targeted officer)
        if ($officeId) {
            $office = Office::find($officeId);
            $officeFocal = OfficerProfile::where('office_id', $officeId)
                ->where('status', 'active')
                ->when($specificOfficerId, fn($q) => $q->where('id', '!=', $specificOfficerId))
                ->where('is_office_focal_point', true)
                ->first()
                ?? OfficerProfile::where('office_id', $officeId)
                    ->where('status', 'active')
                    ->when($specificOfficerId, fn($q) => $q->where('id', '!=', $specificOfficerId))
                    ->first();

            if ($officeFocal) {
                return [
                    'organization_id' => $officeFocal->organization_id ?? $office?->organization_id,
                    'office_id' => $officeId,
                    'office_branch_id' => $branchId,
                    'assigned_officer_id' => $officeFocal->id,
                    'routing_tier' => 'tier_office_focal',
                    'conflict_of_interest' => $conflictOfInterest,
                    'conflict_note' => $conflictNote,
                ];
            }

            if ($office) {
                return [
                    'organization_id' => $office->organization_id,
                    'office_id' => $officeId,
                    'office_branch_id' => $branchId,
                    'assigned_officer_id' => null,
                    'routing_tier' => 'tier_office_queue',
                    'conflict_of_interest' => $conflictOfInterest,
                    'conflict_note' => $conflictNote,
                ];
            }
        }

        // Tier 3: District Complaint Officer (Neutral District Investigator)
        if ($districtId) {
            $districtOfficer = OfficerProfile::where('district_id', $districtId)
                ->where('is_district_complaint_officer', true)
                ->where('status', 'active')
                ->when($specificOfficerId, fn($q) => $q->where('id', '!=', $specificOfficerId))
                ->first()
                ?? OfficerProfile::where('district_id', $districtId)
                    ->where('status', 'active')
                    ->when($specificOfficerId, fn($q) => $q->where('id', '!=', $specificOfficerId))
                    ->first();

            if ($districtOfficer) {
                return [
                    'organization_id' => $districtOfficer->organization_id,
                    'office_id' => $districtOfficer->office_id,
                    'office_branch_id' => null,
                    'assigned_officer_id' => $districtOfficer->id,
                    'routing_tier' => 'tier_district_complaint_officer',
                    'conflict_of_interest' => $conflictOfInterest,
                    'conflict_note' => $conflictNote,
                ];
            }
        }

        // Fallback: System Default Active Officer
        $defaultOfficer = OfficerProfile::where('status', 'active')
            ->when($specificOfficerId, fn($q) => $q->where('id', '!=', $specificOfficerId))
            ->first();

        return [
            'organization_id' => $defaultOfficer?->organization_id,
            'office_id' => $defaultOfficer?->office_id,
            'office_branch_id' => null,
            'assigned_officer_id' => $defaultOfficer?->id,
            'routing_tier' => 'fallback_general_queue',
            'conflict_of_interest' => $conflictOfInterest,
            'conflict_note' => $conflictNote,
        ];
    }
}
