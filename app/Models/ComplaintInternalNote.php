<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintInternalNote extends Model
{
    protected $fillable = [
        'complaint_id',
        'author_user_id',
        'note',
        'is_confidential',
    ];

    protected function casts(): array
    {
        return [
            'is_confidential' => 'boolean',
        ];
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_user_id');
    }
}
