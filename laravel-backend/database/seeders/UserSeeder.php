<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create(
            [
                'name' => '管理者',
                'email' => 'admin@example.com',
                'password' => Hash::make('abab1234'),
                'role' => 'admin',
            ],

        );
        User::create(
            [
                'name' => '一般会員',
                'email' => 'user@example.com',
                'password' => Hash::make('1234abab'),
                'role' => 'member',
            ],

        );
    }
}
