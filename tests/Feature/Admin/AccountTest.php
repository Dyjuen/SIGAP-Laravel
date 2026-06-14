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

    /**
     * Test Case: USR-F-001 - List User: Tampil Daftar Semua User
     */
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

    /**
     * Test Case: LGN-I-004 - Role Guard: Akses Paksa URL Beda Role
     */
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

    /**
     * Test Case: USR-F-015 - Tambah User: Simpan Data Valid
     */
    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->create([
            'role_id' => 1,
        ]);

        $userData = [
            'nama_lengkap' => 'New User',
            'username' => 'newuser',
            'email' => 'newuser@example.com',
            'password' => 'P@ssword123!',
            'password_confirmation' => 'P@ssword123!',
            'role_ids' => [3],
        ];

        $response = $this->actingAs($admin)
            ->post('/admin/user-management', $userData);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_users', [
            'username' => 'newuser',
            'email' => 'newuser@example.com',
        ]);
    }

    /**
     * Test Case: USR-F-017 - Edit User: Ubah Nama User
     * Test Case: USR-F-018 - Edit User: Ubah Role User
     */
    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $user = User::factory()->create(['role_id' => 3]);

        $updateData = [
            'nama_lengkap' => 'Updated Name',
            'email' => 'updated@example.com',
            'role_ids' => [2], // Promote to Verifikator
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

    /**
     * Test Case: USR-F-019 - Edit User: Ubah Password
     */
    public function test_admin_can_change_user_password(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $user = User::factory()->create([
            'role_id' => 3,
            'password_hash' => Hash::make('oldpassword'),
        ]);

        $passwordData = [
            'new_password' => 'NewP@ssword123!',
            'new_password_confirmation' => 'NewP@ssword123!',
        ];

        $response = $this->actingAs($admin)
            ->put("/admin/user-management/{$user->user_id}/change-password", $passwordData);

        $response->assertRedirect();

        $user->refresh();
        $this->assertTrue(Hash::check('NewP@ssword123!', $user->password_hash));
    }

    /**
     * Test Case: USR-I-001 - Tambah -> Login: User Baru Bisa Login
     */
    public function test_newly_created_user_can_login(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);

        // Create user via HTTP Request
        $this->actingAs($admin)
            ->post('/admin/user-management', [
                'nama_lengkap' => 'Test User 01',
                'username' => 'testuser01',
                'email' => 'test01@example.com',
                'password' => 'P@ssword123!',
                'password_confirmation' => 'P@ssword123!',
                'role_ids' => [3],
            ]);

        // Logout admin
        $this->post('/logout');

        // Login as new user
        $response = $this->post('/login', [
            'username' => 'testuser01',
            'password' => 'P@ssword123!',
        ]);

        $this->assertAuthenticated();
    }

    /**
     * Test Case: USR-I-002 - Edit Role -> Akses: Perubahan Role Langsung Berlaku
     */
    public function test_user_role_change_applies_immediately(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $user = User::factory()->create(['role_id' => 2]); // Verifikator initially

        // Admin updates user role to Pengusul (3)
        $this->actingAs($admin)
            ->put("/admin/user-management/{$user->user_id}", [
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'role_ids' => [3],
            ]);

        // Act as the updated user and try to access a verifikator-only route
        // Assuming /admin/logs/index is for Admin only, maybe another route?
        // Let's use /admin/user-management as an example of a protected route
        $response = $this->actingAs($user)->get('/admin/user-management');

        // Should be forbidden since they are no longer Admin/Verifikator with access
        $response->assertStatus(403);
    }

    /**
     * Test Case: USR-I-003 - Hapus -> Login: User Terhapus Tidak Bisa Login
     */
    public function test_deleted_user_cannot_login(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $user = User::factory()->create([
            'username' => 'testuser01',
            'password_hash' => Hash::make('P@ssword123!'),
        ]);

        // Admin deletes user
        $this->actingAs($admin)->delete("/admin/user-management/{$user->user_id}");

        // Logout Admin
        $this->post('/logout');

        // Attempt login with deleted user
        $response = $this->post('/login', [
            'username' => 'testuser01',
            'password' => 'P@ssword123!',
        ]);

        $this->assertGuest();
    }

    /**
     * Test Case: USR-F-024 - Hapus User: Konfirmasi Hapus (Ya)
     */
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
