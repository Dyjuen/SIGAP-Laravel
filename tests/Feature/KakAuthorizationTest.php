<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KakAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
    }

    public function test_index_only_shows_owned_kaks_for_pengusul(): void
    {
        $user = User::factory()->create(['role_id' => 3]); // Pengusul
        $otherUser = User::factory()->create(['role_id' => 3]);

        $myKak = KAK::factory()->create(['pengusul_user_id' => $user->user_id]);
        $otherKak = KAK::factory()->create(['pengusul_user_id' => $otherUser->user_id]);

        $response = $this->actingAs($user)->get(route('kak.index'));

        $response->assertStatus(200)
            ->assertInertia(
                fn ($page) => $page
                    ->component('Kak/Index')
                    ->has('kaks.data', 1)
                    ->where('kaks.data.0.kak_id', $myKak->kak_id)
            );
    }

    public function test_index_only_shows_matching_tipe_kaks_for_verifikator(): void
    {
        // Verifikator 1 matches Tipe 1
        $verifikator1 = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);

        // Verifikator only sees KAKs in "Review Verifikator" status (status_id = 2)
        $kakTipe1 = KAK::factory()->create(['tipe_kegiatan_id' => 1, 'status_id' => 2]);
        $kakTipe2 = KAK::factory()->create(['tipe_kegiatan_id' => 2, 'status_id' => 2]);

        $response = $this->actingAs($verifikator1)->get(route('kak.index'));

        $response->assertStatus(200)
            ->assertInertia(
                fn ($page) => $page
                    ->component('Kak/Index')
                    ->has('kaks.data', 1)
                    ->where('kaks.data.0.kak_id', $kakTipe1->kak_id)
            );
    }

    public function test_verifikator_cannot_access_mismatched_tipe_kaks(): void
    {
        $verifikator1 = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kakTipe2 = KAK::factory()->create(['tipe_kegiatan_id' => 2]); // Mismatch

        // Detail
        $this->actingAs($verifikator1)
            ->get(route('kak.show', $kakTipe2->kak_id))
            ->assertStatus(403);

        // Approve
        $this->actingAs($verifikator1)
            ->post(route('kak.approve', $kakTipe2->kak_id))
            ->assertStatus(403);
    }

    public function test_pengusul_cannot_access_others_kaks(): void
    {
        $me = User::factory()->create(['role_id' => 3]);
        $other = User::factory()->create(['role_id' => 3]);
        $otherKak = KAK::factory()->create(['pengusul_user_id' => $other->user_id]);

        // Show
        $this->actingAs($me)
            ->get(route('kak.show', $otherKak->kak_id))
            ->assertStatus(403);

        // Edit
        $this->actingAs($me)
            ->get(route('kak.edit', $otherKak->kak_id))
            ->assertStatus(403);

        // Update
        $this->actingAs($me)
            ->put(route('kak.update', $otherKak->kak_id), [])
            ->assertStatus(403);

        // Delete
        $this->actingAs($me)
            ->delete(route('kak.destroy', $otherKak->kak_id))
            ->assertStatus(403);
    }

    public function test_verifikator_cannot_create_update_delete_kaks(): void
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->create(['tipe_kegiatan_id' => 1]);

        // Create
        $this->actingAs($verifikator)
            ->get(route('kak.create'))
            ->assertStatus(403);

        $this->actingAs($verifikator)
            ->post(route('kak.store'), [])
            ->assertStatus(403);

        // Update
        $this->actingAs($verifikator)
            ->put(route('kak.update', $kak->kak_id), [])
            ->assertStatus(403);

        // Delete
        $this->actingAs($verifikator)
            ->delete(route('kak.destroy', $kak->kak_id))
            ->assertStatus(403);
    }

    public function test_pengusul_cannot_approve_reject_revise(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 2]); // Review status

        $this->actingAs($pengusul)
            ->post(route('kak.approve', $kak->kak_id))
            ->assertStatus(403);

        $this->actingAs($pengusul)
            ->post(route('kak.reject', $kak->kak_id))
            ->assertStatus(403);

        $this->actingAs($pengusul)
            ->post(route('kak.revise', $kak->kak_id))
            ->assertStatus(403);
    }
}
