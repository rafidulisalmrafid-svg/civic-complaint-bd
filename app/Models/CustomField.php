<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomField extends Model
{
    protected $fillable = [
        'complaint_category_id',
        'field_name',
        'label_bn',
        'label_en',
        'field_type',
        'options_json',
        'placeholder_bn',
        'is_required',
        'display_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'options_json' => 'array',
            'is_required' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class, 'complaint_category_id');
    }
}
