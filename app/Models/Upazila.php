<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Upazila extends Model
{
    protected $fillable = ['district_id', 'name_bn', 'name_en', 'code', 'lat', 'lng', 'status'];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function localGovernments()
    {
        return $this->hasMany(LocalGovernment::class);
    }

    public function postOffices()
    {
        return $this->hasMany(PostOffice::class);
    }

    public function offices()
    {
        return $this->hasMany(Office::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
