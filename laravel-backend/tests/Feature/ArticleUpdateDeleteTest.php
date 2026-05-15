<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ArticleUpdateDeleteTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $article;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = Category::create(['code' => '9', 'name' => '文学']);
        $this->user = User::factory()->create(['role' => 'member']);
        $this->article = Article::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'lock_version' => 1
        ]);
    }

    /**
     * 作成者本人は記事を更新できる
     */
    public function test_author_can_update_article(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/articles/{$this->article->id}", [
            '_method' => 'PUT',
            'title' => '更新後のタイトル',
            'category_id' => $this->category->id,
            'lock_version' => 1,
            'sections' => [
                ['title' => '新見出し', 'content' => '新本文', 'order' => 0]
            ]
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('articles', ['title' => '更新後のタイトル', 'lock_version' => 2]);
    }

    /**
     * 楽観的ロック：古いバージョン番号で送ると409エラーになる
     */
    public function test_optimistic_locking_prevents_update(): void
    {
        Sanctum::actingAs($this->user);

        $this->article->update(['lock_version' => 2]);

        $response = $this->postJson("/api/articles/{$this->article->id}", [
            '_method' => 'PUT',
            'title' => '上書きを試みるタイトル',
            'category_id' => $this->category->id,
            'lock_version' => 1,
            'sections' => [['title' => 'test', 'content' => 'test', 'order' => 0]]
        ]);

        $response->assertStatus(409);
        $this->assertDatabaseMissing('articles', ['title' => '上書きを試みるタイトル']);
    }

    /**
     * 他人の記事も編集できることをテスト
     */
    public function test_any_member_can_update_other_users_article(): void
    {
        $otherUser = User::factory()->create(['role' => 'member']);
        Sanctum::actingAs($otherUser); // 他人としてログイン

        $response = $this->postJson("/api/articles/{$this->article->id}", [
            '_method' => 'PUT',
            'title' => '他人による書き換え',
            'category_id' => $this->category->id,
            'lock_version' => 1,
            'sections' => [['title' => 'test', 'content' => 'test', 'order' => 0]]
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('articles', ['title' => '他人による書き換え']);
    }

    /**
     * 他人の記事は削除できない
     */
    public function test_other_user_cannot_delete_article(): void
    {
        $otherUser = User::factory()->create(['role' => 'member']);
        Sanctum::actingAs($otherUser);

        $response = $this->deleteJson("/api/articles/{$this->article->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('articles', ['id' => $this->article->id]);
    }

    /**
     * 管理者は他人の記事でも削除できる
     */
    public function test_admin_can_delete_any_article(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/articles/{$this->article->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('articles', ['id' => $this->article->id]);
    }
}
