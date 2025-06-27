<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class VerifyJWTFromAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $res = Http::withToken($token)->get(env('AUTH_SERVICE') . '/me');
        
        if (!$res->ok()) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        $request->merge(['user' => $res->json()]);
        return $next($request);
    }

}
