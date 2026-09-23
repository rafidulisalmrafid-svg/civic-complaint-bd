<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    protected $fillable = ['ward_id', 'name_bn', 'name_en', 'type', 'status'];

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
