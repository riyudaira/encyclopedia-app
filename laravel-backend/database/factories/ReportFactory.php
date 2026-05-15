<?php

namespace Database\Factories;

use App\Models\Report;
use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'article_id' => Article::factory(),
            'user_id' => User::factory(),
            'reason' => 'テスト通報理由です。10文字以上必要です。',
            'status' => 'open',
        ];
    }
}
