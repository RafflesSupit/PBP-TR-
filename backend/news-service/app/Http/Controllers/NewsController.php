<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class NewsController extends Controller
{
    public function index()
    {
        return News::orderBy('created_at', 'desc')->get();
    }

    public function indexByUser(Request $request)
    {
        $user = $request->auth_user;
        if(!$user){
            return response()->json([
                'data' => "error"
            ],401);
        }
        $news = News::where('user_id', $user['id'])->orderBy('created_at', 'desc')->get();
        return response()->json($news);
    }

    public function countNews(){
        $countNews = News::where('status', 'published')->count();
        return response()->json([
            'success' => true,
            'data' => $countNews,
        ]);
    }
    public function trendingNews(){
        $trendingNews = News::where('status', 'published')->orderBy('views', 'desc')->take(1)->get();
        return response()->json([
            'success' => true,
            'data' => $trendingNews,
        ]);
    }

    public function show($id)
    {
        $news = News::findOrFail($id);
        $news->increment('views');
        return response()->json($news);
    }

    public function edit($id)
    {
        $news = News::findOrFail($id);
        return response()->json($news);
    }

    public function store(Request $request)
    {
        $user = $request->auth_user;
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|uuid',
            'thumbnail_url' => 'nullable|string',
            'status' => 'nullable|in:draft,published'
        ]);

        // Validasi kategori ke Category Service
        $res = Http::get(env('CATEGORY_SERVICE_URL') . "/categories/{$validated['category_id']}");
        if ($res->failed()) {
            return response()->json(['message' => 'Invalid Category'], 400);
        }

        $validated['status'] = $validated['status'] ?? 'draft';

        $validated['user_id'] = $user['id'];
        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $news = News::create($validated);
        return response()->json(['message' => 'Created', 'data' => $news], 201);
    }

    public function update(Request $request, $id)
    {
        $news = News::findOrFail($id);
        $user = $request->auth_user;

        if ($news->user_id !== $user['id']) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'title' => 'string',
            'content' => 'string',
            'category_id' => 'uuid',
            'thumbnail_url' => 'nullable|string',
            'status' => 'in:draft,published'
        ]);

        if (isset($validated['category_id'])) {
            $res = Http::get(env('CATEGORY_SERVICE_URL') . "/categories/{$validated['category_id']}");
            if ($res->failed()) {
                return response()->json(['message' => 'Invalid Category'], 400);
            }
        }

        
        if ($validated['status'] === 'published' && !$news->published_at) {
            $validated['published_at'] = now();
        }

        $news->update($validated);
        return response()->json(['message' => 'Updated', 'data' => $news]);
    }

    public function destroy($id)
    {
        $news = News::findOrFail($id);
        $news->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
