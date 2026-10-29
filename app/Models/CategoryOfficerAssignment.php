<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryOfficerAssignment extends Model
{
    protected $fillable = [
        'category_id',
        'division_id',
        'district_id',
        'officer_profile_id',
        'user_id',
        'assigned_by_user_id',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }

    public function division()
    {
        return $this->belongsTo(Division::class, 'division_id');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    public function officerProfile()
    {
        return $this->belongsTo(OfficerProfile::class, 'officer_profile_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedByUser()
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id');
    }
}
