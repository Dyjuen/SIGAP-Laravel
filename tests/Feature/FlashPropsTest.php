<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FlashPropsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
    }

    public function test_flash_messages_are_shared_via_inertia(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession([
                'success' => 'Operasi sukses.',
                'error' => 'Terjadi kesalahan.',
            ])
            ->get(route('dashboard'))
            ->assertInertia(
                fn (Assert $page) => $page
                    ->where('flash.success', 'Operasi sukses.')
                    ->where('flash.error', 'Terjadi kesalahan.')
            );
    }
}
