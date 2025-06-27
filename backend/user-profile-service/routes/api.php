<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserProfileController;

Route::middleware('auth.token')->group(function () {
    Route::get('/profiles/{user_id}', [UserProfileController::class, 'show']);
    Route::put('/profiles/{user_id}', [UserProfileController::class, 'update']);
    Route::get('/me/profile', [UserProfileController::class, 'myProfile']);
});
