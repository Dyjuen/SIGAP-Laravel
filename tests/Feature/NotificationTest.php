<?php

namespace Tests\Feature;

use App\Models\Notifikasi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Middleware Tests
     */
    /**
     * Test Case: NTF-F-001 - Badge: Muncul Notifikasi Baru
     * Test Case: NTF-F-002 - Badge: Badge Bertambah Setiap Notif Baru
     */
    public function test_inertia_shared_props_contains_unread_notifications_for_authenticated_user(): void
    {
        $user = User::factory()->create(['user_id' => 1]);

        // Create 3 unread notifications
        Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Test 1',
            'is_read' => 0,
        ]);
        Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Test 2',
            'is_read' => 0,
        ]);
        Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Test 3',
            'is_read' => 1, // Read
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertInertia(fn ($page) => $page
            ->has('auth.user.unread_notifications', 2)
            ->where('auth.user.unread_notifications.0.pesan', 'Test 2') // Latest first (assumed order)
        );
    }

    public function test_inertia_shared_props_limits_to_10_latest_unread_notifications(): void
    {
        $user = User::factory()->create(['user_id' => 1]);

        // Create 15 unread notifications
        for ($i = 1; $i <= 15; $i++) {
            Notifikasi::create([
                'penerima_user_id' => $user->user_id,
                'pesan' => "Test $i",
                'is_read' => 0,
            ]);
        }

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertInertia(fn ($page) => $page
            ->has('auth.user.unread_notifications', 10)
        );
    }

    /**
     * Test Case: NTF-I-005 - Notif ↔ Role: Notif Hanya Muncul Sesuai Role
     */
    public function test_notifications_do_not_leak_to_other_users(): void
    {
        $userA = User::factory()->create(['user_id' => 1]);
        $userB = User::factory()->create(['user_id' => 2]);

        Notifikasi::create([
            'penerima_user_id' => $userB->user_id,
            'pesan' => 'For B',
            'is_read' => 0,
        ]);

        $response = $this->actingAs($userA)->get('/dashboard');

        $response->assertInertia(fn ($page) => $page
            ->has('auth.user.unread_notifications', 0)
        );
    }

    /**
     * API Endpoint Tests: POST /notifications/{id}/read
     */
    /**
     * Test Case: NTF-F-005 - Read: Tandai Satu Notifikasi Dibaca
     */
    public function test_user_can_mark_own_notification_as_read(): void
    {
        $user = User::factory()->create(['user_id' => 1]);
        $notif = Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Unread',
            'is_read' => 0,
        ]);

        $response = $this->actingAs($user)->post("/notifications/{$notif->notifikasi_id}/read");

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_notifikasi', [
            'notifikasi_id' => $notif->notifikasi_id,
            'is_read' => 1,
        ]);
    }

    public function test_user_cannot_mark_other_users_notification_as_read(): void
    {
        $userA = User::factory()->create(['user_id' => 1]);
        $userB = User::factory()->create(['user_id' => 2]);
        $notif = Notifikasi::create([
            'penerima_user_id' => $userB->user_id,
            'pesan' => 'For B',
            'is_read' => 0,
        ]);

        $response = $this->actingAs($userA)->post("/notifications/{$notif->notifikasi_id}/read");

        // Should return 403 or 404
        $response->assertStatus(403);
        $this->assertDatabaseHas('t_notifikasi', [
            'notifikasi_id' => $notif->notifikasi_id,
            'is_read' => 0,
        ]);
    }

    public function test_unauthenticated_user_cannot_mark_notification_as_read(): void
    {
        $user = User::factory()->create(['user_id' => 10]);
        $notif = Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'For Someone',
            'is_read' => 0,
        ]);

        $response = $this->post("/notifications/{$notif->notifikasi_id}/read");

        $response->assertStatus(302); // Redirect to login
    }

    public function test_mark_as_read_is_idempotent(): void
    {
        $user = User::factory()->create(['user_id' => 1]);
        $notif = Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => 'Read',
            'is_read' => 1,
        ]);

        $response = $this->actingAs($user)->post("/notifications/{$notif->notifikasi_id}/read");

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_notifikasi', [
            'notifikasi_id' => $notif->notifikasi_id,
            'is_read' => 1,
        ]);
    }

    /**
     * Test Case: NTF-F-007 - Mark All: Tandai Semua Notifikasi Dibaca
     */
    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create(['user_id' => 1]);
        $otherUser = User::factory()->create(['user_id' => 2]);
        Notifikasi::create(['penerima_user_id' => $user->user_id, 'pesan' => '1', 'is_read' => 0]);
        Notifikasi::create(['penerima_user_id' => $user->user_id, 'pesan' => '2', 'is_read' => 0]);
        Notifikasi::create(['penerima_user_id' => $otherUser->user_id, 'pesan' => 'Other', 'is_read' => 0]);

        $response = $this->actingAs($user)->post('/notifications/read-all');

        $response->assertStatus(200);
        $this->assertEquals(2, Notifikasi::where('penerima_user_id', $user->user_id)->where('is_read', 1)->count());
        $this->assertEquals(0, Notifikasi::where('penerima_user_id', $user->user_id)->where('is_read', 0)->count());
        $this->assertEquals(1, Notifikasi::where('penerima_user_id', $otherUser->user_id)->where('is_read', 0)->count());
    }
}
