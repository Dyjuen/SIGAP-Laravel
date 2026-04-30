# Alur Lengkap Proses SIGAP-PNJ (Penjabaran Lengkap)

Dokumen ini menjelaskan alur kerja utama sistem SIGAP-PNJ dari perspektif pengguna, dengan penjabaran lengkap setiap pemanggilan fungsi (*function calls*) yang signifikan antara **Controller**, **Model**, **Services**, dan **Helpers**.

---

## Bagian 1: Proses KAK (Kerangka Acuan Kerja)

### 1.1. Melihat Daftar Usulan KAK
- **Aktor**: Pengusul
- **Deskripsi**: Pengusul membuka menu KAK untuk melihat semua usulan yang pernah dibuat.
- **Interaksi**:
    - **Controller**: `TelaahController@index`
        - `Database::query()` (untuk mengambil data telaah)
        - `Database::resultSet()`
        - `Response::success()`
        - `Response::error()` (jika terjadi exception)
    - **Model**:
        - `Telaah::getAllWithFilters()` (abstraksi dari query SQL di controller)

### 1.2. Membuat Draf Usulan KAK Baru
- **Aktor**: Pengusul
- **Deskripsi**: Pengusul menekan tombol "Buat Baru", mengisi formulir, lalu menyimpan sebagai draf.
- **Interaksi**:
    - **Controller**: `TelaahController@store`
        - `auth_user()`
        - `json_decode(file_get_contents('php://input'))`
        - `Database::beginTransaction()`
        - `Telaah::create()` (abstraksi dari `INSERT INTO t_telaah`)
        - `Database::lastInsertId()`
        - `TelaahManfaat::create()` (abstraksi dari `INSERT INTO t_telaah_manfaat`)
        - `TelaahTahapan::create()` (abstraksi dari `INSERT INTO t_telaah_tahapan`)
        - `TelaahIndikator::create()` (abstraksi dari `INSERT INTO t_telaah_indikator`)
        - `TelaahIku::create()` (abstraksi dari `INSERT INTO t_telaah_iku`)
        - `TelaahTarget::create()` (abstraksi dari `INSERT INTO t_telaah_target`)
        - `TelaahAnggaran::create()` (abstraksi dari `INSERT INTO t_telaah_anggaran`)
        - `Database::commit()`
        - `Response::success()`
        - `Database::rollBack()` (jika terjadi exception)
        - `Response::error()` (jika terjadi exception)

### 1.3. Mengajukan Draf untuk Verifikasi
- **Aktor**: Pengusul
- **Deskripsi**: Dari daftar usulan, Pengusul memilih draf dan menekan tombol "Ajukan".
- **Interaksi**:
    - **Controller**: `TelaahController@submitForVerification`
        - `auth_user()`
        - `Telaah::find()` (abstraksi dari `SELECT * FROM t_telaah`)
        - `Database::beginTransaction()`
        - `Telaah::update()` (abstraksi dari `UPDATE t_telaah SET status_id = 2`)
        - `TelaahLogStatus::create()` (abstraksi dari `INSERT INTO t_telaah_log_status`)
        - `TelaahApproval::create()` (abstraksi dari `INSERT INTO t_telaah_approval`)
        - `Database::commit()`
        - `Response::success()`
        - `Database::rollBack()` (jika terjadi exception)
        - `Response::error()` (jika terjadi exception)

### 1.4. Verifikator Mereview Usulan
- **Aktor**: Verifikator
- **Deskripsi**: Verifikator membuka menu KAK, memilih usulan berstatus "Dalam Review" untuk melihat detailnya.
- **Interaksi**:
    - **Controller**: `TelaahController@show`
        - `Telaah::find()` (abstraksi dari `SELECT * FROM t_telaah`)
        - `TelaahManfaat::findByTelaahId()` (abstraksi dari `SELECT * FROM t_telaah_manfaat`)
        - `TelaahTahapan::findByTelaahId()` (abstraksi dari `SELECT * FROM t_telaah_tahapan`)
        - `TelaahTarget::findByTelaahId()` (abstraksi dari `SELECT * FROM t_telaah_target`)
        - `TelaahIku::findByTelaahId()` (abstraksi dari `SELECT * FROM t_telaah_iku`)
        - `TelaahAnggaran::findByTelaahId()` (abstraksi dari `SELECT * FROM t_telaah_anggaran`)
        - `TelaahLogStatus::findByTelaahId()` (abstraksi dari `SELECT * FROM t_telaah_log_status`)
        - `TelaahApproval::findByTelaahId()` (abstraksi dari `SELECT * FROM t_telaah_approval`)
        - `Response::success()`
        - `Response::error()` (jika terjadi exception)

### 1.5. Verifikator Menyetujui Usulan
- **Aktor**: Verifikator
- **Deskripsi**: Dari halaman detail, Verifikator menekan tombol "Setujui".
- **Interaksi**:
    - **Controller**: `TelaahController@approve`
        - `auth_user()`
        - `Telaah::find()` (abstraksi dari `SELECT * FROM t_telaah`)
        - `Database::beginTransaction()`
        - `Telaah::update()` (abstraksi dari `UPDATE t_telaah SET status_id = 3`)
        - `TelaahLogStatus::create()` (abstraksi dari `INSERT INTO t_telaah_log_status`)
        - `TelaahApproval::create()` (abstraksi dari `INSERT INTO t_telaah_approval`)
        - `Telaah::clearCatatan()` (abstraksi dari `UPDATE t_telaah SET catatan_* = NULL`)
        - `TelaahManfaat::clearCatatan()` (abstraksi dari `UPDATE t_telaah_manfaat SET catatan_verifikator = NULL`)
        - `TelaahTahapan::clearCatatan()` (abstraksi dari `UPDATE t_telaah_tahapan SET catatan_verifikator = NULL`)
        - `TelaahTarget::clearCatatan()` (abstraksi dari `UPDATE t_telaah_target SET catatan_verifikator = NULL`)
        - `TelaahAnggaran::clearCatatan()` (abstraksi dari `UPDATE t_telaah_anggaran SET catatan_verifikator = NULL`)
        - `TelaahIku::clearCatatan()` (abstraksi dari `UPDATE t_telaah_iku SET catatan_verifikator = NULL`)
        - `Database::commit()`
        - `Response::success()`
        - `Database::rollBack()` (jika terjadi exception)
        - `Response::error()` (jika terjadi exception)

### 1.6. Melihat/Mengunduh Dokumen KAK
- **Aktor**: Semua peran yang berkepentingan
- **Deskripsi**: Pengguna menekan tombol "Preview" atau "Download" pada halaman detail KAK.
- **Interaksi**:
    - **Controller**: `KAKController@download`, `KAKController@preview`, `KAKController@getData`
        - `Telaah::getDataForKAK()`
        - `KAKController::generateKAKHTML()` (internal method)
        - `KAKController::generateFilename()` (internal method)
        - `PDF::download()` (dipanggil oleh `KAKController@download`)
        - `Response::success()`
        - `Response::error()` (jika terjadi exception)

---

## Bagian 2: Proses Kegiatan & Persetujuan Pimpinan

### 2.1. Membuat Kegiatan dari KAK yang Disetujui
- **Aktor**: Pengusul
- **Deskripsi**: Pengusul memilih KAK yang sudah disetujui, lalu membuat "Kegiatan" baru dengan mengunggah surat pengantar.
- **Interaksi**:
    - **Controller**: `KegiatanController@create`
        - `$_POST['telaah_id']` (mengambil input POST)
        - `$_FILES['surat_pengantar']` (mengambil file upload)
        - `Telaah::find()`
        - `Kegiatan::findBy('telaah_id', $telaahId)`
        - `FileUpload::upload()`
        - `kegiatanModel->getDb()->beginTransaction()`
        - `Kegiatan::create()`
        - `Kegiatan::updateApproval()` (untuk setiap level persetujuan: PPK, Wadir, Bendahara-Cair, Bendahara-LPJ)
        - `Telaah::update()` (mengubah status telaah)
        - `kegiatanModel->getDb()->commit()`
        - `Response::created()`
        - `kegiatanModel->getDb()->rollBack()` (jika terjadi exception)
        - `FileUpload::delete()` (membersihkan file jika transaksi gagal)
        - `Response::error()` (jika terjadi exception)

### 2.2. Pimpinan Mereview Kegiatan
- **Aktor**: Pimpinan (WD2/PPK)
- **Deskripsi**: Pimpinan membuka daftar kegiatan yang menunggu persetujuannya, lalu memilih satu untuk dilihat detailnya.
- **Interaksi**:
    - **Controller**: `KegiatanController@index` (untuk daftar), `KegiatanController@show` (untuk detail)
        - `Kegiatan::getAllWithFilters()` (untuk `index`)
        - `Kegiatan::getKegiatanForPDF()` (untuk `show`)
        - `Response::success()`
        - `Response::error()` (jika terjadi exception)

### 2.3. Pimpinan Menyetujui Kegiatan
- **Aktor**: Pimpinan (WD2/PPK)
- **Deskripsi**: Dari halaman detail, Pimpinan menekan "Setujui". Alur otomatis berlanjut ke level persetujuan berikutnya.
- **Interaksi**:
    - **Controller**: `KegiatanController@approve`
        - `kegiatanModel->getDb()->beginTransaction()`
        - `Kegiatan::findById()`
        - `Kegiatan::findCurrentApproval()`
        - `hasRole()` (internal method)
        - `Kegiatan::updateApprovalStatus()` (untuk status "Revisi" atau "Disetujui")
        - `Kegiatan::updateStatus()` (jika status "Revisi")
        - `KegiatanLogStatus::create()`
        - `Notifikasi::create()` (jika status "Revisi")
        - `LpjTimerService::startLpjTimer()` (jika level "Bendahara-Cair")
        - `Kegiatan::findNextApproval()`
        - `kegiatanModel->getDb()->commit()`
        - `Response::success()`
        - `kegiatanModel->getDb()->rollBack()` (jika terjadi exception)
        - `Response::error()` (jika terjadi exception)

---

## Bagian 3: Proses Pencairan & LPJ

### 3.1. Bendahara Mencatat Pencairan Dana
- **Aktor**: Bendahara
- **Deskripsi**: Bendahara membuka detail kegiatan yang siap dicairkan, lalu mencatat nominal dana yang diberikan.
- **Interaksi**:
    - **Controller**: `KegiatanController@cairkanDana`
        - `kegiatanModel->getDb()->beginTransaction()`
        - `hasRole()` (internal method)
        - `Kegiatan::findById()`
        - `Kegiatan::findCurrentApproval()`
        - `json_decode(file_get_contents('php://input'))`
        - `Database::prepare()` (untuk `UPDATE t_kegiatan`)
        - `Database::execute()` (untuk `UPDATE t_kegiatan`)
        - `kegiatanModel->getDb()->commit()`
        - `Response::success()`
        - `kegiatanModel->getDb()->rollBack()` (jika terjadi exception)
        - `Response::error()` (jika terjadi exception)

### 3.2. Bendahara Menyetujui Pencairan & Memulai Timer LPJ
- **Aktor**: Bendahara
- **Deskripsi**: Setelah mencatat dana, Bendahara memberikan persetujuan pada level "Bendahara-Cair", yang secara otomatis memulai timer LPJ.
- **Interaksi**:
    - **Controller**: `KegiatanController@approve` (pada level `Bendahara-Cair`)
        - `kegiatanModel->getDb()->beginTransaction()`
        - `Kegiatan::findById()`
        - `Kegiatan::findCurrentApproval()`
        - `hasRole()` (internal method)
        - `Kegiatan::updateApprovalStatus()`
        - `KegiatanLogStatus::create()`
        - `Kegiatan::updateStatus()` (mengubah status kegiatan)
        - `LpjTimerService::startLpjTimer()`
        - `Notifikasi::create()`
        - `Kegiatan::findNextApproval()`
        - `kegiatanModel->getDb()->commit()`
        - `Response::success()`
        - `kegiatanModel->getDb()->rollBack()` (jika terjadi exception)
        - `Response::error()` (jika terjadi exception)

### 3.3. Pengusul Mengajukan LPJ
- **Aktor**: Pengusul
- **Deskripsi**: Pengusul membuka detail kegiatan yang dananya sudah cair, lalu mengunggah file-file LPJ.
- **Interaksi**:
    - **Controller**: `LampiranController@upload`
        - `kegiatanModel->findById()`
        - `hasRole()` (internal method)
        - `Lampiran::countByKegiatanId()`
        - `FileUpload::upload()`
        - `Lampiran::create()`
        - `Response::created()`
        - `Response::error()` (jika terjadi exception)

### 3.4. Bendahara Mengecek & Menyetujui LPJ
- **Aktor**: Bendahara
- **Deskripsi**: Bendahara mereview LPJ yang diajukan dan memberikan persetujuan akhir pada level "Bendahara-LPJ", yang menyelesaikan siklus kegiatan.
- **Interaksi**:
    - **Controller**: `KegiatanController@approve` (pada level `Bendahara-LPJ`)
        - `kegiatanModel->getDb()->beginTransaction()`
        - `Kegiatan::findById()`
        - `Kegiatan::findCurrentApproval()`
        - `hasRole()` (internal method)
        - `Kegiatan::updateApprovalStatus()`
        - `KegiatanLogStatus::create()`
        - `Kegiatan::updateStatus()` (mengubah status menjadi "Selesai")
        - `Notifikasi::create()`
        - `kegiatanModel->getDb()->commit()`
        - `Response::success()`
        - `kegiatanModel->getDb()->rollBack()` (jika terjadi exception)
        - `Response::error()` (jika terjadi exception)
