<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UpgradePasswordSecuritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $generatedCredentials = [];

        if ($users->isEmpty()) {
            $this->command->warn('Tidak ada user ditemukan di database.');
            return;
        }

        $this->command->info('Memulai peningkatan keamanan password untuk ' . $users->count() . ' user...');

        // Set the Bcrypt rounds to 15 globally (or 4 in testing to speed up tests)
        // so that Eloquent's 'hashed' cast hashes the password with the desired rounds.
        $rounds = app()->environment('testing') ? 4 : 15;
        config(['hashing.bcrypt.rounds' => $rounds]);
        $bcrypt = Hash::driver('bcrypt');
        if (method_exists($bcrypt, 'setRounds')) {
            $bcrypt->setRounds($rounds);
        }

        foreach ($users as $user) {
            // Generate a secure, unique, and deterministic password
            $plainPassword = $this->generateDeterministicPassword($user);

            // Update user password by assigning the plain password.
            // Eloquent's 'hashed' cast will automatically hash this using the active Bcrypt hasher.
            $user->password_hash = $plainPassword;
            $user->save();

            // Store credentials for output
            $generatedCredentials[$user->username] = [
                'username' => $user->username,
                'email' => $user->email,
                'nama_lengkap' => $user->nama_lengkap,
                'plain_password' => $plainPassword,
            ];

            $this->command->line("Password untuk user [{$user->username}] berhasil diubah.");
        }

        // Save credentials to a JSON file in storage/app/
        $jsonContent = json_encode($generatedCredentials, JSON_PRETTY_PRINT);
        Storage::disk('local')->put('secure_passwords.json', $jsonContent);

        $this->command->info('Peningkatan keamanan password selesai!');
        $this->command->info('Kredensial baru telah disimpan di: ' . Storage::disk('local')->path('secure_passwords.json'));
        
        // Print table of credentials to CLI
        $headers = ['Username', 'Nama Lengkap', 'Password Baru'];
        $tableData = [];
        foreach ($generatedCredentials as $cred) {
            $tableData[] = [$cred['username'], $cred['nama_lengkap'], $cred['plain_password']];
        }
        $this->command->table($headers, $tableData);
    }

    /**
     * Generate a secure, unique, and deterministic password based on the user's role and username.
     * All output passwords meet or exceed SOP Keamanan Informasi (length >= 10, alphanumeric, symbols).
     */
    private function generateDeterministicPassword(User $user): string
    {
        $username = $user->username;
        $id = $user->user_id;
        $revUsername = strrev($username);
        $roleId = $user->role_id;

        switch ($roleId) {
            case 1: // Admin
                return strtoupper($username) . '#2026!#' . $revUsername . $id;
            case 2: // Verifikator
                return strtoupper($username) . '_' . $id . '_' . $revUsername . '@Sigap!';
            case 3: // Pengusul
                // Remove 'jurusan' prefix if it exists to get the distinct identifier (e.g. tik, sipil, dll)
                $subName = str_replace('jurusan', '', $username);
                return $subName . '_' . strtoupper($subName) . '_' . $id . '$Secure2026';
            case 4: // PPK
                return strtoupper($username) . '*' . $id . '*' . $revUsername . '@PPK_Secure';
            case 5: // Wadir
                return 'Wadir2_Secure_' . $revUsername . '_' . $id . '#2026';
            case 6: // Bendahara
                return strtoupper($username) . '_' . $id . '_CairLpjSetor@2026!';
            case 7: // Rektorat / Direktur (direktur also maps here)
            default:
                return strtoupper($username) . '_' . $id . '_RektoratPNJ_Secure$';
        }
    }
}
