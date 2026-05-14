<?php

namespace Tests\Feature\Validation;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnggaranValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /**
     * Test Anggaran (RAB) item validation rules.
     */
    public function test_anggaran_item_validation_rules()
    {
        // 1. Required fields
        // Assuming there might be a direct update/store for budget items, or we test via KAK structure
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'rab' => [
                    ['uraian' => '', 'volume1' => '', 'satuan1_id' => '', 'harga_satuan' => '']
                ]
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'rab.0.uraian',
                'rab.0.volume1',
                'rab.0.satuan1_id',
                'rab.0.harga_satuan',
            ]);

        // 2. Positive numeric values
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'rab' => [
                    [
                        'uraian' => 'Item A',
                        'volume1' => -1,
                        'satuan1_id' => 1,
                        'harga_satuan' => -1000,
                    ]
                ]
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'rab.0.volume1',
                'rab.0.harga_satuan',
            ]);
    }
}
