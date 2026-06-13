<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\UpgradePasswordSecuritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UpgradePasswordSecuritySeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    /**
     * Test the upgrade password security seeder execution.
     */
    public function test_upgrade_password_security_seeder(): void
    {
        // 1. Seed initial master data and users
        $this->seed(MasterDataSeeder::class);
        $this->seed(UserSeeder::class);

        // Capture initial password hashes of users
        $initialUsers = User::all();
        $this->assertNotEmpty($initialUsers);
        $initialHashes = $initialUsers->pluck('password_hash', 'username')->toArray();

        // 2. Run the UpgradePasswordSecuritySeeder
        $this->seed(UpgradePasswordSecuritySeeder::class);

        // 3. Assert the JSON log file was created
        Storage::disk('local')->assertExists('secure_passwords.json');
        
        $jsonContent = Storage::disk('local')->get('secure_passwords.json');
        $credentials = json_decode($jsonContent, true);
        $this->assertIsArray($credentials);

        // 4. Verify password changes and credentials
        foreach ($credentials as $username => $cred) {
            $this->assertEquals($username, $cred['username']);
            $this->assertNotEmpty($cred['plain_password']);

            // Get user from DB
            $user = User::where('username', $username)->first();
            $this->assertNotNull($user);

            // Assert that the hash has changed
            $this->assertNotEquals($initialHashes[$username], $user->password_hash);

            // Assert the plain password satisfies complexity rules (SOP Keamanan Informasi)
            $plain = $cred['plain_password'];
            $this->assertGreaterThanOrEqual(10, strlen($plain));
            $this->assertMatchesRegularExpression('/[A-Z]/', $plain, 'Password must contain uppercase letters');
            $this->assertMatchesRegularExpression('/[a-z]/', $plain, 'Password must contain lowercase letters');
            $this->assertMatchesRegularExpression('/[0-9]/', $plain, 'Password must contain numbers');
            $this->assertMatchesRegularExpression('/[@#$%!^&*()\-_+=\[\]{}<>?~]/', $plain, 'Password must contain symbols');

            // Assert that the hash verifies correctly against the plain password
            $this->assertTrue(Hash::check($plain, $user->password_hash));

            // Verify authentication works with the new password
            $loginResponse = $this->post('/login', [
                'username' => $username,
                'password' => $plain,
            ]);

            $this->assertAuthenticatedAs($user);
            $this->post('/logout');
            $this->assertGuest();

            // Verify authentication fails with the old password (which was e.g. "admin123" or similar)
            // Note: UserSeeder uses values like "admin123", "verif1123"
            $oldPassword = ($username === 'admin') ? 'admin123' : 'password'; // some default or specific
            $this->post('/login', [
                'username' => $username,
                'password' => $oldPassword,
            ]);
            $this->assertGuest();
        }
    }
}
