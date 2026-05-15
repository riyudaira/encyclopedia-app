<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Report;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $member;
    protected $article;

    protected function setUp(): void
    {
        parent::setUp();
        Category::create(['code' => '0', 'name' => '総記']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->member = User::factory()->create(['role' => 'member']);
        $this->article = Article::factory()->create(['category_id' => 1]);
    }

    /**
     * 非会員（ゲスト）でも通報を送信できる
     */
    public function test_guest_can_submit_report(): void
    {
        $response = $this->postJson('/api/reports', [
            'article_id' => $this->article->id,
            'reason' => '不適切な内容が含まれています（テスト）'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('reports', ['reason' => '不適切な内容が含まれています（テスト）']);
    }

    /**
     * 管理者は通報一覧を取得できる
     */
    public function test_admin_can_view_report_list(): void
    {
        Report::factory()->count(3)->create(['article_id' => $this->article->id]);

        Sanctum::actingAs($this->admin);
        $response = $this->getJson('/api/admin/reports');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /**
     * 一般会員は通報一覧を取得できない（403）
     */
    public function test_member_cannot_view_report_list(): void
    {
        Sanctum::actingAs($this->member);
        $response = $this->getJson('/api/admin/reports');

        $response->assertStatus(403);
    }

    /**
     * 管理者は通報を解決済みにできる
     */
    public function test_admin_can_resolve_report(): void
    {
        $report = Report::factory()->create(['article_id' => $this->article->id]);

        Sanctum::actingAs($this->admin);
        $response = $this->patchJson("/api/admin/reports/{$report->id}", [
            'admin_comment' => '確認し、対応しました。'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'resolved',
            'admin_comment' => '確認し、対応しました。'
        ]);
    }

    /**
     * 管理者はユーザーの凍結状態を切り替えられる
     */
    public function test_admin_can_toggle_user_ban(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson("/api/admin/users/{$this->member->id}/toggle-ban");
        $response->assertStatus(200);
        $this->assertTrue($this->member->fresh()->is_banned);

        $response = $this->patchJson("/api/admin/users/{$this->member->id}/toggle-ban");
        $response->assertStatus(200);
        $this->assertFalse($this->member->fresh()->is_banned);
    }
}
