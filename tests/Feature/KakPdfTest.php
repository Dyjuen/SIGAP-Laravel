<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KakPdfTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
    }

    /**
     * Test Case: KAK-FT-020 - PDF: Export PDF KAK
     */
    public function test_pengusul_can_export_kak_pdf(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'nama_kegiatan' => 'Test PDF Export']);

        $response = $this->actingAs($user)->get(route('kak.pdf.download', $kak->kak_id));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', 'attachment; filename=KAK_Test_PDF_Export.pdf');

        // Check if content is actually a PDF (starts with %PDF)
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    /**
     * Test Case: KAK-FT-036 - PDF: Preview PDF Blob
     */
    public function test_pengusul_can_preview_kak_pdf_blob(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id]);

        $response = $this->actingAs($user)->get(route('kak.pdf.preview-blob', $kak->kak_id));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'fileName',
            'mimeType',
            'base64',
        ]);

        $data = $response->json();
        $this->assertEquals('application/pdf', $data['mimeType']);
        $this->assertTrue(base64_decode($data['base64'], true) !== false);
        $this->assertStringStartsWith('%PDF', base64_decode($data['base64']));
    }

    public function test_verifikator_can_preview_kak_pdf_matching_tipe(): void
    {
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->create(['tipe_kegiatan_id' => 1]);

        $response = $this->actingAs($verif)->get(route('kak.pdf.preview', $kak->kak_id));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_verifikator_cannot_preview_mismatched_tipe_kak_pdf(): void
    {
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->create(['tipe_kegiatan_id' => 2]);

        $response = $this->actingAs($verif)->get(route('kak.pdf.preview', $kak->kak_id));

        $response->assertStatus(403);
    }
}
