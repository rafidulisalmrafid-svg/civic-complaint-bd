<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    protected $fillable = ['division_id', 'name_bn', 'name_en', 'code', 'lat', 'lng', 'status'];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function upazilas()
    {
        return $this->hasMany(Upazila::class);
    }

    public function offices()
    {
        return $this->hasMany(Office::class);
    }

    public function officerProfiles()
    {
        return $this->hasMany(OfficerProfile::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
