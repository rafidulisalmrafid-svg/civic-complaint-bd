<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocalGovernment extends Model
{
    protected $fillable = ['upazila_id', 'name_bn', 'name_en', 'type', 'code', 'status'];

    public function upazila()
    {
        return $this->belongsTo(Upazila::class);
    }

    public function wards()
    {
        return $this->hasMany(Ward::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
