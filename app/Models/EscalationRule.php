<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EscalationRule extends Model
{
    protected $fillable = [
        'name',
        'trigger_after_overdue_hours',
        'escalate_to_role',
        'notification_message',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'trigger_after_overdue_hours' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
