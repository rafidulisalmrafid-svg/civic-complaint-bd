<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Office extends Model
{
    protected $fillable = [
        'organization_id',
        'parent_id',
        'name_bn',
        'name_en',
        'code',
        'division_id',
        'district_id',
        'upazila_id',
        'address',
        'phone',
        'email',
        'status',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function parent()
    {
        return $this->belongsTo(Office::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Office::class, 'parent_id');
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

    public function branches()
    {
        return $this->hasMany(OfficeBranch::class);
    }

    public function officers()
    {
        return $this->hasMany(OfficerProfile::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
