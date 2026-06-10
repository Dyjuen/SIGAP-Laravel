<?php

namespace Tests\Feature\Api;

use App\Models\DeviceToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceTokenTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_manage_device_token_without_authentication()
    {
        $responseStore = $this->postJson('/api/device-token', [
            'token' => 'fcm-token-xyz',
            'platform' => 'android',
        ]);
        $responseStore->assertStatus(401);

        $responseDestroy = $this->deleteJson('/api/device-token', [
            'token' => 'fcm-token-xyz',
        ]);
        $responseDestroy->assertStatus(401);
    }

    public function test_can_store_device_token()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/device-token', [
            'token' => 'fcm-token-xyz',
            'platform' => 'android',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Token perangkat berhasil disimpan.',
        ]);

        $this->assertDatabaseHas('device_tokens', [
            'user_id' => $user->user_id,
            'token' => 'fcm-token-xyz',
            'platform' => 'android',
        ]);
    }

    public function test_can_store_long_device_token()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        $longFcmToken = str_repeat('a', 450); // 450 characters, exceeding original 255 limit

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/device-token', [
            'token' => $longFcmToken,
            'platform' => 'android',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Token perangkat berhasil disimpan.',
        ]);

        $this->assertDatabaseHas('device_tokens', [
            'user_id' => $user->user_id,
            'token' => $longFcmToken,
            'platform' => 'android',
        ]);
    }

    public function test_storing_duplicate_device_token_upserts_correctly()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Register token first to user1
        DeviceToken::create([
            'user_id' => $user1->user_id,
            'token' => 'fcm-token-xyz',
            'platform' => 'android',
        ]);

        $token2 = $user2->createToken('test-token')->plainTextToken;

        // Register same token to user2 (updates owner)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token2,
            'Accept' => 'application/json',
        ])->postJson('/api/device-token', [
            'token' => 'fcm-token-xyz',
            'platform' => 'android',
        ]);

        $response->assertStatus(200);

        // Verify it was updated to user2 and user1 no longer owns it
        $this->assertDatabaseHas('device_tokens', [
            'user_id' => $user2->user_id,
            'token' => 'fcm-token-xyz',
        ]);

        $this->assertDatabaseMissing('device_tokens', [
            'user_id' => $user1->user_id,
            'token' => 'fcm-token-xyz',
        ]);

        // Total count of tokens is still 1
        $this->assertEquals(1, DeviceToken::where('token', 'fcm-token-xyz')->count());
    }

    public function test_user_can_have_multiple_device_tokens()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        // Register device 1
        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/device-token', [
            'token' => 'token-device-1',
            'platform' => 'android',
        ]);

        // Register device 2
        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/device-token', [
            'token' => 'token-device-2',
            'platform' => 'android',
        ]);

        $this->assertEquals(2, DeviceToken::where('user_id', $user->user_id)->count());
    }

    public function test_can_delete_device_token()
    {
        $user = User::factory()->create();
        DeviceToken::create([
            'user_id' => $user->user_id,
            'token' => 'fcm-token-xyz',
            'platform' => 'android',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->deleteJson('/api/device-token', [
            'token' => 'fcm-token-xyz',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Token perangkat berhasil dihapus.',
        ]);

        $this->assertDatabaseMissing('device_tokens', [
            'token' => 'fcm-token-xyz',
        ]);
    }

    public function test_cannot_delete_another_users_device_token()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        DeviceToken::create([
            'user_id' => $user1->user_id,
            'token' => 'fcm-token-xyz',
            'platform' => 'android',
        ]);

        $token2 = $user2->createToken('test-token')->plainTextToken;

        // Try to delete user1's token as user2
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token2,
        ])->deleteJson('/api/device-token', [
            'token' => 'fcm-token-xyz',
        ]);

        // It should not delete it
        $this->assertDatabaseHas('device_tokens', [
            'token' => 'fcm-token-xyz',
            'user_id' => $user1->user_id,
        ]);
    }
}
