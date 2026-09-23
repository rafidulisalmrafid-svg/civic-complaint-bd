<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoutingRule extends Model
{
    protected $fillable = [
        'name',
        'category_id',
        'subcategory_id',
        'division_id',
        'district_id',
        'upazila_id',
        'target_organization_id',
        'target_office_id',
        'priority_override',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(ComplaintSubcategory::class);
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

    public function targetOrganization()
    {
        return $this->belongsTo(Organization::class, 'target_organization_id');
    }

    public function targetOffice()
    {
        return $this->belongsTo(Office::class, 'target_office_id');
    }
}
