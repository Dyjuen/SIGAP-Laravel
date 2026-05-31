<?php

namespace Tests\Feature\Admin;

use App\Models\Panduan;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PanduanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('supabase');

        // Seed roles
        if (Role::count() === 0) {
            Role::create(['role_id' => 1, 'nama_role' => 'Admin']);
            Role::create(['role_id' => 2, 'nama_role' => 'Verifikator']);
            Role::create(['role_id' => 3, 'nama_role' => 'Pengusul']);
        }
    }

    /**
     * Test Case: TC-P-F01 - Manajemen Panduan: Admin dapat mengakses halaman daftar panduan
     */
    public function test_admin_can_view_panduan_page(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $response = $this->actingAs($admin)
            ->get(route('admin.panduan.index'));

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Admin/Panduan/Index')
                    ->has('panduan')
                    ->has('roles')
            );
    }

    /**
     * Test Case: TC-P-F02 - Manajemen Panduan: Non-admin (Pengusul) dilarang akses halaman panduan
     */
    public function test_non_admin_cannot_view_panduan_page(): void
    {
        $user = User::factory()->create(['role_id' => 3]); // Pengusul

        $response = $this->actingAs($user)
            ->get(route('admin.panduan.index'));

        $response->assertStatus(403);
    }

    /**
     * Test Case: TC-P-F05 - Manajemen Panduan: Admin tambah panduan tipe Dokumen PDF
     * Test Case: TC-P-I01 - Manajemen Panduan [Integrasi]: Upload panduan → file tersimpan di Supabase Storage
     */
    public function test_admin_can_create_document_panduan(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $file = UploadedFile::fake()->create('guide.pdf', 100, 'application/pdf');

        $response = $this->actingAs($admin)
            ->post(route('admin.panduan.store'), [
                'judul_panduan' => 'Panduan PDF',
                'tipe_media' => 'document',
                'file' => $file,
                'target_role_id' => 3,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_panduan', [
            'judul_panduan' => 'Panduan PDF',
            'tipe_media' => 'document',
            'target_role_id' => 3,
        ]);

        // Assert file exists using the hash name standard behavior of store()
        // We need to check if ANY file exists in panduan/ folder
        $files = Storage::disk('supabase')->files('panduan');
        $this->assertNotEmpty($files);
    }

    /**
     * Test Case: TC-P-F04 - Manajemen Panduan: Admin tambah panduan tipe Video (YouTube)
     * Test Case: TC-P-F07 - Manajemen Panduan: Admin tambah panduan tanpa target role (untuk semua)
     */
    public function test_admin_can_create_video_panduan(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $videoUrl = 'https://youtube.com/watch?v=dQw4w9WgXcQ';

        $response = $this->actingAs($admin)
            ->post(route('admin.panduan.store'), [
                'judul_panduan' => 'Panduan Video',
                'tipe_media' => 'video',
                'path_media' => $videoUrl,
                'target_role_id' => null,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_panduan', [
            'judul_panduan' => 'Panduan Video',
            'tipe_media' => 'video',
            'path_media' => $videoUrl,
        ]);
    }

    /**
     * Test Case: TC-P-F12 - Manajemen Panduan: Admin update judul panduan video
     */
    public function test_admin_can_update_panduan(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $panduan = Panduan::create([
            'judul_panduan' => 'Old Title',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/old',
            'target_role_id' => 2,
        ]);

        $response = $this->actingAs($admin)
            ->put(route('admin.panduan.update', $panduan->panduan_id), [
                'judul_panduan' => 'New Title',
                'tipe_media' => 'video',
                'path_media' => 'https://youtube.com/new',
                'target_role_id' => 2,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_panduan', [
            'panduan_id' => $panduan->panduan_id,
            'judul_panduan' => 'New Title',
            'path_media' => 'https://youtube.com/new',
        ]);
    }

    /**
     * Test Case: TC-P-F16 - Manajemen Panduan: Admin hapus panduan dokumen
     * Test Case: TC-P-I02 - Manajemen Panduan [Integrasi]: Hapus panduan → file ikut terhapus dari Storage
     */
    public function test_admin_can_delete_panduan(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $file = UploadedFile::fake()->create('delete.pdf', 100);
        $path = $file->store('panduan', 'supabase');

        $panduan = Panduan::create([
            'judul_panduan' => 'To Delete',
            'tipe_media' => 'document',
            'path_media' => $path,
        ]);

        $response = $this->actingAs($admin)
            ->delete(route('admin.panduan.destroy', $panduan->panduan_id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('m_panduan', ['panduan_id' => $panduan->panduan_id]);
        $this->assertFalse(Storage::disk('supabase')->exists($path));
    }

    /**
     * Test Case: TC-P-F08 - Manajemen Panduan: Validasi: judul wajib diisi
     */
    public function test_validation_requires_judul(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $response = $this->actingAs($admin)
            ->post(route('admin.panduan.store'), [
                'tipe_media' => 'video',
                'path_media' => 'https://youtube.com/ws',
            ]);

        $response->assertSessionHasErrors('judul_panduan');
    }

    /**
     * Test Case: TC-P-F09 - Manajemen Panduan: Validasi: URL video harus domain YouTube
     */
    public function test_validation_rejects_non_youtube_url(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $response = $this->actingAs($admin)
            ->post(route('admin.panduan.store'), [
                'judul_panduan' => 'Invalid Video',
                'tipe_media' => 'video',
                'path_media' => 'https://vimeo.com/123', // Not YouTube
            ]);

        $response->assertSessionHasErrors('path_media');
    }

    /**
     * Test Case: TC-P-F11 - Manajemen Panduan: Validasi: format file tidak valid (.exe)
     */
    public function test_validation_rejects_invalid_file_type(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $file = UploadedFile::fake()->create('malicious.exe', 100);

        $response = $this->actingAs($admin)
            ->post(route('admin.panduan.store'), [
                'judul_panduan' => 'Virus',
                'tipe_media' => 'document',
                'file' => $file,
            ]);

        $response->assertSessionHasErrors('file');
    }

    /**
     * Test Case: TC-P-F18 - Manajemen Panduan: Download dokumen PDF
     */
    public function test_admin_can_download_document(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $path = $file->store('panduan', 'supabase');

        $panduan = Panduan::create([
            'judul_panduan' => 'Downloadable',
            'tipe_media' => 'document',
            'path_media' => $path,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.panduan.download', $panduan->panduan_id));

        $response->assertStatus(200);
        // Assert download headers or content if needed, but 200 is sufficient for basic existence check
        // Storage download returns StreamedResponse
    }

    /**
     * Test Case: TC-P-F15 - Manajemen Panduan: Validasi: ganti ke dokumen tanpa upload file
     */
    public function test_admin_cannot_switch_to_document_without_file(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $panduan = Panduan::create([
            'judul_panduan' => 'Video Guide',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        ]);

        $response = $this->actingAs($admin)
            ->put(route('admin.panduan.update', $panduan->panduan_id), [
                'judul_panduan' => 'Updated to Document',
                'tipe_media' => 'document',
                'target_role_id' => null,
                // 'file' is missing
            ]);

        $response->assertSessionHasErrors('file');
    }

    /**
     * Test Case: TC-P-F13 - Manajemen Panduan: Admin ganti panduan dari video ke dokumen
     */
    public function test_admin_switches_from_video_to_document_deletes_no_file(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $panduan = Panduan::create([
            'judul_panduan' => 'Video Guide',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=123',
        ]);

        $file = UploadedFile::fake()->create('new.pdf', 100);

        $response = $this->actingAs($admin)
            ->put(route('admin.panduan.update', $panduan->panduan_id), [
                'judul_panduan' => 'Now Document',
                'tipe_media' => 'document',
                'file' => $file,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_panduan', [
            'panduan_id' => $panduan->panduan_id,
            'tipe_media' => 'document',
        ]);
        $files = Storage::disk('supabase')->files('panduan');
        $this->assertNotEmpty($files);
    }

    /**
     * Test Case: TC-P-F14 - Manajemen Panduan: Admin ganti panduan dari dokumen ke video
     */
    public function test_admin_switches_from_document_to_video_deletes_old_file(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $oldFile = UploadedFile::fake()->create('old.pdf', 100);
        $oldPath = $oldFile->store('panduan', 'supabase');

        $panduan = Panduan::create([
            'judul_panduan' => 'Doc Guide',
            'tipe_media' => 'document',
            'path_media' => $oldPath,
        ]);

        $videoUrl = 'https://youtube.com/watch?v=new';

        $response = $this->actingAs($admin)
            ->put(route('admin.panduan.update', $panduan->panduan_id), [
                'judul_panduan' => 'Now Video',
                'tipe_media' => 'video',
                'path_media' => $videoUrl,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_panduan', [
            'panduan_id' => $panduan->panduan_id,
            'tipe_media' => 'video',
            'path_media' => $videoUrl,
        ]);
        $this->assertFalse(Storage::disk('supabase')->exists($oldPath));
    }

    /**
     * Test Case: TC-P-F19 - Manajemen Panduan: Preview dokumen PDF inline
     */
    public function test_admin_can_preview_document_inline(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $path = $file->store('panduan', 'supabase');

        $panduan = Panduan::create([
            'judul_panduan' => 'Previewable',
            'tipe_media' => 'document',
            'path_media' => $path,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.panduan.download', ['panduan' => $panduan->panduan_id, 'stream' => 1]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Disposition', 'inline; filename="Previewable.pdf"');
    }

    /**
     * Test Case: TC-P-F20 - Manajemen Panduan: Akses download panduan video → redirect ke YouTube
     */
    public function test_download_video_redirects_to_youtube(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $videoUrl = 'https://youtube.com/watch?v=abc';
        $panduan = Panduan::create([
            'judul_panduan' => 'Video',
            'tipe_media' => 'video',
            'path_media' => $videoUrl,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.panduan.download', $panduan->panduan_id));

        $response->assertRedirect($videoUrl);
    }

    /**
     * Test Case: TC-P-F21 - Manajemen Panduan: Download panduan yang file-nya tidak ada di storage
     */
    public function test_download_missing_file_returns_404(): void
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $panduan = Panduan::create([
            'judul_panduan' => 'Missing',
            'tipe_media' => 'document',
            'path_media' => 'panduan/nonexistent.pdf',
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.panduan.download', $panduan->panduan_id));

        $response->assertStatus(404);
    }

    /**
     * Test Case: TC-P-F22 - Manajemen Panduan: Pengguna tanpa login tidak bisa download panduan
     */
    public function test_guest_cannot_download_panduan(): void
    {
        $panduan = Panduan::create([
            'judul_panduan' => 'Secret',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=x',
        ]);

        $response = $this->get(route('admin.panduan.download', $panduan->panduan_id));

        $response->assertRedirect(route('login'));
    }
}
