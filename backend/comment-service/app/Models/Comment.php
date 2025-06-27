<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Comment extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['news_id', 'user_id', 'content'];

    protected static function booted()
    {
        static::creating(function ($comment) {
            $comment->id = Str::uuid()->toString();
        });
    }
}

