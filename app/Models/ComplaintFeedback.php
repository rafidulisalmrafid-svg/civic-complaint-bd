<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintFeedback extends Model
{
    protected $table = 'complaint_feedbacks';

    protected $fillable = [
        'complaint_id',
        'user_id',
        'was_resolved',
        'satisfaction_rating',
        'comment',
        'is_reopen_requested',
        'reopen_reason',
    ];

    protected function casts(): array
    {
        return [
            'satisfaction_rating' => 'integer',
            'is_reopen_requested' => 'boolean',
        ];
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
