<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminOfficerMessage extends Model
{
    protected $fillable = [
        'complaint_id',
        'sender_id',
        'receiver_id',
        'message',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
