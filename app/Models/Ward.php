<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    protected $fillable = ['local_government_id', 'ward_number', 'name_bn', 'name_en', 'status'];

    public function localGovernment()
    {
        return $this->belongsTo(LocalGovernment::class);
    }

    public function areas()
    {
        return $this->hasMany(Area::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
