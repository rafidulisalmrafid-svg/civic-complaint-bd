<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'employee_id',
        'name_bn',
        'name_en',
        'designation_bn',
        'designation_en',
        'official_phone',
        'official_email',
        'organization_id',
        'office_id',
        'office_branch_id',
        'post_id',
        'is_office_focal_point',
        'is_district_complaint_officer',
        'division_id',
        'district_id',
        'upazila_id',
        'jurisdiction_id',
        'joining_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'joining_date' => 'date',
            'is_office_focal_point' => 'boolean',
            'is_district_complaint_officer' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function branch()
    {
        return $this->belongsTo(OfficeBranch::class, 'office_branch_id');
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function office()
    {
        return $this->belongsTo(Office::class);
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

    public function jurisdiction()
    {
        return $this->belongsTo(Jurisdiction::class);
    }

    public function assignedComplaints()
    {
        return $this->hasMany(Complaint::class, 'assigned_officer_id');
    }

    public function targetedComplaints()
    {
        return $this->hasMany(Complaint::class, 'specific_officer_id');
    }

    public function assignmentHistories()
    {
        return $this->hasMany(OfficerAssignmentHistory::class);
    }
}
