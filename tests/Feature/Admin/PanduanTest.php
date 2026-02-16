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

        // Seed roles
        if (Role::count() === 0) {
            Role::create(['role_id' => 1, 'nama_role' => 'Admin']);
            Role::create(['role_id' => 2, 'nama_role' => 'Verifikator']);
            Role::create(['role_id' => 3, 'nama_role' => 'Pengusul']);
        }
    }

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

    public function test_non_admin_cannot_view_panduan_page(): void
    {
        $user = User::factory()->create(['role_id' => 3]); // Pengusul

        $response = $this->actingAs($user)
            ->get(route('admin.panduan.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_create_document_panduan(): void
    {
        Storage::fake('public');
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
        $files = Storage::disk('public')->files('panduan');
        $this->assertNotEmpty($files);
    }

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

    public function test_admin_can_delete_panduan(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role_id' => 1]);
        $file = UploadedFile::fake()->create('delete.pdf', 100);
        $path = $file->store('panduan', 'public');

        $panduan = Panduan::create([
            'judul_panduan' => 'To Delete',
            'tipe_media' => 'document',
            'path_media' => $path,
        ]);

        $response = $this->actingAs($admin)
            ->delete(route('admin.panduan.destroy', $panduan->panduan_id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('m_panduan', ['panduan_id' => $panduan->panduan_id]);
        Storage::disk('public')->assertMissing($path);
    }

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

    public function test_validation_rejects_invalid_file_type(): void
    {
        Storage::fake('public');
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

    public function test_admin_can_download_document(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role_id' => 1]);
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $path = $file->store('panduan', 'public');

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

        // It should redirect back with validation errors or handle it in the controller
        // Based on current implementation, it doesn't error out but remains in corrupted state.
        // We want it to fail validation or at least not be in corrupted state.
        $response->assertSessionHasErrors('file');
    }
}
