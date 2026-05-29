<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\UserService;
use App\Events\UserPasswordReset;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);
        $this->service = new UserService();
    }

    public function test_it_creates_a_user_successfully(): void
    {
        $data = [
            'username' => 'testuser',
            'password' => 'secret123',
            'nama_lengkap' => 'Test User',
            'email' => 'testuser@example.com',
            'role_id' => 3,
        ];

        $user = $this->service->create($data);

        $this->assertDatabaseHas('m_users', [
            'username' => 'testuser',
            'nama_lengkap' => 'Test User',
            'email' => 'testuser@example.com',
            'role_id' => 3,
        ]);

        $this->assertTrue(Hash::check('secret123', $user->password_hash));
    }

    public function test_it_updates_a_user_successfully(): void
    {
        $user = User::factory()->create([
            'nama_lengkap' => 'Old Name',
            'email' => 'old@example.com',
        ]);

        $data = [
            'nama_lengkap' => 'New Name',
            'email' => 'new@example.com',
            'role_id' => 3,
        ];

        $this->service->update($user, $data);

        $this->assertDatabaseHas('m_users', [
            'user_id' => $user->user_id,
            'nama_lengkap' => 'New Name',
            'email' => 'new@example.com',
        ]);
    }

    public function test_it_changes_password_and_dispatches_event(): void
    {
        Event::fake();

        $user = User::factory()->create([
            'nama_lengkap' => 'User Reset',
            'email' => 'reset@example.com',
        ]);

        $this->service->changePassword($user, 'newsecret123');

        $user->refresh();
        $this->assertTrue(Hash::check('newsecret123', $user->password_hash));

        Event::assertDispatched(UserPasswordReset::class, function ($event) use ($user) {
            return $event->user->user_id === $user->user_id && $event->newPassword === 'newsecret123';
        });
    }
}
