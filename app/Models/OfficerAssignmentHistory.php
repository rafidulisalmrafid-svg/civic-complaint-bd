<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficerAssignmentHistory extends Model
{
    protected $fillable = [
        'officer_profile_id',
        'previous_office_id',
        'new_office_id',
        'previous_designation',
        'new_designation',
        'change_type',
        'transfer_order_no',
        'effective_date',
        'changed_by_user_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
        ];
    }

    public function officerProfile()
    {
        return $this->belongsTo(OfficerProfile::class);
    }

    public function previousOffice()
    {
        return $this->belongsTo(Office::class, 'previous_office_id');
    }

    public function newOffice()
    {
        return $this->belongsTo(Office::class, 'new_office_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
