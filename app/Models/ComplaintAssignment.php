<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintAssignment extends Model
{
    protected $fillable = [
        'complaint_id',
        'assigned_by_user_id',
        'assigned_to_officer_id',
        'assigned_office_id',
        'instruction',
        'deadline',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
        ];
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(OfficerProfile::class, 'assigned_to_officer_id');
    }

    public function office()
    {
        return $this->belongsTo(Office::class, 'assigned_office_id');
    }
}
