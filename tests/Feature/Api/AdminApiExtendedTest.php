<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Panduan;
use App\Models\SpkConfig;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiExtendedTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $pengusul;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        $this->admin = User::factory()->create(['role_id' => 1]); // Admin
        $this->pengusul = User::factory()->create(['role_id' => 3]); // Pengusul
    }

    public function test_admin_can_update_user()
    {
        $targetUser = User::factory()->create(['role_id' => 3, 'nama_lengkap' => 'Old Name']);
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/admin/users/'.$targetUser->user_id, [
            'username' => 'newusername',
            'nama_lengkap' => 'New Name',
            'email' => 'newemail@example.com',
            'role_ids' => [3],
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Profil user berhasil diupdate.',
        ]);

        $targetUser->refresh();
        $this->assertEquals('New Name', $targetUser->nama_lengkap);
    }

    public function test_admin_can_change_user_password()
    {
        $targetUser = User::factory()->create(['role_id' => 3]);
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/admin/users/'.$targetUser->user_id.'/change-password', [
            'new_password' => 'supersecretpass',
            'new_password_confirmation' => 'supersecretpass',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Password user berhasil diubah.',
        ]);
    }

    public function test_admin_can_update_panduan()
    {
        $guide = Panduan::create([
            'judul_panduan' => 'Old Title',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=123',
        ]);
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/admin/panduan/'.$guide->panduan_id, [
            'judul_panduan' => 'New Title',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=456',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Panduan berhasil diperbarui.',
        ]);

        $guide->refresh();
        $this->assertEquals('New Title', $guide->judul_panduan);
        $this->assertEquals('https://youtube.com/watch?v=456', $guide->path_media);
    }

    public function test_admin_can_get_spk()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/spk');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'spk_config',
            'kegiatans',
            'statistics'
        ]);
    }

    public function test_admin_can_update_spk_config()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/spk/config', [
            'weight_waktu' => 10,
            'weight_anggaran' => 40,
            'weight_output' => 30,
            'weight_lpj' => 20,
            'waktu_min' => 60,
            'waktu_max' => 100,
            'anggaran_min' => 60,
            'anggaran_max' => 100,
            'output_min' => 0,
            'output_max' => 100,
            'lpj_min' => 60,
            'lpj_max' => 100,
            'lpj_penalty_per_day' => 4,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Konfigurasi parameter SPK berhasil diperbarui.',
        ]);
    }

    public function test_admin_can_create_user()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/users', [
            'username' => 'newuser',
            'nama_lengkap' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_ids' => [3],
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'User berhasil ditambahkan.',
        ]);

        $this->assertDatabaseHas('m_users', [
            'username' => 'newuser',
            'email' => 'newuser@example.com',
        ]);
    }

    public function test_admin_can_delete_user()
    {
        $targetUser = User::factory()->create(['role_id' => 3]);
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->deleteJson('/api/admin/users/'.$targetUser->user_id);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'User berhasil dihapus.',
        ]);

        $this->assertSoftDeleted($targetUser);
    }

    public function test_admin_cannot_delete_self()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->deleteJson('/api/admin/users/'.$this->admin->user_id);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Anda tidak dapat menghapus akun sendiri.',
        ]);

        $this->assertNotSoftDeleted($this->admin);
    }

    public function test_non_admin_cannot_manage_users()
    {
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        // Get Users
        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/users')->assertStatus(403);

        // Create User
        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/users', [
            'username' => 'hackuser',
            'nama_lengkap' => 'Hack User',
            'email' => 'hack@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_ids' => [3],
        ])->assertStatus(403);

        // Delete User
        $targetUser = User::factory()->create(['role_id' => 3]);
        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->deleteJson('/api/admin/users/'.$targetUser->user_id)->assertStatus(403);
    }

    public function test_api_create_user_validation()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Space in username
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/users', [
            'username' => 'test space',
            'nama_lengkap' => 'Test User',
            'email' => 'test@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_ids' => [3],
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['username']);

        // Invalid email format
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/users', [
            'username' => 'testuser',
            'nama_lengkap' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_ids' => [3],
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);

        // Missing role
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/users', [
            'username' => 'testuser',
            'nama_lengkap' => 'Test User',
            'email' => 'test@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_ids' => [],
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role_ids']);

        // Password min 8
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/users', [
            'username' => 'testuser',
            'nama_lengkap' => 'Test User',
            'email' => 'test@gmail.com',
            'password' => 'pwd',
            'password_confirmation' => 'pwd',
            'role_ids' => [3],
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_api_user_search()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        User::factory()->create(['nama_lengkap' => 'Verifikator Akademik', 'username' => 'verifikator10', 'email' => 'v10@pnj.ac.id', 'role_id' => 2]);
        User::factory()->create(['nama_lengkap' => 'Other User', 'username' => 'otheruser', 'email' => 'other@pnj.ac.id', 'role_id' => 3]);

        // Search by exact name
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/users?search=Verifikator Akademik');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $this->assertEquals('Verifikator Akademik', $response->json('0.nama_lengkap'));

        // Search by case-insensitive name
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/users?search=verifikator akademik');
        $response->assertStatus(200);
        $response->assertJsonCount(1);

        // Search by username
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/users?search=otheruser');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $this->assertEquals('otheruser', $response->json('0.username'));

        // Search by role name
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/users?search=Verifikator');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $this->assertEquals('Verifikator Akademik', $response->json('0.nama_lengkap'));
    }

    public function test_api_admin_can_create_document_panduan()
    {
        \Illuminate\Support\Facades\Storage::fake('supabase');
        $token = $this->admin->createToken('test-token')->plainTextToken;
        $file = \Illuminate\Http\UploadedFile::fake()->create('guide.pdf', 100, 'application/pdf');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/panduan', [
            'judul_panduan' => 'Panduan PDF API',
            'tipe_media' => 'document',
            'file' => $file,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('m_panduan', [
            'judul_panduan' => 'Panduan PDF API',
            'tipe_media' => 'document',
        ]);
        $files = \Illuminate\Support\Facades\Storage::disk('supabase')->files('panduan');
        $this->assertNotEmpty($files);
    }

    public function test_api_admin_can_create_video_panduan()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;
        $videoUrl = 'https://youtube.com/watch?v=dQw4w9WgXcQ';

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/panduan', [
            'judul_panduan' => 'Panduan Video API',
            'tipe_media' => 'video',
            'path_media' => $videoUrl,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('m_panduan', [
            'judul_panduan' => 'Panduan Video API',
            'tipe_media' => 'video',
            'path_media' => $videoUrl,
        ]);
    }

    public function test_api_admin_can_delete_panduan()
    {
        \Illuminate\Support\Facades\Storage::fake('supabase');
        $token = $this->admin->createToken('test-token')->plainTextToken;
        $file = \Illuminate\Http\UploadedFile::fake()->create('delete.pdf', 100);
        $path = $file->store('panduan', 'supabase');

        $guide = Panduan::create([
            'judul_panduan' => 'To Delete API',
            'tipe_media' => 'document',
            'path_media' => $path,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->deleteJson('/api/admin/panduan/'.$guide->panduan_id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('m_panduan', ['panduan_id' => $guide->panduan_id]);
        $this->assertFalse(\Illuminate\Support\Facades\Storage::disk('supabase')->exists($path));
    }

    public function test_api_panduan_validation()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Requires judul
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/panduan', [
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=123',
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['judul_panduan']);

        // Reject non-youtube URL
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/panduan', [
            'judul_panduan' => 'Invalid Video',
            'tipe_media' => 'video',
            'path_media' => 'https://vimeo.com/123',
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['path_media']);
    }

    public function test_api_admin_cannot_switch_to_document_without_file()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;
        $guide = Panduan::create([
            'judul_panduan' => 'Video Guide',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=123',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/admin/panduan/'.$guide->panduan_id, [
            'judul_panduan' => 'Updated to Document',
            'tipe_media' => 'document',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['file']);
    }

    public function test_api_admin_switches_from_video_to_document_deletes_no_file()
    {
        \Illuminate\Support\Facades\Storage::fake('supabase');
        $token = $this->admin->createToken('test-token')->plainTextToken;
        $guide = Panduan::create([
            'judul_panduan' => 'Video Guide',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=123',
        ]);

        $file = \Illuminate\Http\UploadedFile::fake()->create('new.pdf', 100);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/admin/panduan/'.$guide->panduan_id, [
            'judul_panduan' => 'Now Document',
            'tipe_media' => 'document',
            'file' => $file,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('m_panduan', [
            'panduan_id' => $guide->panduan_id,
            'tipe_media' => 'document',
        ]);
        $files = \Illuminate\Support\Facades\Storage::disk('supabase')->files('panduan');
        $this->assertNotEmpty($files);
    }

    public function test_api_admin_switches_from_document_to_video_deletes_old_file()
    {
        \Illuminate\Support\Facades\Storage::fake('supabase');
        $token = $this->admin->createToken('test-token')->plainTextToken;
        $oldFile = \Illuminate\Http\UploadedFile::fake()->create('old.pdf', 100);
        $oldPath = $oldFile->store('panduan', 'supabase');

        $guide = Panduan::create([
            'judul_panduan' => 'Doc Guide',
            'tipe_media' => 'document',
            'path_media' => $oldPath,
        ]);

        $videoUrl = 'https://youtube.com/watch?v=new';

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/admin/panduan/'.$guide->panduan_id, [
            'judul_panduan' => 'Now Video',
            'tipe_media' => 'video',
            'path_media' => $videoUrl,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('m_panduan', [
            'panduan_id' => $guide->panduan_id,
            'tipe_media' => 'video',
            'path_media' => $videoUrl,
        ]);
        $this->assertFalse(\Illuminate\Support\Facades\Storage::disk('supabase')->exists($oldPath));
    }
}
