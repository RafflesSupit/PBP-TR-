<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/login', function (Request $request) {
    $response = Http::post(env('AUTH_SERVICE') . '/login', $request->all());
    return response()->json($response->json(), $response->status());
});

Route::post('/logout', function (Request $request) {
    if (request()->hasHeader('Authorization')) {
        $headers['Authorization'] = request()->header('Authorization');
    }
    
    $response = Http::withHeaders($headers)
        ->post(env('AUTH_SERVICE') . '/logout');
        
    return response()->json($response->json(), $response->status());
});

Route::post('/register', function (Request $request) {
    $response = Http::post(env('AUTH_SERVICE') . '/register', $request->all());
    return response()->json($response->json(), $response->status());
});

// Profile
Route::middleware('api')->get('/me', function (Request $request) {
    $jwt = $request->bearerToken();
    $response = Http::withToken($jwt)->get(env('PROFILE_SERVICE') . '/me/profile');
    return response()->json($response->json(), $response->status());
});

Route::middleware('auth:api')->put('/me', function (Request $request) {
    $jwt = $request->bearerToken();
    $response = Http::withToken($jwt)->put(env('PROFILE_SERVICE') . '/me/profile', $request->all());
    return response()->json($response->json(), $response->status());
});


Route::get('/news', fn(Request $r) => Http::get(env('NEWS_SERVICE') . '/news')->json());
Route::post('/news', fn(Request $r) => Http::post(env('NEWS_SERVICE') . '/news', $r->all())->json());

Route::get('/comments', fn(Request $r) => Http::get(env('COMMENT_SERVICE') . '/comments', $r->query())->json());

Route::get('/categories', fn() => Http::get(env('CATEGORY_SERVICE') . '/categories')->json());

Route::post('/upload', fn(Request $r) => Http::attach(
    'file', file_get_contents($r->file('file')), $r->file('file')->getClientOriginalName()
)->post(env('MEDIA_SERVICE') . '/upload')->json());
