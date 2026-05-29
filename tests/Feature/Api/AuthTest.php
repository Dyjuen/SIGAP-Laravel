<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_via_api()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'password_hash' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'username' => 'testuser',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'token',
            'user' => ['id', 'username', 'email'],
        ]);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'password_hash' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'username' => 'testuser',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_logout_via_api()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/logout');

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Logged out successfully']);

        $this->assertCount(0, $user->tokens);
    }

    public function test_user_can_refresh_token_via_api()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/refresh');

        $response->assertStatus(200);
        $response->assertJsonStructure(['token']);

        // Check old token is deleted
        $this->assertCount(1, $user->tokens); // The new one
        $this->assertNotEquals($token, $response->json('token'));
    }
}
