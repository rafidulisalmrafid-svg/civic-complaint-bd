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
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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
