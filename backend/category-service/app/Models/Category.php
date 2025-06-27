<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['name', 'description'];

    protected static function booted()
    {
        static::creating(function ($category) {
            $category->id = Str::uuid()->toString();
        });
    }
}
