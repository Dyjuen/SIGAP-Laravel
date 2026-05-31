<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_can_get_profile()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/profile');

        $response->assertStatus(200);
        $response->assertJson([
            'user_id' => $user->user_id,
            'username' => $user->username,
            'nama_lengkap' => $user->nama_lengkap,
            'email' => $user->email,
        ]);
    }

    public function test_api_can_update_profile()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->patchJson('/api/profile', [
            'nama_lengkap' => 'New Full Name',
            'email' => 'newemail@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Profil berhasil diperbarui.',
            'user' => [
                'nama_lengkap' => 'New Full Name',
                'email' => 'newemail@example.com',
            ],
        ]);

        $user->refresh();
        $this->assertEquals('New Full Name', $user->nama_lengkap);
        $this->assertEquals('newemail@example.com', $user->email);
    }

    public function test_api_can_delete_profile()
    {
        $user = User::factory()->create([
            'password_hash' => bcrypt('secret-pass'),
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->deleteJson('/api/profile', [
            'password' => 'secret-pass',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Akun berhasil dihapus.',
        ]);

        $this->assertSoftDeleted($user);
    }

    public function test_api_cannot_delete_profile_with_wrong_password()
    {
        $user = User::factory()->create([
            'password_hash' => bcrypt('secret-pass'),
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->deleteJson('/api/profile', [
            'password' => 'wrong-pass',
        ]);

        $response->assertStatus(422);
        $this->assertNotNull($user->fresh());
    }
}
