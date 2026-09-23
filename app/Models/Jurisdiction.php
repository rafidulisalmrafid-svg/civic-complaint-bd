<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jurisdiction extends Model
{
    protected $fillable = ['name_bn', 'name_en', 'type', 'code', 'status'];

    public function locations()
    {
        return $this->hasMany(JurisdictionLocation::class);
    }
}
