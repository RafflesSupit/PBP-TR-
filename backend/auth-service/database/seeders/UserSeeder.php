<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin Raffles',
            'email' => 'admin@pbp.com',
            'password' => Hash::make('12312312'),
            'role' => 'admin',
            'bio' => 'System Administrator',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Editor Raffles',
            'email' => 'editor@pbp.com',
            'password' => Hash::make('12312312'),
            'role' => 'editor',
            'bio' => 'Content Editor',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Reader Raffles',
            'email' => 'reader@pbp.com',
            'password' => Hash::make('12312312'),
            'role' => 'reader',
            'bio' => 'Regular Reader',
            'email_verified_at' => now(),
        ]);
    }
}
