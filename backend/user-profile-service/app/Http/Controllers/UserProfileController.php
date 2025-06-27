<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserProfile;

class UserProfileController extends Controller
{
    public function myProfile(Request $request)
    {
        $userId = $request->auth_user['id'];
        $profile = UserProfile::where('user_id', $userId)->first();

        return response()->json($profile);
    }

    public function show($user_id)
    {
        $profile = UserProfile::where('user_id', $user_id)->first();
        if (!$profile) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $userId = $request->auth_user['id'];
        $profile = UserProfile::updateOrCreate(
            ['user_id' => $userId],
            $request->only(['bio', 'avatar_url', 'last_login']),
        );

        return response()->json(['message' => 'Updated', 'data' => $profile]);
    }
}

