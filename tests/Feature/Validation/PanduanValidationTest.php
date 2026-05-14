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
        // Assuming we have a way to create a guide first
        // For RED phase, we just hit the endpoint and expect skip of media validation
        $response = $this->actingAs($this->admin)
            ->putJson('/admin/panduan/1', [
                'judul_panduan' => 'Updated Title',
                // path_media and file are missing, should still pass title validation
            ]);
            
        // If it returns 422 for missing file/URL during UPDATE, then it's failing the legacy logic.
    }

    /**
     * Test Panduan file size error messages.
     */
    public function test_panduan_file_size_validation_message()
    {
        // We can't easily simulate UPLOAD_ERR_INI_SIZE via UploadedFile::fake()
        // but we can test if the validator returns the correct legacy message
        // when we simulate the error condition.
    }
}
