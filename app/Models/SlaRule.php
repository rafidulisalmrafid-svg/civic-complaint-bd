<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlaRule extends Model
{
    protected $fillable = [
        'category_id',
        'priority',
        'review_sla_hours',
        'investigation_sla_hours',
        'resolution_sla_hours',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'review_sla_hours' => 'integer',
            'investigation_sla_hours' => 'integer',
            'resolution_sla_hours' => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class);
    }
}
