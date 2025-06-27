<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AuthTokenMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Validasi token ke Auth Service
        $response = Http::withToken($token)->get(env('AUTH_SERVICE_URL') . '/me');

        if ($response->failed()) {
            return response()->json(['message' => 'Invalid Token'], 401);
        }

        $userData = $response->json();

        if (!isset($userData['data']['id'])) {
            return response()->json(['message' => 'Invalid user data'], 401);
        }

        // Simpan user info ke request
        $request->merge(['auth_user' => $userData['data']]);
        return $next($request);
    }
}
