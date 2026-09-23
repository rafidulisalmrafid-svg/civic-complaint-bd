<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JurisdictionLocation extends Model
{
    protected $fillable = ['jurisdiction_id', 'upazila_id', 'local_government_id', 'ward_id'];

    public function jurisdiction()
    {
        return $this->belongsTo(Jurisdiction::class);
    }

    public function upazila()
    {
        return $this->belongsTo(Upazila::class);
    }

    public function localGovernment()
    {
        return $this->belongsTo(LocalGovernment::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }
}
