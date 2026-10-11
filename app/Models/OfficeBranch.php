<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeBranch extends Model
{
    protected $fillable = [
        'office_id',
        'name_bn',
        'name_en',
        'code',
        'room_number',
        'floor',
        'phone',
        'email',
        'description',
        'status',
    ];

    public function office()
    {
        return $this->belongsTo(Office::class);
    }

    public function officers()
    {
        return $this->hasMany(OfficerProfile::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
