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

Route::middleware('api')->put('/me', function (Request $request) {
    $jwt = $request->bearerToken();
    $response = Http::withToken($jwt)->put(env('PROFILE_SERVICE') . '/profiles/' . $request->user_id, $request->all());
    return response()->json($response->json(), $response->status());
});

//NEWS
Route::get('/news', fn(Request $r) => Http::get(env('NEWS_SERVICE') . '/news')->json());
//News Editor Dashboard
Route::get('/news/user/{user_id}', function(Request $request, $id) {
    $headers = [];
    if ($request->hasHeader('Authorization')) {
        $headers['Authorization'] = $request->header('Authorization');
    }
    return Http::withHeaders($headers)
        ->get(env('NEWS_SERVICE') . '/news/user/' . $id)
        ->json();
});
Route::post('/news', function(Request $request) {
    $headers = [];
    if ($request->hasHeader('Authorization')) {
        $headers['Authorization'] = $request->header('Authorization');
    }
    
    return Http::withHeaders($headers)
        ->post(env('NEWS_SERVICE') . '/news', $request->all())
        ->json();
});
Route::put('/news/{id}', function(Request $request, $id) {
    $headers = [];
    if ($request->hasHeader('Authorization')) {
        $headers['Authorization'] = $request->header('Authorization');
    }
    
    return Http::withHeaders($headers)
        ->put(env('NEWS_SERVICE') . '/news/' . $id, $request->all())
        ->json();
});

Route::get('/news/{id}', fn($id) => Http::get(env('NEWS_SERVICE') . '/news/' . $id)->json());
//route for edit
Route::get('/news/{id}/edit', fn($id) => Http::get(env('NEWS_SERVICE') . '/news/' . $id . '/edit')->json());


//Comment
Route::get('/comments', fn(Request $r) => Http::get(env('COMMENT_SERVICE') . '/comment', $r->query())->json());
Route::post('/comments', fn(Request $r) => Http::post(env('COMMENT_SERVICE') . '/comments', $r->all())->json());

Route::get('/categories', fn() => Http::get(env('CATEGORY_SERVICE') . '/categories')->json());
Route::post('/categories', fn(Request $request) => Http::post(env('CATEGORY_SERVICE') . '/categories', $request->all())->json());

Route::post('/media/upload', fn(Request $r) => Http::attach(
    'file', file_get_contents($r->file('file')), $r->file('file')->getClientOriginalName()
)->post(env('MEDIA_SERVICE') . '/upload')->json());


//STATISTIC
Route::get('/admin/stats', function(Request $request){
    $headers = [];
    if ($request->hasHeader('Authorization')) {
        $headers['Authorization'] = $request->header('Authorization');
    }

    $responses = Http::pool(fn ($pool) => [
        $pool->as('news')->withHeaders($headers)->get(env('NEWS_SERVICE') . '/countNews'),
        $pool->as('users')->withHeaders($headers)->get(env('AUTH_SERVICE') . '/countUser'),
        $pool->as('trending')->withHeaders($headers)->get(env('NEWS_SERVICE') . '/trendingNews'),
    ]);

    $usersData = $responses['users']->json();
    $newsData = $responses['news']->json();
    $trendingData = $responses['trending']->json();


    return response()->json([
        'users' => $usersData['data'] ?? 0,
        'news' => $newsData['data'] ?? 0,
        'most_viewed_news' => $trendingData['data'][0] ?? "",
    ]);
});

//USERS
Route::get('/users', function(Request $request){
    $headers = [];
    if($request->hasHeader('Authorization')){
        $headers['Authorization'] = $request->header('Authorization');
    }

    return Http::withHeaders($headers)
        ->get(env('AUTH_SERVICE') . '/users', $request->all())
        ->json();
});