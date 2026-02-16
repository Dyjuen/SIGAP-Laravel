<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles if not present
        if (Role::count() === 0) {
            Role::create(['role_id' => 1, 'nama_role' => 'Admin']);
            Role::create(['role_id' => 2, 'nama_role' => 'Verifikator']);
            Role::create(['role_id' => 3, 'nama_role' => 'Pengusul']);
        }
    }

    public function test_admin_can_view_user_management_page(): void
    {
        $admin = User::factory()->create([
            'role_id' => 1,
            'password_hash' => Hash::make('password'),
        ]);

        $response = $this->actingAs($admin)
            ->get('/admin/user-management');

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Admin/UserManagement/Index')
                    ->has('users')
                    ->has('roles')
            );
    }

    public function test_non_admin_cannot_view_user_management_page(): void
    {
        $user = User::factory()->create([
            'role_id' => 3, // Pengusul
            'password_hash' => Hash::make('password'),
        ]);

        $response = $this->actingAs($user)
            ->get('/admin/user-management');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->create([
            'role_id' => 1,
        ]);

        $userData = [
            'nama_lengkap' => 'New User',
            'username' => 'newuser',
            'email' => 'newuser@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role_id' => 3,
        ];

        $response = $this->actingAs($admin)
            ->post('/admin/user-management', $userData);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_users', [
            'username' => 'newuser',
            'email' => 'newuser@example.com',
        ]);
    }

    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $user = User::factory()->create(['role_id' => 3]);

        $updateData = [
            'nama_lengkap' => 'Updated Name',
            'email' => 'updated@example.com',
            'role_id' => 2, // Promote to Verifikator
        ];

        $response = $this->actingAs($admin)
            ->put("/admin/user-management/{$user->user_id}", $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_users', [
            'user_id' => $user->user_id,
            'nama_lengkap' => 'Updated Name',
            'email' => 'updated@example.com',
            'role_id' => 2,
        ]);
    }

    public function test_admin_can_change_user_password(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $user = User::factory()->create([
            'role_id' => 3,
            'password_hash' => Hash::make('oldpassword'),
        ]);

        $passwordData = [
            'new_password' => 'newpassword',
            'new_password_confirmation' => 'newpassword',
        ];

        $response = $this->actingAs($admin)
            ->put("/admin/user-management/{$user->user_id}/change-password", $passwordData);

        $response->assertRedirect();

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword', $user->password_hash));
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $user = User::factory()->create(['role_id' => 3]);

        $response = $this->actingAs($admin)
            ->delete("/admin/user-management/{$user->user_id}");

        $response->assertRedirect();
        // Since we use SoftDeletes, confirm it's soft deleted
        $this->assertSoftDeleted('m_users', ['user_id' => $user->user_id]);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $response = $this->actingAs($admin)
            ->delete("/admin/user-management/{$admin->user_id}");

        $response->assertStatus(403);
        $this->assertNotSoftDeleted('m_users', ['user_id' => $admin->user_id]);
    }
}
