<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UpdateUserEmailsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $emailMapping = [
            'jurusantik' => 'rafifdwiarka123@gmail.com',
            'verifikator1' => 'rafifdwiarka321@gmail.com',
            'ppk' => 'm.rafifdwiarka@gmail.com',
            'wadir2' => 'muhammad.rafif.dwiarka.tik24@stu.pnj.ac.id',
            'bendahara' => 'diktek2.himatik.pnj@gmail.com',
        ];

        foreach ($emailMapping as $username => $email) {
            User::where('username', $username)->update(['email' => $email]);
        }
    }
}
