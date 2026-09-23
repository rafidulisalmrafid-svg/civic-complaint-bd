<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintStatusHistory extends Model
{
    protected $fillable = [
        'complaint_id',
        'from_status',
        'to_status',
        'action_type',
        'remarks_bn',
        'changed_by_user_id',
        'is_public_to_citizen',
    ];

    protected function casts(): array
    {
        return [
            'is_public_to_citizen' => 'boolean',
        ];
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
