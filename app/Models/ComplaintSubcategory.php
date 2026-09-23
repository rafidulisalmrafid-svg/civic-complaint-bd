<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintSubcategory extends Model
{
    protected $fillable = [
        'complaint_category_id',
        'name_bn',
        'name_en',
        'description',
        'default_organization_id',
        'display_order',
        'status',
    ];

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class, 'complaint_category_id');
    }

    public function defaultOrganization()
    {
        return $this->belongsTo(Organization::class, 'default_organization_id');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'subcategory_id');
    }
}
