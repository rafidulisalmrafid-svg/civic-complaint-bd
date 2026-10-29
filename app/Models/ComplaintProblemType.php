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

    protected $appends = [
        'complaint_category_id',
        'issue_group',
        'name_bn',
        'name_en',
        'severity_level',
        'is_active',
    ];

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }

    public function selectedIssues()
    {
        return $this->hasMany(ComplaintSelectedIssue::class, 'problem_type_id');
    }

    // --- Backward & Forward Compatibility Accessors & Mutators ---

    public function getComplaintCategoryIdAttribute(): ?int
    {
        return $this->category_id;
    }

    public function setComplaintCategoryIdAttribute($value): void
    {
        $this->attributes['category_id'] = $value;
    }

    public function getIssueGroupAttribute(): string
    {
        return $this->cluster_name_bn ?: 'general';
    }

    public function setIssueGroupAttribute($value): void
    {
        $this->attributes['cluster_name_bn'] = $value;
        if (empty($this->attributes['cluster_name_en'])) {
            $this->attributes['cluster_name_en'] = ucfirst((string)$value);
        }
    }

    public function getNameBnAttribute(): string
    {
        return $this->title_bn ?: '';
    }

    public function setNameBnAttribute($value): void
    {
        $this->attributes['title_bn'] = $value;
    }

    public function getNameEnAttribute(): ?string
    {
        return $this->title_en;
    }

    public function setNameEnAttribute($value): void
    {
        $this->attributes['title_en'] = $value;
    }

    public function getSeverityLevelAttribute(): string
    {
        return $this->severity ?: 'medium';
    }

    public function setSeverityLevelAttribute($value): void
    {
        $this->attributes['severity'] = $value;
    }

    public function getIsActiveAttribute(): bool
    {
        return ($this->status ?? 'active') === 'active';
    }

    public function setIsActiveAttribute($value): void
    {
        $this->attributes['status'] = $value ? 'active' : 'inactive';
    }
}
