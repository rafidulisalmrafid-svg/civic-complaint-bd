<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationType extends Model
{
    protected $fillable = ['name_bn', 'name_en', 'slug', 'level_order'];

    public function organizations()
    {
        return $this->hasMany(Organization::class);
    }
}
