<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('register',[AuthController::class, 'register']);
Route::post('login',[AuthController::class, 'login']);


Route::middleware(['api'])->group(function(){
    Route::post('logout',[AuthController::class, 'logout']);
    Route::post('refresh',[AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);
});


Route::apiResource('users', UserController::class);