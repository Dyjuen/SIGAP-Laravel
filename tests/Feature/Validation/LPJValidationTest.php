<?php

namespace Tests\Feature\Validation;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LPJValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $bendahara;

    private Kegiatan $kegiatan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);

        $this->bendahara = User::factory()->create(['role_id' => 6]); // Bendahara

        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 11]); // Review LPJ
        $this->kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
    }

    public function test_lpj_revise_validation_rules()
    {
        // Test LPJ-F-003: Empty catatan_reviewer
        $response = $this->actingAs($this->bendahara)
            ->postJson(route('lpj.revise', $this->kegiatan), [
                'lampiran_comments' => [
                    ['id' => 1, 'catatan_reviewer' => ''],
                ],
                'anggaran_comments' => [
                    ['id' => 1, 'catatan_reviewer' => ''],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'lampiran_comments.0.catatan_reviewer',
                'anggaran_comments.0.catatan_reviewer',
            ]);

        // Test LPJ-F-004: Catatan reviewer max 1000 characters
        $longComment = str_repeat('a', 1001);
        $response = $this->actingAs($this->bendahara)
            ->postJson(route('lpj.revise', $this->kegiatan), [
                'lampiran_comments' => [
                    ['id' => 1, 'catatan_reviewer' => $longComment],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['lampiran_comments.0.catatan_reviewer']);

        // Test LPJ-F-005: ID Lampiran invalid (exists check)
        $response = $this->actingAs($this->bendahara)
            ->postJson(route('lpj.revise', $this->kegiatan), [
                'lampiran_comments' => [
                    ['id' => 99999, 'catatan_reviewer' => 'Valid comment'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['lampiran_comments.0.id']);
    }
}
