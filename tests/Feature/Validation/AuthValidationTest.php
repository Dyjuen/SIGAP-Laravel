<?php

namespace Tests\Feature\Validation;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthValidationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test login validation rules and messages.
     */
    public function test_login_validation_rules()
    {
        // 1. Required fields
        $response = $this->postJson('/login', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'username' => 'Username harus diisi.',
                'password' => 'Password harus diisi.',
            ]);

        // 2. Alphanumeric, min:3, max:50 for username
        $response = $this->postJson('/login', [
            'username' => 'a!', // non-alphanumeric and too short
            'password' => '123', // too short
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'username' => [
                    'Username hanya boleh berisi huruf dan angka.',
                    'Username minimal 3 karakter.',
                ],
                'password' => 'Password minimal 6 karakter.',
            ]);

        // 3. Max length
        $response = $this->postJson('/login', [
            'username' => str_repeat('a', 51),
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'username' => 'Username maksimal 50 karakter.',
            ]);
    }

    /**
     * Test registration validation rules and messages.
     */
    public function test_register_validation_rules()
    {
        $role = Role::create(['nama_role' => 'Admin', 'role_id' => 1]);
        $admin = User::factory()->create(['role_id' => $role->role_id]);

        // 1. Required fields
        $response = $this->actingAs($admin)
            ->postJson('/admin/user-management', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'username',
                'email',
                'password',
                'nama_lengkap',
                'role_ids',
            ]);

        // 2. Unique username and email
        User::factory()->create([
            'username' => 'existinguser',
            'email' => 'existing@example.com',
        ]);

        $response = $this->actingAs($admin)
            ->postJson('/admin/user-management', [
                'username' => 'existinguser',
                'email' => 'existing@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'nama_lengkap' => 'New User',
                'role_ids' => [1],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'username' => 'Username sudah digunakan.',
                'email' => 'Email sudah digunakan.',
            ]);

        // 3. Password confirmation
        $response = $this->actingAs($admin)
            ->postJson('/admin/user-management', [
                'username' => 'newuser',
                'email' => 'new@example.com',
                'password' => 'password123',
                'password_confirmation' => 'mismatch',
                'nama_lengkap' => 'New User',
                'role_ids' => [1],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'password' => 'Konfirmasi password tidak sama.',
            ]);

        // 4. Role selection
        $response = $this->actingAs($admin)
            ->postJson('/admin/user-management', [
                'username' => 'newuser',
                'email' => 'new@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'nama_lengkap' => 'New User',
                'role_ids' => [], // Empty array
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'role_ids' => 'Role harus dipilih minimal 1.',
            ]);
    }

    /**
     * Test profile update validation rules.
     */
    public function test_profile_update_validation_rules()
    {
        $user = User::factory()->create([
            'username' => 'myuser',
            'email' => 'my@example.com',
        ]);

        $otherUser = User::factory()->create([
            'username' => 'otheruser',
            'email' => 'other@example.com',
        ]);

        // Update with other user's email (should fail)
        $response = $this->actingAs($user)
            ->patchJson('/profile', [
                'nama_lengkap' => 'My Name',
                'email' => 'other@example.com',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'email' => 'Email sudah digunakan oleh user lain.',
            ]);

        // Update with own email (should pass validation, but may fail due to RED phase)
        $response = $this->actingAs($user)
            ->patchJson('/profile', [
                'nama_lengkap' => 'My Name',
                'email' => 'my@example.com',
            ]);

        // In RED phase, we expect implementation to be missing or different,
        // so we check if it fails with specific legacy messages.
    }
}
