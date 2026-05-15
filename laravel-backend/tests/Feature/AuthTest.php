<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 会員登録のテスト
     */
    public function test_users_can_register(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => 'abab1234',
            'password_confirmation' => 'abab1234',
        ]);

        $response->assertStatus(204);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'テストユーザー',
        ]);
    }

    /**
     * ログインのテスト
     */
    public function test_users_can_authenticate(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('abab1234'),
        ]);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'abab1234',
        ]);

        $response->assertStatus(204);
        $this->assertAuthenticated();
    }

    /**
     * バリデーションエラーのテスト（パスワードが短い場合）
     */
    public function test_users_cannot_register_with_invalid_password(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'エラーユーザー',
            'email' => 'error@example.com',
            'password' => 'short', // 8文字未満
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    /**
     * 凍結されたユーザーはログインできないテスト
     */
    public function test_banned_users_cannot_login(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('abab1234'),
            'is_banned' => true,
        ]);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'abab1234',
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'email' => ['このアカウントは凍結されているため、ログインできません。']
        ]);
    }
}
