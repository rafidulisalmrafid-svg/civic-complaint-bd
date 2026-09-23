<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintCategory extends Model
{
    protected $fillable = [
        'name_bn',
        'name_en',
        'slug',
        'icon',
        'description',
        'default_priority',
        'default_sla_days',
        'is_sensitive',
        'ministry_id',
        'default_organization_id',
        'display_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_sensitive' => 'boolean',
            'default_sla_days' => 'integer',
            'display_order' => 'integer',
        ];
    }

    public function subcategories()
    {
        return $this->hasMany(ComplaintSubcategory::class)->orderBy('display_order');
    }

    public function customFields()
    {
        return $this->hasMany(CustomField::class)->orderBy('display_order');
    }

    public function ministry()
    {
        return $this->belongsTo(Organization::class, 'ministry_id');
    }

    public function defaultOrganization()
    {
        return $this->belongsTo(Organization::class, 'default_organization_id');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'category_id');
    }
}
