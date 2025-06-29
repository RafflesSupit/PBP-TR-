<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $req)
    {
        $users = User::query()
            ->when($req->role, function($query, $role){
                return $query->where('role', $role);
            })
            ->when($req->search, function($query, $search){
                return $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email','like', "%{$search}%");
            })
            ->paginate($req->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function countUsers(){
        $usersCount = User::count();

        return response()->json([
            'success' => true,
            'data' => $usersCount,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,editor,reader',
            'bio' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::create([
            'name' => $req->name,
            'email' => $req->email,
            'password' => Hash::make($req->password),
            'role' => $req->role,
            'bio' => $req->bio,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::find($id);

        if(!$user){
            return response()->json([
                'success' => false,
                'message' => 'User Not Found'
            ],404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $req, string $id)
    {
        $user = User::find($id);

        if(!$user){
            return response()->json([
                'success' => false,
                'message' => 'User Not Found'
            ],404);
        }

        $validator = Validator::make($req->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:admin,editor,reader',
            'bio' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $data = $req->all();
        if(isset($data['password'])){
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User updated succesfully',
            'data' => $user
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::find($id);

        if(!$user){
            return response()->json([
                'success'=> false,
                'message' => 'User not Found'
            ],404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted succesfully',
        ]);
    }
}
