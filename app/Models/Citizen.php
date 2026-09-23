<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Citizen extends Model
{
    protected $fillable = [
        'user_id',
        'nid_number',
        'alternative_phone',
        'address',
        'division_id',
        'district_id',
        'upazila_id',
        'preferred_language',
        'notification_prefs',
    ];

    protected function casts(): array
    {
        return [
            'notification_prefs' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function upazila()
    {
        return $this->belongsTo(Upazila::class);
    }
}
