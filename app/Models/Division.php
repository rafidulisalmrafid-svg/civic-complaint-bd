<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    protected $fillable = ['name_bn', 'name_en', 'code', 'status'];

    public function districts()
    {
        return $this->hasMany(District::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
