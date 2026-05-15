<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['code' => '0', 'name' => '総記'],
            ['code' => '1', 'name' => '哲学・思想'],
            ['code' => '2', 'name' => '歴史・地理'],
            ['code' => '3', 'name' => '社会'],
            ['code' => '4', 'name' => '科学'],
            ['code' => '5', 'name' => '工学・家政学'],
            ['code' => '6', 'name' => '産業'],
            ['code' => '7', 'name' => '娯楽・芸術'],
            ['code' => '8', 'name' => '言語'],
            ['code' => '9', 'name' => '文学'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }
    }
}
