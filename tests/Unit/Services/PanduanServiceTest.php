<?php

namespace Tests\Unit\Services;

use App\Models\Panduan;
use App\Services\PanduanService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PanduanServiceTest extends TestCase
{
    use RefreshDatabase;

    private PanduanService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);
        Storage::fake('supabase');
        $this->service = new PanduanService();
    }

    public function test_it_stores_video_panduan(): void
    {
        $data = [
            'judul_panduan' => 'Tutorial Video',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=123',
            'target_role_id' => 3,
        ];

        $p = $this->service->store($data);

        $this->assertDatabaseHas('m_panduan', [
            'panduan_id' => $p->panduan_id,
            'judul_panduan' => 'Tutorial Video',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=123',
        ]);
    }

    public function test_it_stores_document_panduan_file(): void
    {
        $file = UploadedFile::fake()->create('guide.pdf', 100);

        $data = [
            'judul_panduan' => 'Tutorial PDF',
            'tipe_media' => 'document',
            'target_role_id' => 3,
        ];

        $p = $this->service->store($data, $file);

        $this->assertNotNull($p->path_media);
        Storage::disk('supabase')->assertExists($p->path_media);
    }

    public function test_it_deletes_panduan_and_file(): void
    {
        $file = UploadedFile::fake()->create('guide.pdf', 100);
        $path = Storage::disk('supabase')->put('panduan', $file);

        $p = Panduan::create([
            'judul_panduan' => 'Manual Book',
            'tipe_media' => 'document',
            'path_media' => $path,
        ]);

        $this->service->delete($p);

        $this->assertDatabaseMissing('m_panduan', ['panduan_id' => $p->panduan_id]);
        Storage::disk('supabase')->assertMissing($path);
    }
}
