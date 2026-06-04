<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (Role::count() === 0) {
            Role::create(['role_id' => 1, 'nama_role' => 'Admin']);
        }
    }

    /**
     * Test Case: USR-F-010 - Validasi Tambah: Username Mengandung Spasi
     */
    public function test_username_cannot_contain_spaces()
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $response = $this->actingAs($admin)
            ->post('/admin/user-management', [
                'nama_lengkap' => 'Test User',
                'username' => 'test dika',
                'email' => 'test@gmail.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role_ids' => [1],
            ]);

        $response->assertSessionHasErrors('username');
    }

    /**
     * Test Case: USR-F-011 - Validasi Tambah: Format Email Tidak Valid
     */
    public function test_email_format_must_be_valid()
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $response = $this->actingAs($admin)
            ->post('/admin/user-management', [
                'nama_lengkap' => 'Test User',
                'username' => 'testuser',
                'email' => 'dikagmail.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role_ids' => [1],
            ]);

        $response->assertSessionHasErrors('email');
    }

    /**
     * Test Case: USR-F-012 - Validasi Tambah: Role Tidak Dipilih
     */
    public function test_role_is_required()
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $response = $this->actingAs($admin)
            ->post('/admin/user-management', [
                'nama_lengkap' => 'Test User',
                'username' => 'testuser',
                'email' => 'test@gmail.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role_ids' => [], // Missing role
            ]);

        $response->assertSessionHasErrors('role_ids');
    }

    /**
     * Test Case: USR-F-013 - Validasi Tambah: Password < 8 Karakter
     */
    public function test_password_min_8_characters()
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $response = $this->actingAs($admin)
            ->post('/admin/user-management', [
                'nama_lengkap' => 'Test User',
                'username' => 'testuser',
                'email' => 'test@gmail.com',
                'password' => 'dika1',
                'password_confirmation' => 'dika1',
                'role_ids' => [1],
            ]);

        $response->assertSessionHasErrors('password');
    }

    /**
     * Test Case: USR-F-021 - Validasi Edit: Email Sudah Digunakan User Lain
     */
    public function test_email_must_be_unique_on_edit()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $otherUser = User::factory()->create(['email' => 'nonaktif@gmail.com']);
        $userToEdit = User::factory()->create(['email' => 'testdika@gmail.com']);

        $response = $this->actingAs($admin)
            ->put("/admin/user-management/{$userToEdit->user_id}", [
                'nama_lengkap' => 'Admin',
                'email' => 'nonaktif@gmail.com',
                'role_ids' => [1],
            ]);

        $response->assertSessionHasErrors('email');
    }

    /**
     * Test Case: USR-F-022 - Validasi Edit: Format Email Tidak Valid
     */
    public function test_email_must_be_valid_format_on_edit()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $userToEdit = User::factory()->create(['email' => 'testdika@gmail.com']);

        $response = $this->actingAs($admin)
            ->put("/admin/user-management/{$userToEdit->user_id}", [
                'nama_lengkap' => 'Admin',
                'email' => 'testingdika@', // Invalid format
                'role_ids' => [1],
            ]);

        $response->assertSessionHasErrors('email');
    }
}
