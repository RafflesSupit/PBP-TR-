<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserProfile extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'user_id', 'bio', 'avatar_url', 'joined_at', 'last_login',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'last_login' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->id = Str::uuid();
        });
    }
}
