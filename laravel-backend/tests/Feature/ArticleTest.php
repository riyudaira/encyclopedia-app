<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ArticleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Category::create(['code' => '9', 'name' => '文学']);
    }

    /**
     * 記事一覧が取得できるかテスト
     */
    public function test_can_get_article_list(): void
    {
        $user = User::factory()->create();
        Article::factory()->count(3)->create([
            'category_id' => Category::first()->id,
            'user_id' => $user->id
        ]);

        $response = $this->getJson('/api/articles');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * 記事詳細が取得でき、閲覧数が増えるかテスト
     */
    public function test_can_get_article_detail_and_increments_views(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'category_id' => Category::first()->id,
            'user_id' => $user->id,
            'view_count' => 0
        ]);

        $response = $this->getJson("/api/articles/{$article->id}");

        $response->assertStatus(200)
            ->assertJsonPath('title', $article->title);

        $this->assertEquals(1, $article->fresh()->view_count);
    }

    /**
     * ログインユーザーが記事を投稿できるかテスト（画像なし）
     */
    public function test_logged_in_user_can_create_article(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $category = Category::first();

        $data = [
            'title' => 'テスト記事タイトル',
            'category_id' => $category->id,
            'sections' => [
                [
                    'title' => 'セクション1',
                    'content' => '本文内容です',
                    'order' => 0,
                    'images' => []
                ]
            ]
        ];

        $response = $this->postJson('/api/articles', $data);

        $response->assertStatus(201); // Created
        $this->assertDatabaseHas('articles', ['title' => 'テスト記事タイトル']);
        $this->assertDatabaseHas('article_sections', ['title' => 'セクション1']);
    }

    /**
     * 投稿時のバリデーションテスト（タイトル空）
     */
    public function test_create_article_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/articles', [
            'title' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title', 'category_id', 'sections']);
    }
}
