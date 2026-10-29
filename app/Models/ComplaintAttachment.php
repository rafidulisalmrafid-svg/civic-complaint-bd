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
        'video_duration_seconds',
        'is_camera_capture',
        'is_private',
        'uploaded_by_user_id',
        'verification_status',
        'confidence_score',
        'document_type',
        'ocr_extracted_text',
        'extracted_entities',
        'file_hash',
        'is_duplicate',
        'duplicate_of_attachment_id',
        'analysis_flags',
        'ai_tamper_detected',
        'verification_method',
        'admin_review_status',
        'admin_review_notes',
        'reviewed_by_user_id',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_camera_capture' => 'boolean',
            'is_private' => 'boolean',
            'is_duplicate' => 'boolean',
            'ai_tamper_detected' => 'boolean',
            'file_size' => 'integer',
            'video_duration_seconds' => 'integer',
            'confidence_score' => 'integer',
            'extracted_entities' => 'array',
            'analysis_flags' => 'array',
            'reviewed_at' => 'datetime',
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

    public function reviewedByUser()
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function duplicateOf()
    {
        return $this->belongsTo(ComplaintAttachment::class, 'duplicate_of_attachment_id');
    }
}
