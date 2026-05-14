<?php

namespace Tests\Feature\Validation;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class PanduanValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $role = new \App\Models\Role();
        $role->role_id = 1; // Admin
        $role->nama_role = 'Admin';
        $role->save();
        
        $this->admin = User::factory()->create(['role_id' => 1]);
    }

    /**
     * Test Panduan creation validation rules.
     */
    public function test_panduan_create_validation_rules()
    {
        // 1. Required fields
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/panduan', []);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['judul_panduan', 'tipe_media']);

        // 2. Required file for document type
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/panduan', [
                'judul_panduan' => 'Panduan Penggunaan',
                'tipe_media' => 'document',
                'file' => '',
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'file' => 'File Dokumen wajib diisi jika tipe media adalah document.',
            ]);

        // 3. Required URL for video type
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/panduan', [
                'judul_panduan' => 'Video Tutorial',
                'tipe_media' => 'video',
                'path_media' => '',
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'path_media' => 'URL Video wajib diisi jika tipe media adalah video.',
            ]);
    }

    /**
     * Test Panduan update validation rules.
     */
    public function test_panduan_update_validation_rules()
    {
        $panduan = \App\Models\Panduan::create([
            'judul_panduan' => 'Old Title',
            'tipe_media' => 'document',
            'path_media' => 'old/path.pdf'
        ]);

        // 1. Successful update of title and role
        $response = $this->actingAs($this->admin)
            ->putJson("/admin/panduan/{$panduan->panduan_id}", [
                'judul_panduan' => 'Updated Title',
                'tipe_media' => 'document',
                'target_role_id' => 1
            ]);
            
        $response->assertStatus(302); // Redirect back
        $this->assertDatabaseHas('m_panduan', [
            'panduan_id' => $panduan->panduan_id,
            'judul_panduan' => 'Updated Title',
            'target_role_id' => 1
        ]);

        // 2. Switching from document to video requires path_media
        $response = $this->actingAs($this->admin)
            ->putJson("/admin/panduan/{$panduan->panduan_id}", [
                'judul_panduan' => 'Switch to Video',
                'tipe_media' => 'video',
                'path_media' => ''
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['path_media']);

        // 3. Switching from video back to document requires file
        $panduan->update(['tipe_media' => 'video', 'path_media' => 'https://youtube.com/watch?v=123']);
        $response = $this->actingAs($this->admin)
            ->putJson("/admin/panduan/{$panduan->panduan_id}", [
                'judul_panduan' => 'Switch back to Doc',
                'tipe_media' => 'document',
                'file' => ''
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /**
     * Test Panduan file size error messages.
     */
    public function test_panduan_file_size_validation_message()
    {
        $file = UploadedFile::fake()->create('large.pdf', 20480); // 20MB, exceeds 10MB limit

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/panduan', [
                'judul_panduan' => 'Too Big',
                'tipe_media' => 'document',
                'file' => $file
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'file' => 'File Dokumen tidak boleh lebih dari 10240 kilobyte.',
            ]);
    }
}
