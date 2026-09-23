<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintAction extends Model
{
    protected $fillable = [
        'complaint_id',
        'officer_id',
        'action_type',
        'description',
        'proof_attachment_id',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function officer()
    {
        return $this->belongsTo(OfficerProfile::class, 'officer_id');
    }

    public function proofAttachment()
    {
        return $this->belongsTo(ComplaintAttachment::class, 'proof_attachment_id');
    }
}
