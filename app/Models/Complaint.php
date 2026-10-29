<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Complaint extends Model
{
    protected $fillable = [
        'tracking_id',
        'user_id',
        'complainant_name',
        'complainant_phone',
        'is_anonymous',
        'category_id',
        'subcategory_id',
        'title',
        'description',
        'priority',
        'is_sensitive',
        'division_id',
        'district_id',
        'upazila_id',
        'local_government_id',
        'ward_id',
        'area_id',
        'post_office_id',
        'specific_location_details',
        'latitude',
        'longitude',
        'organization_id',
        'office_id',
        'office_branch_id',
        'target_post_id',
        'is_person_unknown',
        'accused_person_name',
        'specific_officer_id',
        'assigned_officer_id',
        'current_status',
        'custom_fields_data',
        'selected_issues_summary',
        'other_problem_description',
        'due_at',
        'resolved_at',
        'closed_at',
        'conflict_of_interest_detected',
        'conflict_resolution_note',
        'ai_tamper_detected',
        'routing_dispatch_time',
        'department_acknowledged_at',
        'delivery_status',
        'formal_letter_text',
        'is_read_by_officer',
        'is_read_by_admin',
        'officer_read_at',
        'admin_read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
            'is_sensitive' => 'boolean',
            'is_person_unknown' => 'boolean',
            'ai_tamper_detected' => 'boolean',
            'conflict_of_interest_detected' => 'boolean',
            'is_read_by_officer' => 'boolean',
            'is_read_by_admin' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'custom_fields_data' => 'array',
            'due_at' => 'datetime',
            'resolved_at' => 'datetime',
            'closed_at' => 'datetime',
            'routing_dispatch_time' => 'datetime',
            'department_acknowledged_at' => 'datetime',
            'officer_read_at' => 'datetime',
            'admin_read_at' => 'datetime',
        ];
    }

    // Status helper methods
    public function isOverdue(): bool
    {
        if (in_array($this->current_status, ['resolved', 'closed', 'rejected'])) {
            return false;
        }
        return $this->due_at && Carbon::now()->isAfter($this->due_at);
    }

    public function getStatusLabelBnAttribute(): string
    {
        return match ($this->current_status) {
            'submitted' => 'অভিযোগ জমা হয়েছে',
            'received' => 'গৃহীত হয়েছে',
            'under_review' => 'পর্যালোচনাধীন',
            'assigned' => 'কর্মকর্তা নিযুক্ত',
            'forwarded' => 'দপ্তরে ফরওয়ার্ডকৃত',
            'investigation_started' => 'তদন্ত চলমান',
            'action_taken' => 'ব্যবস্থা নেওয়া হয়েছে',
            'resolution_submitted' => 'সমাধান প্রস্তাবিত',
            'resolved' => 'সমাধান সম্পন্ন',
            'closed' => 'বন্ধ',
            'reopened' => 'পুনরায় খোলা হয়েছে',
            'escalated' => 'ঊর্ধ্বতন পর্যায়ে প্রেরিত',
            'overdue' => 'সময়সীমা অতিক্রান্ত',
            'rejected' => 'বাতিলকৃত',
            default => 'প্রক্রিয়াধীন',
        };
    }

    public function getPriorityLabelBnAttribute(): string
    {
        return match ($this->priority) {
            'urgent' => 'জরুরি',
            'high' => 'উচ্চ অগ্রাধিকার',
            'medium' => 'সাধারণ',
            'low' => 'নিম্ন',
            default => 'সাধারণ',
        };
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(ComplaintSubcategory::class, 'subcategory_id');
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function upazila()
    {
        return $this->belongsTo(Upazila::class);
    }

    public function localGovernment()
    {
        return $this->belongsTo(LocalGovernment::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function postOffice()
    {
        return $this->belongsTo(PostOffice::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function office()
    {
        return $this->belongsTo(Office::class);
    }

    public function branch()
    {
        return $this->belongsTo(OfficeBranch::class, 'office_branch_id');
    }

    public function targetPost()
    {
        return $this->belongsTo(Post::class, 'target_post_id');
    }

    public function selectedIssues()
    {
        return $this->hasMany(ComplaintSelectedIssue::class);
    }

    public function specificOfficer()
    {
        return $this->belongsTo(OfficerProfile::class, 'specific_officer_id');
    }

    public function assignedOfficer()
    {
        return $this->belongsTo(OfficerProfile::class, 'assigned_officer_id');
    }

    public function attachments()
    {
        return $this->hasMany(ComplaintAttachment::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(ComplaintStatusHistory::class)->orderBy('created_at', 'asc');
    }

    public function assignments()
    {
        return $this->hasMany(ComplaintAssignment::class)->latest();
    }

    public function internalNotes()
    {
        return $this->hasMany(ComplaintInternalNote::class)->latest();
    }

    public function actions()
    {
        return $this->hasMany(ComplaintAction::class)->latest();
    }

    public function feedback()
    {
        return $this->hasOne(ComplaintFeedback::class);
    }

    public function adminOfficerMessages()
    {
        return $this->hasMany(AdminOfficerMessage::class)->orderBy('created_at', 'asc');
    }
}
