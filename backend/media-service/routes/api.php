<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MediaController;

Route::post('/upload', [MediaController::class, 'upload']);
Route::get('/media/{id}', [MediaController::class, 'show']);
Route::delete('/media/{id}', [MediaController::class, 'destroy']);
