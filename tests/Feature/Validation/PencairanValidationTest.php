<?php

namespace Tests\Feature\Validation;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PencairanValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /**
     * Test Pencairan creation validation rules.
     */
    public function test_pencairan_create_validation_rules()
    {
        // 1. Required and numeric
        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan/1/pencairan', []);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'nominal_pencairan',
            ]);

        // 2. Minimum 1
        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan/1/pencairan', [
                'nominal_pencairan' => 0,
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'nominal_pencairan',
            ]);
    }

    /**
     * Test Pencairan rejection validation rules.
     */
    public function test_pencairan_reject_validation_rules()
    {
        // Rejection requires catatan_bendahara min 10
        $response = $this->actingAs($this->user)
            ->postJson('/kak/1/reject', [
                'catatan_bendahara' => 'Short', // Too short
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'catatan_bendahara',
            ]);
    }
}
