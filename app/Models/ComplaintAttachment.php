<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintAttachment extends Model
{
    protected $fillable = [
        'complaint_id',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size',
        'is_camera_capture',
        'is_private',
        'uploaded_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_camera_capture' => 'boolean',
            'is_private' => 'boolean',
            'file_size' => 'integer',
        ];
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }
}
