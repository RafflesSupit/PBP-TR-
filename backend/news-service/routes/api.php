<?php

use App\Http\Controllers\NewsController;
use Illuminate\Support\Facades\Route;

Route::get('/news', [NewsController::class, 'index']);
Route::get('/countNews', [NewsController::class, 'countNews']);
Route::get('/trendingNews', [NewsController::class, 'trendingNews']);
Route::get('/news/{id}', [NewsController::class, 'show']);
Route::get('/news/{id}/edit', [NewsController::class, 'edit']);

Route::middleware('auth.token')->group(function () {
    Route::get('/news/user/{user_id}', [NewsController::class, 'indexByUser']);
    Route::post('/news', [NewsController::class, 'store']);
    Route::put('/news/{id}', [NewsController::class, 'update']);
    Route::delete('/news/{id}', [NewsController::class, 'destroy']);
});
