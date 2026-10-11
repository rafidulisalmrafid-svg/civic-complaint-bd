<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintProblemType extends Model
{
    protected $fillable = [
        'category_id',
        'cluster_name_bn',
        'cluster_name_en',
        'title_bn',
        'title_en',
        'severity',
        'default_sla_days',
        'display_order',
        'status',
    ];

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }

    public function selectedIssues()
    {
        return $this->hasMany(ComplaintSelectedIssue::class, 'problem_type_id');
    }
}
