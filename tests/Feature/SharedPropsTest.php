<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SharedPropsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);
    }

    public function test_role_id_is_shared_in_auth_user_props(): void
    {
        $user = User::factory()->create(['role_id' => 1]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Dashboard')
                    ->where('auth.user.role_id', 1)
                    ->where('auth.user.id', $user->user_id)
            );
    }

    public function test_role_id_is_null_for_guest(): void
    {
        $this->get(route('login'))
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Auth/Login')
                    ->where('auth.user', null)
            );
    }
}
