<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'name_bn',
        'name_en',
        'code',
        'rank_level',
        'department_group',
        'status',
    ];

    public function officers()
    {
        return $this->hasMany(OfficerProfile::class);
    }
}
