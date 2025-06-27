<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $newsId = $request->query('news_id');
        $comments = Comment::where('news_id', $newsId)->get();

        // Tambahkan nama user
        $comments = $comments->map(function ($comment) {
            $user = Http::get(env('USER_SERVICE_URL')."/users/{$comment->user_id}");
            $comment->user_name = $user->ok() ? $user->json()['data']['name'] ?? 'Unknown' : 'Unknown';
            return $comment;
        });

        return response()->json($comments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'news_id' => 'required|uuid',
            'user_id' => 'required|uuid',
            'content' => 'required|string',
        ]);

        $newsCheck = Http::get(env('NEWS_SERVICE_URL') . "news/{$request->news_id}");
        if (!$newsCheck->ok()) {
            return response()->json(['message' => 'Invalid news ID'], 400);
        }

        $comment = Comment::create($request->only(['news_id', 'user_id', 'content']));
        return response()->json($comment, 201);
    }

    public function update(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update($request->only('content'));
        return response()->json($comment);
    }

    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();
        return response()->json(null, 204);
    }
}