<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Media extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'file_name', 'file_path', 'mime_type', 'size',
    ];

    protected static function booted()
    {
        static::creating(function ($media) {
            $media->id = Str::uuid()->toString();
        });
    }
}
