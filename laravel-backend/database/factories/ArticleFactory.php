<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ArticleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => $this->faker->unique()->realText(20),
            'category_id' => Category::factory(),
            'user_id' => User::factory(),
            'lock_version' => 1,
            'view_count' => 0,
        ];
    }
}
