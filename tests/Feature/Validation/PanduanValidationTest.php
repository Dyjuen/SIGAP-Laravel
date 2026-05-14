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
        $this->admin = User::factory()->create();
    }

    /**
     * Test Panduan creation validation rules.
     */
    public function test_panduan_create_validation_rules()
    {
        // 1. Required title
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/panduan', []);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['judul_panduan']);

        // 2. Either file or URL must be present
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/panduan', [
                'judul_panduan' => 'Panduan Penggunaan',
                'path_media' => '',
                // No file uploaded
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'file' => 'File atau URL tidak boleh kosong',
            ]);

        // 3. Valid with URL
        // In RED phase, we expect this to fail if implementation is missing,
        // but for now we focus on the failure cases.
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
