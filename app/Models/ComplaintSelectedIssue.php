<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintSelectedIssue extends Model
{
    protected $fillable = [
        'complaint_id',
        'problem_type_id',
        'cluster_name_bn',
        'title_bn',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function problemType()
    {
        return $this->belongsTo(ComplaintProblemType::class, 'problem_type_id');
    }
}
