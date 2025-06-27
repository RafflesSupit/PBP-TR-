<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class News extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title', 'slug', 'content', 'thumbnail_url',
        'category_id', 'user_id', 'status', 'published_at', 'views'
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->id = Str::uuid();
            $model->slug = Str::slug($model->title) . '-' . Str::random(5);
        });
    }
}

