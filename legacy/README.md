Skenario A: Anda (Tim A) Ingin MENAMBAH Tabel Baru (misal: products)

Selalu pull dulu: Pastikan Anda memiliki kode terbaru.

git pull

Buat file migrasi baru:

vendor/bin/phinx create CreateProductsTable -c phinx.php

Edit file PHP baru (...\_CreateProductsTable.php): Isi metode up() (untuk CREATE TABLE products ...) dan down() (untuk DROP TABLE products).

Jalankan di lokal: Tes migrasi Anda di komputer Anda sendiri.

vendor/bin/phinx migrate -c phinx.php

Commit dan Push: Jika sudah berhasil, commit dan push hanya file PHP migrasi tersebut.

git add database/migrations/....\_CreateProductsTable.php
git commit -m "feat: Add products table"
git push

Skenario B: Rekan Anda (Tim B) MENERIMA Perubahan Anda

Tarik kode baru: Tim B menjalankan git pull. Sekarang dia memiliki file ...\_CreateProductsTable.php yang baru Anda buat, tetapi databasenya belum update.

Jalankan migrasi: Tim B hanya perlu menjalankan satu perintah di terminalnya:

vendor/bin/phinx migrate -c phinx.php

Selesai! Phinx cukup pintar untuk memeriksa tabel phinxlog. Phinx melihat bahwa ...\_CreateUsersTable.php sudah dijalankan, jadi Phinx akan melewatkannya dan hanya menjalankan file ...\_CreateProductsTable.php yang baru.

Sekarang database Tim A dan Tim B 100% sinkron. Tidak perlu lagi import/export manual.

Perintah Berguna Lainnya

Membatalkan migrasi terakhir:

vendor/bin/phinx rollback -c phinx.php

(Ini akan menjalankan metode down() dari migrasi terakhir).

Melihat status migrasi: (Sangat berguna untuk melihat mana yang sudah/belum dijalankan)

vendor/bin/phinx status -c phinx.php

Ringkasan Perintah Penting untuk Tim (Taruh di README.md)

Berikut adalah perintah-perintah Phinx yang akan kita gunakan sehari-hari. Selalu jalankan dari terminal di folder root proyek.

1. Membuat File Migrasi Baru

Kapan? Saat Anda ingin membuat tabel baru atau mengubah tabel yang ada.

Perintah:

vendor/bin/phinx create NamaMigrasiAnda -c phinx.php

(Contoh: vendor/bin/phinx create AddEmailToUsersTable -c phinx.php)

2. Menjalankan Migrasi

Kapan? Setelah Anda git pull atau setelah Anda membuat file migrasi baru. Ini akan menjalankan semua migrasi yang "tertunda".

Perintah:

vendor/bin/phinx migrate -c phinx.php

3. Membatalkan Migrasi Terakhir

Kapan? Saat Anda sadar telah melakukan kesalahan pada migrasi terakhir dan ingin membatalkannya.

Perintah:

vendor/bin/phinx rollback -c phinx.php

4. Mengecek Status Migrasi

Kapan? Saat Anda bingung migrasi mana yang sudah atau belum dijalankan di komputer Anda.

Perintah:

vendor/bin/phinx status -c phinx.php

KODE RUN TERMINAL PENTING!!

(Clear Log Migration)
php clean-phinxlog.php

(Migrate Semua Migration)
vendor/bin/phinx migrate -c phinx.php

(Rollback (Drop) Semua Migration)
vendor/bin/phinx migrate -c phinx.php

(Cek Status Migration)
vendor/bin/phinx status -c phinx.php

(Migrate Fresh)
vendor/bin/phinx rollback -t 0 -c phinx.php
vendor/bin/phinx migrate -c phinx.php

(Run Seed)
vendor/bin/phinx seed:run -s nama seeder -c phinx.php
vendor/bin/phinx seed:run -s MasterDataSeeder -c phinx.php
vendor/bin/phinx seed:run -s KegiatanSeeder -c phinx.php
vendor/bin/phinx seed:run -s KegiatanLogStatusSeeder -c phinx.php
vendor/bin/phinx seed:run -s KegiatanAnggaranSeeder -c phinx.php
vendor/bin/phinx seed:run -s NotificationSeeder -c phinx.php
vendor/bin/phinx seed:run -s PanduanSeeder -c phinx.php
vendor/bin/phinx seed:run -s ITECHNOSeeder -c phinx.php
vendor/bin/phinx seed:run -s CIVFESTSeeder -c phinx.php
