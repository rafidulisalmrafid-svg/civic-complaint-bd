<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    protected $fillable = [
        'parent_id',
        'organization_type_id',
        'name_bn',
        'name_en',
        'code',
        'description',
        'email',
        'phone',
        'website',
        'icon',
        'status',
    ];

    public function parent()
    {
        return $this->belongsTo(Organization::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Organization::class, 'parent_id');
    }

    public function type()
    {
        return $this->belongsTo(OrganizationType::class, 'organization_type_id');
    }

    public function offices()
    {
        return $this->hasMany(Office::class);
    }

    public function officerProfiles()
    {
        return $this->hasMany(OfficerProfile::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
