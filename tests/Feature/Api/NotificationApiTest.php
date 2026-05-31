<?php

namespace Tests\Feature\Api;

use App\Models\Notifikasi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_get_notifications()
    {
        $user = User::factory()->create();
        Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Test Notification 1',
            'is_read' => 0,
        ]);
        Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Test Notification 2',
            'is_read' => 1,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/notifications');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment(['pesan' => 'Test Notification 1']);
    }

    public function test_api_mark_notification_as_read()
    {
        $user = User::factory()->create();
        $notif = Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Test Unread',
            'is_read' => 0,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/notifications/'.$notif->notifikasi_id.'/read');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Notifikasi ditandai telah dibaca.',
        ]);

        $this->assertEquals(1, $notif->fresh()->is_read);
    }

    public function test_api_mark_all_notifications_as_read()
    {
        $user = User::factory()->create();
        Notifikasi::create(['penerima_user_id' => $user->user_id, 'pesan' => 'N1', 'is_read' => 0]);
        Notifikasi::create(['penerima_user_id' => $user->user_id, 'pesan' => 'N2', 'is_read' => 0]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/notifications/read-all');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Semua notifikasi ditandai telah dibaca.',
        ]);

        $this->assertEquals(0, Notifikasi::where('penerima_user_id', $user->user_id)->where('is_read', 0)->count());
    }

    public function test_api_notifications_do_not_leak_to_other_users()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        Notifikasi::create([
            'penerima_user_id' => $userB->user_id,
            'pesan' => 'For B',
            'is_read' => 0,
        ]);

        $token = $userA->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/notifications');

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data');
    }

    public function test_api_user_cannot_mark_other_users_notification_as_read()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $notif = Notifikasi::create([
            'penerima_user_id' => $userB->user_id,
            'pesan' => 'For B',
            'is_read' => 0,
        ]);

        $token = $userA->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/notifications/'.$notif->notifikasi_id.'/read');

        $response->assertStatus(403);
        $this->assertEquals(0, $notif->fresh()->is_read);
    }

    public function test_api_mark_as_read_is_idempotent()
    {
        $user = User::factory()->create();
        $notif = Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Read',
            'is_read' => 1,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/notifications/'.$notif->notifikasi_id.'/read');

        $response->assertStatus(200);
        $this->assertEquals(1, $notif->fresh()->is_read);
    }
}
