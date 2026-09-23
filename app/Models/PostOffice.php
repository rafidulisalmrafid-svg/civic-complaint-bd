<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostOffice extends Model
{
    protected $fillable = ['upazila_id', 'name_bn', 'name_en', 'post_code', 'status'];

    public function upazila()
    {
        return $this->belongsTo(Upazila::class);
    }
}
