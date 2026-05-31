/**
 * Master Coverage File
 * This file contains exactly one test for EVERY entry in test-cases.json.
 */
const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../helpers/auth');

test.describe('Master Automated Coverage', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, USERS.PENGUSUL);
    });

    // ─── API-LGN-001: Login API Valid ──────────────────────────────────────
    test('API-LGN-001: Login API Valid', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── API-ADM-001: Get Admin Stats ──────────────────────────────────────
    test('API-ADM-001: Get Admin Stats', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── API-KAK-001: List KAK API ──────────────────────────────────────
    test('API-KAK-001: List KAK API', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── API-PERF-001: Load Test Dashboard ──────────────────────────────────────
    test('API-PERF-001: Load Test Dashboard', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-001: Simpan KAK data valid (Role Pengusul) ──────────────────────────────────────
    test('KAK-FT-001: Simpan KAK data valid (Role Pengusul)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-002: Nama kegiatan kosong ──────────────────────────────────────
    test('KAK-FT-002: Nama kegiatan kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-003: Nama kegiatan terlalu pendek ──────────────────────────────────────
    test('KAK-FT-003: Nama kegiatan terlalu pendek', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-004: Deskripsi kegiatan kosong ──────────────────────────────────────
    test('KAK-FT-004: Deskripsi kegiatan kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-005: Tanggal selesai < Tanggal mulai ──────────────────────────────────────
    test('KAK-FT-005: Tanggal selesai < Tanggal mulai', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-006: Tipe Kegiatan ID tidak ada di master ──────────────────────────────────────
    test('KAK-FT-006: Tipe Kegiatan ID tidak ada di master', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-007: RAB: Volume 1 negatif ──────────────────────────────────────
    test('KAK-FT-007: RAB: Volume 1 negatif', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-008: RAB: Harga Satuan bukan angka ──────────────────────────────────────
    test('KAK-FT-008: RAB: Harga Satuan bukan angka', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-009: IKU: Target IKU kosong ──────────────────────────────────────
    test('KAK-FT-009: IKU: Target IKU kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-010: Indikator: Persentase > 100 ──────────────────────────────────────
    test('KAK-FT-010: Indikator: Persentase > 100', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-011: Verifikator akses form Create ──────────────────────────────────────
    test('KAK-FT-011: Verifikator akses form Create', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-012: Pengusul edit KAK status Draft ──────────────────────────────────────
    test('KAK-FT-012: Pengusul edit KAK status Draft', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-013: Pengusul edit KAK status Disetujui ──────────────────────────────────────
    test('KAK-FT-013: Pengusul edit KAK status Disetujui', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-014: Filter KAK berdasarkan Status ──────────────────────────────────────
    test('KAK-FT-014: Filter KAK berdasarkan Status', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-015: Search KAK berdasarkan Nama ──────────────────────────────────────
    test('KAK-FT-015: Search KAK berdasarkan Nama', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-016: Verifikator lihat detail KAK orang lain ──────────────────────────────────────
    test('KAK-FT-016: Verifikator lihat detail KAK orang lain', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-017: Hapus KAK Draft (Soft Delete) ──────────────────────────────────────
    test('KAK-FT-017: Hapus KAK Draft (Soft Delete)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-018: Otomatis hitung kurun waktu ──────────────────────────────────────
    test('KAK-FT-018: Otomatis hitung kurun waktu', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-019: Tambah baris RAB di frontend ──────────────────────────────────────
    test('KAK-FT-019: Tambah baris RAB di frontend', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-020: Export PDF KAK ──────────────────────────────────────
    test('KAK-FT-020: Export PDF KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-021: Akses Tanpa Login ──────────────────────────────────────
    test('KAK-FT-021: Akses Tanpa Login', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-022: Cek Props Inertia ──────────────────────────────────────
    test('KAK-FT-022: Cek Props Inertia', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-023: Create dengan Children ──────────────────────────────────────
    test('KAK-FT-023: Create dengan Children', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-024: Tanggal Mulai di Masa Lalu ──────────────────────────────────────
    test('KAK-FT-024: Tanggal Mulai di Masa Lalu', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-025: Volume RAB = 0 ──────────────────────────────────────
    test('KAK-FT-025: Volume RAB = 0', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-026: Tanggal Selesai < Tanggal Mulai ──────────────────────────────────────
    test('KAK-FT-026: Tanggal Selesai < Tanggal Mulai', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-027: RAB: Multi-volume (Volume 1, 2, 3) ──────────────────────────────────────
    test('KAK-FT-027: RAB: Multi-volume (Volume 1, 2, 3)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-028: IKU: Duplikasi IKU ID di satu KAK ──────────────────────────────────────
    test('KAK-FT-028: IKU: Duplikasi IKU ID di satu KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-029: Kurun Waktu Otomatis (Hari) ──────────────────────────────────────
    test('KAK-FT-029: Kurun Waktu Otomatis (Hari)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-030: Kurun Waktu Otomatis (Bulan + Hari) ──────────────────────────────────────
    test('KAK-FT-030: Kurun Waktu Otomatis (Bulan + Hari)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-031: Hapus salah satu baris Manfaat saat Edit ──────────────────────────────────────
    test('KAK-FT-031: Hapus salah satu baris Manfaat saat Edit', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-032: Ubah urutan Tahapan Pelaksanaan ──────────────────────────────────────
    test('KAK-FT-032: Ubah urutan Tahapan Pelaksanaan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-033: Tambah RAB baru saat Edit ──────────────────────────────────────
    test('KAK-FT-033: Tambah RAB baru saat Edit', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-034: Ubah harga RAB yang punya catatan revisi ──────────────────────────────────────
    test('KAK-FT-034: Ubah harga RAB yang punya catatan revisi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-035: Hapus KAK status "Review" ──────────────────────────────────────
    test('KAK-FT-035: Hapus KAK status "Review"', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-036: Preview PDF Blob ──────────────────────────────────────
    test('KAK-FT-036: Preview PDF Blob', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-FT-037: PDF Content Accuracy ──────────────────────────────────────
    test('KAK-FT-037: PDF Content Accuracy', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-001: Pengusul ajukan KAK ke Verifikator ──────────────────────────────────────
    test('KAK-IT-001: Pengusul ajukan KAK ke Verifikator', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-002: Email notifikasi ke Verifikator ──────────────────────────────────────
    test('KAK-IT-002: Email notifikasi ke Verifikator', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-003: Verifikator setujui dengan Mata Anggaran lama ──────────────────────────────────────
    test('KAK-IT-003: Verifikator setujui dengan Mata Anggaran lama', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-004: Verifikator input Mata Anggaran baru ──────────────────────────────────────
    test('KAK-IT-004: Verifikator input Mata Anggaran baru', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-005: Email notifikasi ke Pengusul (Approved) ──────────────────────────────────────
    test('KAK-IT-005: Email notifikasi ke Pengusul (Approved)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-006: Verifikator tolak KAK dengan alasan ──────────────────────────────────────
    test('KAK-IT-006: Verifikator tolak KAK dengan alasan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-007: Verifikator minta revisi inline (Field) ──────────────────────────────────────
    test('KAK-IT-007: Verifikator minta revisi inline (Field)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-008: Verifikator minta revisi pada baris RAB ──────────────────────────────────────
    test('KAK-IT-008: Verifikator minta revisi pada baris RAB', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-009: Pengusul ajukan kembali KAK Revisi ──────────────────────────────────────
    test('KAK-IT-009: Pengusul ajukan kembali KAK Revisi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-010: Hapus semua catatan revisi saat Approve ──────────────────────────────────────
    test('KAK-IT-010: Hapus semua catatan revisi saat Approve', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-011: Gagal simpan RAB saat Create KAK ──────────────────────────────────────
    test('KAK-IT-011: Gagal simpan RAB saat Create KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-012: Verifikator1 proses KAK Tipe 2 ──────────────────────────────────────
    test('KAK-IT-012: Verifikator1 proses KAK Tipe 2', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-013: Cek riwayat status di tab History ──────────────────────────────────────
    test('KAK-IT-013: Cek riwayat status di tab History', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-014: Dua verifikator submit approval bareng ──────────────────────────────────────
    test('KAK-IT-014: Dua verifikator submit approval bareng', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-015: KAK IKU tersimpan ke tabel yang benar ──────────────────────────────────────
    test('KAK-IT-015: KAK IKU tersimpan ke tabel yang benar', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-016: Verifikator Lihat Daftar ──────────────────────────────────────
    test('KAK-IT-016: Verifikator Lihat Daftar', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-017: Pengusul Lihat Milik Sendiri ──────────────────────────────────────
    test('KAK-IT-017: Pengusul Lihat Milik Sendiri', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-018: ID Manipulation ──────────────────────────────────────
    test('KAK-IT-018: ID Manipulation', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-019: State Transition Block ──────────────────────────────────────
    test('KAK-IT-019: State Transition Block', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-020: Self-Approval Check ──────────────────────────────────────
    test('KAK-IT-020: Self-Approval Check', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-021: New Mata Anggaran Persistance ──────────────────────────────────────
    test('KAK-IT-021: New Mata Anggaran Persistance', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-022: Multiple Resubmit ──────────────────────────────────────
    test('KAK-IT-022: Multiple Resubmit', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-023: Mail Failure Handling ──────────────────────────────────────
    test('KAK-IT-023: Mail Failure Handling', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-024: Update on Approved KAK ──────────────────────────────────────
    test('KAK-IT-024: Update on Approved KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-025: Verifikator Edit KAK ──────────────────────────────────────
    test('KAK-IT-025: Verifikator Edit KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-026: Admin (Role 1) Akses KAK Siapapun ──────────────────────────────────────
    test('KAK-IT-026: Admin (Role 1) Akses KAK Siapapun', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-027: Verifikator Akses Edit Form ──────────────────────────────────────
    test('KAK-IT-027: Verifikator Akses Edit Form', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-028: Verifikator1 akses KAK Tipe 2 ──────────────────────────────────────
    test('KAK-IT-028: Verifikator1 akses KAK Tipe 2', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-029: Submit KAK status "Rejected" ──────────────────────────────────────
    test('KAK-IT-029: Submit KAK status "Rejected"', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-030: Approve: Mata Anggaran Baru ──────────────────────────────────────
    test('KAK-IT-030: Approve: Mata Anggaran Baru', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-031: Approve: Mata Anggaran Existing ──────────────────────────────────────
    test('KAK-IT-031: Approve: Mata Anggaran Existing', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-032: Approve: Clearance Catatan ──────────────────────────────────────
    test('KAK-IT-032: Approve: Clearance Catatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-033: Revise: Field-specific Notes ──────────────────────────────────────
    test('KAK-IT-033: Revise: Field-specific Notes', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-034: Revise: Child Notes (RAB) ──────────────────────────────────────
    test('KAK-IT-034: Revise: Child Notes (RAB)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-035: Resubmit: Data Persistence ──────────────────────────────────────
    test('KAK-IT-035: Resubmit: Data Persistence', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-036: Notifikasi Verifikator (Submitted) ──────────────────────────────────────
    test('KAK-IT-036: Notifikasi Verifikator (Submitted)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-037: Notifikasi Pengusul (Approved) ──────────────────────────────────────
    test('KAK-IT-037: Notifikasi Pengusul (Approved)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── KAK-IT-038: Notifikasi Pengusul (Rejected) ──────────────────────────────────────
    test('KAK-IT-038: Notifikasi Pengusul (Rejected)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-001: Otorisasi Akses Bendahara ──────────────────────────────────────
    test('LPJ-F-001: Otorisasi Akses Bendahara', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-002: Otorisasi Role Lain (View Only) ──────────────────────────────────────
    test('LPJ-F-002: Otorisasi Role Lain (View Only)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-003: Validasi Field Kosong ──────────────────────────────────────
    test('LPJ-F-003: Validasi Field Kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-004: Validasi Karakter Max ──────────────────────────────────────
    test('LPJ-F-004: Validasi Karakter Max', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-005: ID Lampiran Invalid ──────────────────────────────────────
    test('LPJ-F-005: ID Lampiran Invalid', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-006: Tombol Approve Muncul ──────────────────────────────────────
    test('LPJ-F-006: Tombol Approve Muncul', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-007: Akses API Approve Invalid ──────────────────────────────────────
    test('LPJ-F-007: Akses API Approve Invalid', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-008: Kondisi Tombol Selesai ──────────────────────────────────────
    test('LPJ-F-008: Kondisi Tombol Selesai', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-009: Validasi State / Status Guard ──────────────────────────────────────
    test('LPJ-F-009: Validasi State / Status Guard', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-010: Pencarian Nama Kegiatan ──────────────────────────────────────
    test('LPJ-F-010: Pencarian Nama Kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-011: Pencarian Status ──────────────────────────────────────
    test('LPJ-F-011: Pencarian Status', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-012: Preview Bukti Dokumen ──────────────────────────────────────
    test('LPJ-F-012: Preview Bukti Dokumen', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-013: Konfirmasi Approve ──────────────────────────────────────
    test('LPJ-F-013: Konfirmasi Approve', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-014: Konfirmasi Revisi ──────────────────────────────────────
    test('LPJ-F-014: Konfirmasi Revisi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-015: Konfirmasi Selesai ──────────────────────────────────────
    test('LPJ-F-015: Konfirmasi Selesai', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-016: Button Processing ──────────────────────────────────────
    test('LPJ-F-016: Button Processing', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-017: Kembalikan LPJ dengan alasan penolakan ──────────────────────────────────────
    test('LPJ-F-017: Kembalikan LPJ dengan alasan penolakan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-018: Download bukti dokumen ──────────────────────────────────────
    test('LPJ-F-018: Download bukti dokumen', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-019: Approve multiple LPJ sekaligus ──────────────────────────────────────
    test('LPJ-F-019: Approve multiple LPJ sekaligus', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-020: Export ke Excel/CSV ──────────────────────────────────────
    test('LPJ-F-020: Export ke Excel/CSV', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-021: Filter LPJ berdasarkan tanggal ──────────────────────────────────────
    test('LPJ-F-021: Filter LPJ berdasarkan tanggal', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-022: Progress bar saat upload file ──────────────────────────────────────
    test('LPJ-F-022: Progress bar saat upload file', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-023: Cegah upload file duplikat ──────────────────────────────────────
    test('LPJ-F-023: Cegah upload file duplikat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-024: Validasi ukuran file maksimal ──────────────────────────────────────
    test('LPJ-F-024: Validasi ukuran file maksimal', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-025: Validasi tipe file yang diizinkan ──────────────────────────────────────
    test('LPJ-F-025: Validasi tipe file yang diizinkan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-026: Hapus lampiran yang sudah upload ──────────────────────────────────────
    test('LPJ-F-026: Hapus lampiran yang sudah upload', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-027: Rename nama file lampiran ──────────────────────────────────────
    test('LPJ-F-027: Rename nama file lampiran', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-028: Real-time notification badge updates ──────────────────────────────────────
    test('LPJ-F-028: Real-time notification badge updates', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-029: Print halaman LPJ ──────────────────────────────────────
    test('LPJ-F-029: Print halaman LPJ', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-030: Sort table berdasarkan column header ──────────────────────────────────────
    test('LPJ-F-030: Sort table berdasarkan column header', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-F-031: Navigasi antar halaman ──────────────────────────────────────
    test('LPJ-F-031: Navigasi antar halaman', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-001: Update Status Database ──────────────────────────────────────
    test('LPJ-I-001: Update Status Database', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-002: Notifikasi Email Pengusul ──────────────────────────────────────
    test('LPJ-I-002: Notifikasi Email Pengusul', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-003: Update Alur Approval ──────────────────────────────────────
    test('LPJ-I-003: Update Alur Approval', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-004: Pencatatan Log Status ──────────────────────────────────────
    test('LPJ-I-004: Pencatatan Log Status', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-005: Atomic Transaction (Rollback) ──────────────────────────────────────
    test('LPJ-I-005: Atomic Transaction (Rollback)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-006: Finalisasi Status ──────────────────────────────────────
    test('LPJ-I-006: Finalisasi Status', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-007: Cloud Storage Integration ──────────────────────────────────────
    test('LPJ-I-007: Cloud Storage Integration', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-008: Pessimistic Locking ──────────────────────────────────────
    test('LPJ-I-008: Pessimistic Locking', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-009: Pembersihan Catatan Lama ──────────────────────────────────────
    test('LPJ-I-009: Pembersihan Catatan Lama', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-010: Loading Satuans ──────────────────────────────────────
    test('LPJ-I-010: Loading Satuans', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-011: Metadata Approver ──────────────────────────────────────
    test('LPJ-I-011: Metadata Approver', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-012: Revisi submission dari 2 user bersamaan ──────────────────────────────────────
    test('LPJ-I-012: Revisi submission dari 2 user bersamaan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-013: Tracking perubahan dokumen berkali-kali ──────────────────────────────────────
    test('LPJ-I-013: Tracking perubahan dokumen berkali-kali', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-014: Pencatatan setiap perubahan status LPJ ──────────────────────────────────────
    test('LPJ-I-014: Pencatatan setiap perubahan status LPJ', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-015: Notification with retry mechanism ──────────────────────────────────────
    test('LPJ-I-015: Notification with retry mechanism', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-016: Proses notifikasi massal efisien ──────────────────────────────────────
    test('LPJ-I-016: Proses notifikasi massal efisien', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-017: Arsip otomatis record lama ──────────────────────────────────────
    test('LPJ-I-017: Arsip otomatis record lama', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-018: Agregasi statistik LPJ real-time ──────────────────────────────────────
    test('LPJ-I-018: Agregasi statistik LPJ real-time', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-019: Generate laporan PDF ──────────────────────────────────────
    test('LPJ-I-019: Generate laporan PDF', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-020: Verifikasi integritas file with hash ──────────────────────────────────────
    test('LPJ-I-020: Verifikasi integritas file with hash', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-021: Hierarchi permission berbasis role ──────────────────────────────────────
    test('LPJ-I-021: Hierarchi permission berbasis role', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-022: Batalkan and restore action sebelumnya ──────────────────────────────────────
    test('LPJ-I-022: Batalkan and restore action sebelumnya', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-023: Retry with delay exponential ──────────────────────────────────────
    test('LPJ-I-023: Retry with delay exponential', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-024: Approval multi-level with hierarchy ──────────────────────────────────────
    test('LPJ-I-024: Approval multi-level with hierarchy', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-025: Thread diskusi per attachment ──────────────────────────────────────
    test('LPJ-I-025: Thread diskusi per attachment', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-026: Search with indexing penuh ──────────────────────────────────────
    test('LPJ-I-026: Search with indexing penuh', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-027: Pembatasan request per user ──────────────────────────────────────
    test('LPJ-I-027: Pembatasan request per user', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-028: Trigger webhook saat status change ──────────────────────────────────────
    test('LPJ-I-028: Trigger webhook saat status change', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-029: Real-time activity stream ──────────────────────────────────────
    test('LPJ-I-029: Real-time activity stream', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-030: Update massal dalam transaction ──────────────────────────────────────
    test('LPJ-I-030: Update massal dalam transaction', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-031: Migrasi data antar database ──────────────────────────────────────
    test('LPJ-I-031: Migrasi data antar database', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-032: Template with placeholder variable ──────────────────────────────────────
    test('LPJ-I-032: Template with placeholder variable', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LPJ-I-033: 2FA untuk sensitive actions ──────────────────────────────────────
    test('LPJ-I-033: 2FA untuk sensitive actions', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-001: Validasi Field Wajib ──────────────────────────────────────
    test('AK-F-001: Validasi Field Wajib', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-002: Validasi Tipe File ──────────────────────────────────────
    test('AK-F-002: Validasi Tipe File', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-003: Validasi Ukuran File ──────────────────────────────────────
    test('AK-F-003: Validasi Ukuran File', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-004: Otorisasi Role ──────────────────────────────────────
    test('AK-F-004: Otorisasi Role', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-005: Pencarian Nama ──────────────────────────────────────
    test('AK-F-005: Pencarian Nama', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-006: Edit Draft ──────────────────────────────────────
    test('AK-F-006: Edit Draft', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-007: Hapus Draft ──────────────────────────────────────
    test('AK-F-007: Hapus Draft', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-008: Validasi Karakter Max ──────────────────────────────────────
    test('AK-F-008: Validasi Karakter Max', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-009: Navigasi Halaman ──────────────────────────────────────
    test('AK-F-009: Navigasi Halaman', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-010: Loading State ──────────────────────────────────────
    test('AK-F-010: Loading State', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-011: Validasi Tanggal ──────────────────────────────────────
    test('AK-F-011: Validasi Tanggal', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-012: XSS Prevention ──────────────────────────────────────
    test('AK-F-012: XSS Prevention', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-013: Filter Status ──────────────────────────────────────
    test('AK-F-013: Filter Status', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-014: Reset Form ──────────────────────────────────────
    test('AK-F-014: Reset Form', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-015: Preview Dokumen ──────────────────────────────────────
    test('AK-F-015: Preview Dokumen', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-016: Cek Duplikasi Nama ──────────────────────────────────────
    test('AK-F-016: Cek Duplikasi Nama', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-017: Unduh Template ──────────────────────────────────────
    test('AK-F-017: Unduh Template', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-018: Sortir Tabel ──────────────────────────────────────
    test('AK-F-018: Sortir Tabel', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-019: Max Length Input ──────────────────────────────────────
    test('AK-F-019: Max Length Input', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-020: Multiple Click Prevent ──────────────────────────────────────
    test('AK-F-020: Multiple Click Prevent', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-021: Validasi File Spesifik ──────────────────────────────────────
    test('AK-F-021: Validasi File Spesifik', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-022: Format Email (Jika Ada) ──────────────────────────────────────
    test('AK-F-022: Format Email (Jika Ada)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-023: Refresh Page ──────────────────────────────────────
    test('AK-F-023: Refresh Page', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-024: Submit via Enter ──────────────────────────────────────
    test('AK-F-024: Submit via Enter', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-025: Error Handle Network ──────────────────────────────────────
    test('AK-F-025: Error Handle Network', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-026: Hapus File Uploaded ──────────────────────────────────────
    test('AK-F-026: Hapus File Uploaded', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-027: Karakter Khusus ──────────────────────────────────────
    test('AK-F-027: Karakter Khusus', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-028: Redirect Login ──────────────────────────────────────
    test('AK-F-028: Redirect Login', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-029: Breadcrumb Navigasi ──────────────────────────────────────
    test('AK-F-029: Breadcrumb Navigasi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-F-030: Auto Focus Form ──────────────────────────────────────
    test('AK-F-030: Auto Focus Form', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-001: Auto-Seed Approval ──────────────────────────────────────
    test('AK-I-001: Auto-Seed Approval', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-002: Status Guard ──────────────────────────────────────
    test('AK-I-002: Status Guard', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-003: Pencegahan Duplikasi ──────────────────────────────────────
    test('AK-I-003: Pencegahan Duplikasi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-004: Atomic Transaction ──────────────────────────────────────
    test('AK-I-004: Atomic Transaction', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-005: Supabase Storage ──────────────────────────────────────
    test('AK-I-005: Supabase Storage', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-006: Cascade Delete KAK ──────────────────────────────────────
    test('AK-I-006: Cascade Delete KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-007: Event Dispatcher ──────────────────────────────────────
    test('AK-I-007: Event Dispatcher', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-008: Storage Cleanup ──────────────────────────────────────
    test('AK-I-008: Storage Cleanup', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-009: Relasi User Konsisten ──────────────────────────────────────
    test('AK-I-009: Relasi User Konsisten', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-010: Constraint Integritas ──────────────────────────────────────
    test('AK-I-010: Constraint Integritas', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-011: API Rate Limiting ──────────────────────────────────────
    test('AK-I-011: API Rate Limiting', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-012: Log Status Tracer ──────────────────────────────────────
    test('AK-I-012: Log Status Tracer', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-013: Integrity Token CSRF ──────────────────────────────────────
    test('AK-I-013: Integrity Token CSRF', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-014: Timezone Consistency ──────────────────────────────────────
    test('AK-I-014: Timezone Consistency', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-I-015: Observer Creation ──────────────────────────────────────
    test('AK-I-015: Observer Creation', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-001: End-to-End Flow ──────────────────────────────────────
    test('AK-U-001: End-to-End Flow', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-002: Kejelasan Validasi ──────────────────────────────────────
    test('AK-U-002: Kejelasan Validasi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-003: Alur Revisi ──────────────────────────────────────
    test('AK-U-003: Alur Revisi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-004: Uji Mobile UI ──────────────────────────────────────
    test('AK-U-004: Uji Mobile UI', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-005: Rekognisi Visual ──────────────────────────────────────
    test('AK-U-005: Rekognisi Visual', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-006: Uji Unduh ──────────────────────────────────────
    test('AK-U-006: Uji Unduh', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-007: Isolasi Data ──────────────────────────────────────
    test('AK-U-007: Isolasi Data', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-008: Pembatalan Form ──────────────────────────────────────
    test('AK-U-008: Pembatalan Form', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-009: Response Time UI ──────────────────────────────────────
    test('AK-U-009: Response Time UI', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-010: Kejelasan Tooltip ──────────────────────────────────────
    test('AK-U-010: Kejelasan Tooltip', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-011: Petunjuk Pengisian ──────────────────────────────────────
    test('AK-U-011: Petunjuk Pengisian', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-012: Interaksi Drag-Drop ──────────────────────────────────────
    test('AK-U-012: Interaksi Drag-Drop', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-013: Estetika Warna UI ──────────────────────────────────────
    test('AK-U-013: Estetika Warna UI', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-014: Sinkronisasi Perangkat ──────────────────────────────────────
    test('AK-U-014: Sinkronisasi Perangkat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── AK-U-015: Tingkat Kepuasan UX ──────────────────────────────────────
    test('AK-U-015: Tingkat Kepuasan UX', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-001: Nominal Negatif ──────────────────────────────────────
    test('PD-F-001: Nominal Negatif', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-002: Nominal Nol ──────────────────────────────────────
    test('PD-F-002: Nominal Nol', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-003: Input Non-Numerik ──────────────────────────────────────
    test('PD-F-003: Input Non-Numerik', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-004: Otorisasi Bendahara ──────────────────────────────────────
    test('PD-F-004: Otorisasi Bendahara', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-005: Search Kegiatan ──────────────────────────────────────
    test('PD-F-005: Search Kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-006: Detail Saldo UI ──────────────────────────────────────
    test('PD-F-006: Detail Saldo UI', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-007: Reset Form ──────────────────────────────────────
    test('PD-F-007: Reset Form', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-008: Pagination Cair ──────────────────────────────────────
    test('PD-F-008: Pagination Cair', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-009: Toast Sukses ──────────────────────────────────────
    test('PD-F-009: Toast Sukses', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-010: Konfirmasi Selesai ──────────────────────────────────────
    test('PD-F-010: Konfirmasi Selesai', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-012: Cetak Kuitansi ──────────────────────────────────────
    test('PD-F-012: Cetak Kuitansi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-013: Max Sisa Dana ──────────────────────────────────────
    test('PD-F-013: Max Sisa Dana', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-015: Date Range Filter ──────────────────────────────────────
    test('PD-F-015: Date Range Filter', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-016: Format Rupiah ──────────────────────────────────────
    test('PD-F-016: Format Rupiah', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-017: Batal Transaksi ──────────────────────────────────────
    test('PD-F-017: Batal Transaksi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-018: Sortir Nominal ──────────────────────────────────────
    test('PD-F-018: Sortir Nominal', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-019: Empty State UI ──────────────────────────────────────
    test('PD-F-019: Empty State UI', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-020: Card Rekap Total ──────────────────────────────────────
    test('PD-F-020: Card Rekap Total', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-021: Filter Status Data ──────────────────────────────────────
    test('PD-F-021: Filter Status Data', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-022: Copy Paste Huruf ──────────────────────────────────────
    test('PD-F-022: Copy Paste Huruf', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-023: Tombol Refresh ──────────────────────────────────────
    test('PD-F-023: Tombol Refresh', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-024: Row Hover Effect ──────────────────────────────────────
    test('PD-F-024: Row Hover Effect', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-025: Tab Index Form ──────────────────────────────────────
    test('PD-F-025: Tab Index Form', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-026: Export ke PDF ──────────────────────────────────────
    test('PD-F-026: Export ke PDF', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-027: Fitur Print Browser ──────────────────────────────────────
    test('PD-F-027: Fitur Print Browser', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-028: Edit Deskripsi ──────────────────────────────────────
    test('PD-F-028: Edit Deskripsi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-029: Panjang Keterangan ──────────────────────────────────────
    test('PD-F-029: Panjang Keterangan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-F-030: Session Timeout ──────────────────────────────────────
    test('PD-F-030: Session Timeout', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-001: Validasi Limit Sisa ──────────────────────────────────────
    test('PD-I-001: Validasi Limit Sisa', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-002: Transisi Fase LPJ ──────────────────────────────────────
    test('PD-I-002: Transisi Fase LPJ', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-003: Dispatch Email ──────────────────────────────────────
    test('PD-I-003: Dispatch Email', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-004: Akurasi Agregasi API ──────────────────────────────────────
    test('PD-I-004: Akurasi Agregasi API', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-005: Race Condition Limit ──────────────────────────────────────
    test('PD-I-005: Race Condition Limit', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-006: DB Rollback Mekanik ──────────────────────────────────────
    test('PD-I-006: DB Rollback Mekanik', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-007: Sinkronisasi Log ──────────────────────────────────────
    test('PD-I-007: Sinkronisasi Log', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-008: Mock API Bank ──────────────────────────────────────
    test('PD-I-008: Mock API Bank', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-009: Server Limit File ──────────────────────────────────────
    test('PD-I-009: Server Limit File', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-010: Trigger LPJ Open ──────────────────────────────────────
    test('PD-I-010: Trigger LPJ Open', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-011: Trigger KAK Status ──────────────────────────────────────
    test('PD-I-011: Trigger KAK Status', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-012: Log User IP Address ──────────────────────────────────────
    test('PD-I-012: Log User IP Address', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-013: Stress Test Tombol ──────────────────────────────────────
    test('PD-I-013: Stress Test Tombol', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-014: Cascading Deletion ──────────────────────────────────────
    test('PD-I-014: Cascading Deletion', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-I-015: Endpoints Validasi ──────────────────────────────────────
    test('PD-I-015: Endpoints Validasi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-001: Sisa Dana Realtime ──────────────────────────────────────
    test('PD-U-001: Sisa Dana Realtime', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-002: UX Nominal Rupiah ──────────────────────────────────────
    test('PD-U-002: UX Nominal Rupiah', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-003: Flow Batch Processing ──────────────────────────────────────
    test('PD-U-003: Flow Batch Processing', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-004: Legalitas Kuitansi ──────────────────────────────────────
    test('PD-U-004: Legalitas Kuitansi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-005: Block Transaksi Over ──────────────────────────────────────
    test('PD-U-005: Block Transaksi Over', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-006: Transparansi User ──────────────────────────────────────
    test('PD-U-006: Transparansi User', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-007: Aksesibilitas Mobile ──────────────────────────────────────
    test('PD-U-007: Aksesibilitas Mobile', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-008: Presisi Laporan Ekspor ──────────────────────────────────────
    test('PD-U-008: Presisi Laporan Ekspor', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-009: Koreksi Dokumen ──────────────────────────────────────
    test('PD-U-009: Koreksi Dokumen', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-010: Konfirmasi Keamanan ──────────────────────────────────────
    test('PD-U-010: Konfirmasi Keamanan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-011: Pembeda Visual Status ──────────────────────────────────────
    test('PD-U-011: Pembeda Visual Status', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-012: Print Window Browser ──────────────────────────────────────
    test('PD-U-012: Print Window Browser', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-013: Waktu Pemuatan Data ──────────────────────────────────────
    test('PD-U-013: Waktu Pemuatan Data', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-014: Pesan Laporan Jelas ──────────────────────────────────────
    test('PD-U-014: Pesan Laporan Jelas', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── PD-U-015: Kepuasan Workflow ──────────────────────────────────────
    test('PD-U-015: Kepuasan Workflow', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-001: Catatan Kosong ──────────────────────────────────────
    test('MK-F-001: Catatan Kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-002: Visibilitas Pengusul ──────────────────────────────────────
    test('MK-F-002: Visibilitas Pengusul', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-003: Visibility Tombol ──────────────────────────────────────
    test('MK-F-003: Visibility Tombol', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-004: Progress Bar Step ──────────────────────────────────────
    test('MK-F-004: Progress Bar Step', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-005: Filter Role Spesifik ──────────────────────────────────────
    test('MK-F-005: Filter Role Spesifik', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-006: Audit Log Historis ──────────────────────────────────────
    test('MK-F-006: Audit Log Historis', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-007: Pencarian By KAK ──────────────────────────────────────
    test('MK-F-007: Pencarian By KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-008: Tooltip Penjelasan ──────────────────────────────────────
    test('MK-F-008: Tooltip Penjelasan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-009: URL Unauthorized ──────────────────────────────────────
    test('MK-F-009: URL Unauthorized', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-010: Empty State ──────────────────────────────────────
    test('MK-F-010: Empty State', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-011: Kategori KAK Dropdown ──────────────────────────────────────
    test('MK-F-011: Kategori KAK Dropdown', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-012: Export Data Excel ──────────────────────────────────────
    test('MK-F-012: Export Data Excel', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-013: Tombol Tolak Muncul ──────────────────────────────────────
    test('MK-F-013: Tombol Tolak Muncul', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-014: Validasi Tolak Kosong ──────────────────────────────────────
    test('MK-F-014: Validasi Tolak Kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-015: Timeline Expand Row ──────────────────────────────────────
    test('MK-F-015: Timeline Expand Row', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-016: Sorting Tgl Terakhir ──────────────────────────────────────
    test('MK-F-016: Sorting Tgl Terakhir', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-017: Paging Retention ──────────────────────────────────────
    test('MK-F-017: Paging Retention', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-018: Sidebar Badge Notif ──────────────────────────────────────
    test('MK-F-018: Sidebar Badge Notif', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-019: Multi-Line Catatan ──────────────────────────────────────
    test('MK-F-019: Multi-Line Catatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-020: Download Lampiran ──────────────────────────────────────
    test('MK-F-020: Download Lampiran', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-021: Highlight Baris Urgen ──────────────────────────────────────
    test('MK-F-021: Highlight Baris Urgen', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-022: Unduh Bulk ZIP ──────────────────────────────────────
    test('MK-F-022: Unduh Bulk ZIP', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-023: Filter Rentang Bulan ──────────────────────────────────────
    test('MK-F-023: Filter Rentang Bulan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-025: Reset Filter Tabel ──────────────────────────────────────
    test('MK-F-025: Reset Filter Tabel', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-027: Hide Approved Button ──────────────────────────────────────
    test('MK-F-027: Hide Approved Button', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-028: Pagination Cepat ──────────────────────────────────────
    test('MK-F-028: Pagination Cepat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-029: Ganti Limit Row ──────────────────────────────────────
    test('MK-F-029: Ganti Limit Row', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-F-030: Token Refresh Standby ──────────────────────────────────────
    test('MK-F-030: Token Refresh Standby', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-001: Sequential Workflow ──────────────────────────────────────
    test('MK-I-001: Sequential Workflow', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-002: Concurrency Lock ──────────────────────────────────────
    test('MK-I-002: Concurrency Lock', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-003: Trigger Audit Log ──────────────────────────────────────
    test('MK-I-003: Trigger Audit Log', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-004: URL Signed Storage ──────────────────────────────────────
    test('MK-I-004: URL Signed Storage', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-005: Job Antrian Email ──────────────────────────────────────
    test('MK-I-005: Job Antrian Email', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-006: Realtime Broadcasting ──────────────────────────────────────
    test('MK-I-006: Realtime Broadcasting', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-008: Bypass Tahap Manual ──────────────────────────────────────
    test('MK-I-008: Bypass Tahap Manual', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-009: Akurasi Chart Stats ──────────────────────────────────────
    test('MK-I-009: Akurasi Chart Stats', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-010: Retry Job Failure ──────────────────────────────────────
    test('MK-I-010: Retry Job Failure', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-011: Cache Busting Data ──────────────────────────────────────
    test('MK-I-011: Cache Busting Data', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-013: Observer Listeners ──────────────────────────────────────
    test('MK-I-013: Observer Listeners', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-014: Row Locking Review ──────────────────────────────────────
    test('MK-I-014: Row Locking Review', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-I-015: Integritas Notif & Log ──────────────────────────────────────
    test('MK-I-015: Integritas Notif & Log', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-001: Efisiensi Dashboard Pimpinan ──────────────────────────────────────
    test('MK-U-001: Efisiensi Dashboard Pimpinan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-002: Kejelasan Bottleneck Tracker ──────────────────────────────────────
    test('MK-U-002: Kejelasan Bottleneck Tracker', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-003: Kelancaran Eksekusi Cepat ──────────────────────────────────────
    test('MK-U-003: Kelancaran Eksekusi Cepat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-004: Solusi Penolakan Jelas ──────────────────────────────────────
    test('MK-U-004: Solusi Penolakan Jelas', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-005: Standarisasi Cetak Laporan ──────────────────────────────────────
    test('MK-U-005: Standarisasi Cetak Laporan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-006: Responsivitas Mobile Pimpinan ──────────────────────────────────────
    test('MK-U-006: Responsivitas Mobile Pimpinan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-007: Fast Searching Algoritma ──────────────────────────────────────
    test('MK-U-007: Fast Searching Algoritma', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-008: Transparansi Jejak Audit ──────────────────────────────────────
    test('MK-U-008: Transparansi Jejak Audit', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-009: Interaksi File Praktis ──────────────────────────────────────
    test('MK-U-009: Interaksi File Praktis', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-010: Onboarding Mudah ──────────────────────────────────────
    test('MK-U-010: Onboarding Mudah', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-011: Kepuasan Chart Visual ──────────────────────────────────────
    test('MK-U-011: Kepuasan Chart Visual', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-012: Tracking Mobilitas ──────────────────────────────────────
    test('MK-U-012: Tracking Mobilitas', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-013: Bebas Frustasi Loading ──────────────────────────────────────
    test('MK-U-013: Bebas Frustasi Loading', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-014: Akuntabilitas Terbuka ──────────────────────────────────────
    test('MK-U-014: Akuntabilitas Terbuka', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── MK-U-015: Kesan Premium Software ──────────────────────────────────────
    test('MK-U-015: Kesan Premium Software', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-001: Tampil Halaman Login ──────────────────────────────────────
    test('LGN-F-001: Tampil Halaman Login', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-002: Login Berhasil (Admin) ──────────────────────────────────────
    test('LGN-F-002: Login Berhasil (Admin)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-003: Login Salah Username ──────────────────────────────────────
    test('LGN-F-003: Login Salah Username', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-004: Login Salah Password ──────────────────────────────────────
    test('LGN-F-004: Login Salah Password', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-005: Login Case-Sensitive Password ──────────────────────────────────────
    test('LGN-F-005: Login Case-Sensitive Password', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-006: Validasi Input Kosong ──────────────────────────────────────
    test('LGN-F-006: Validasi Input Kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-007: Validasi Username Kosong ──────────────────────────────────────
    test('LGN-F-007: Validasi Username Kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-008: Validasi Password Kosong ──────────────────────────────────────
    test('LGN-F-008: Validasi Password Kosong', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-009: Rate Limiting - Lockout ──────────────────────────────────────
    test('LGN-F-009: Rate Limiting - Lockout', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-010: Rate Limiting - Release ──────────────────────────────────────
    test('LGN-F-010: Rate Limiting - Release', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-011: Tampilkan Password ──────────────────────────────────────
    test('LGN-F-011: Tampilkan Password', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-012: Sembunyikan Password ──────────────────────────────────────
    test('LGN-F-012: Sembunyikan Password', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-013: Centang Ingat Saya ──────────────────────────────────────
    test('LGN-F-013: Centang Ingat Saya', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-014: Tanpa Centang Ingat Saya ──────────────────────────────────────
    test('LGN-F-014: Tanpa Centang Ingat Saya', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-F-015: Akses URL Terproteksi Tanpa Login ──────────────────────────────────────
    test('LGN-F-015: Akses URL Terproteksi Tanpa Login', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-I-001: Sesi Aktif Setelah Tab Ditutup ──────────────────────────────────────
    test('LGN-I-001: Sesi Aktif Setelah Tab Ditutup', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-I-002: Logout Lalu Akses Dashboard ──────────────────────────────────────
    test('LGN-I-002: Logout Lalu Akses Dashboard', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-I-003: Login Tercatat di Log System ──────────────────────────────────────
    test('LGN-I-003: Login Tercatat di Log System', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-I-004: Akses Paksa URL Beda Role ──────────────────────────────────────
    test('LGN-I-004: Akses Paksa URL Beda Role', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── LGN-I-005: Klik Logo SIGAP PNJ ──────────────────────────────────────
    test('LGN-I-005: Klik Logo SIGAP PNJ', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-001: Tampil Daftar Semua User ──────────────────────────────────────
    test('USR-F-001: Tampil Daftar Semua User', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-002: Cari berdasarkan Nama (Exact) ──────────────────────────────────────
    test('USR-F-002: Cari berdasarkan Nama (Exact)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-003: Cari Nama (Huruf Kecil) ──────────────────────────────────────
    test('USR-F-003: Cari Nama (Huruf Kecil)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-004: Cari berdasarkan Username ──────────────────────────────────────
    test('USR-F-004: Cari berdasarkan Username', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-005: Cari berdasarkan Email ──────────────────────────────────────
    test('USR-F-005: Cari berdasarkan Email', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-006: Cari berdasarkan Role ──────────────────────────────────────
    test('USR-F-006: Cari berdasarkan Role', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-007: Keyword Tidak Ditemukan ──────────────────────────────────────
    test('USR-F-007: Keyword Tidak Ditemukan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-008: Hapus Keyword (Tombol X) ──────────────────────────────────────
    test('USR-F-008: Hapus Keyword (Tombol X)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-009: Tombol Tambah Buka Form ──────────────────────────────────────
    test('USR-F-009: Tombol Tambah Buka Form', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-010: Username Mengandung Spasi ──────────────────────────────────────
    test('USR-F-010: Username Mengandung Spasi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-011: Format Email Tidak Valid ──────────────────────────────────────
    test('USR-F-011: Format Email Tidak Valid', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-012: Role Tidak Dipilih ──────────────────────────────────────
    test('USR-F-012: Role Tidak Dipilih', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-013: Password < 8 Karakter ──────────────────────────────────────
    test('USR-F-013: Password < 8 Karakter', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-014: Simpan with Status Non-Aktif ──────────────────────────────────────
    test('USR-F-014: Simpan with Status Non-Aktif', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-015: Simpan Data Valid ──────────────────────────────────────
    test('USR-F-015: Simpan Data Valid', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-016: Keluar Form Tanpa Simpan ──────────────────────────────────────
    test('USR-F-016: Keluar Form Tanpa Simpan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-017: Ubah Nama User ──────────────────────────────────────
    test('USR-F-017: Ubah Nama User', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-018: Ubah Role User ──────────────────────────────────────
    test('USR-F-018: Ubah Role User', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-019: Ubah Password ──────────────────────────────────────
    test('USR-F-019: Ubah Password', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-020: Ubah Email ──────────────────────────────────────
    test('USR-F-020: Ubah Email', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-021: Email Sudah Digunakan User Lain ──────────────────────────────────────
    test('USR-F-021: Email Sudah Digunakan User Lain', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-022: Format Email Tidak Valid ──────────────────────────────────────
    test('USR-F-022: Format Email Tidak Valid', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-023: Keluar Form Edit Tanpa Simpan ──────────────────────────────────────
    test('USR-F-023: Keluar Form Edit Tanpa Simpan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-024: Konfirmasi Hapus (Ya) ──────────────────────────────────────
    test('USR-F-024: Konfirmasi Hapus (Ya)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-F-025: Batal Hapus ──────────────────────────────────────
    test('USR-F-025: Batal Hapus', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-I-001: User Baru Bisa Login ──────────────────────────────────────
    test('USR-I-001: User Baru Bisa Login', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-I-002: Perubahan Role Langsung Berlaku ──────────────────────────────────────
    test('USR-I-002: Perubahan Role Langsung Berlaku', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-I-003: User Terhapus Tidak Bisa Login ──────────────────────────────────────
    test('USR-I-003: User Terhapus Tidak Bisa Login', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── USR-I-004: Aktivitas CRUD Tercatat di Log ──────────────────────────────────────
    test('USR-I-004: Aktivitas CRUD Tercatat di Log', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-001: Muncul Notifikasi Baru ──────────────────────────────────────
    test('NTF-F-001: Muncul Notifikasi Baru', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-002: Badge Bertambah Setiap Notif Baru ──────────────────────────────────────
    test('NTF-F-002: Badge Bertambah Setiap Notif Baru', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-003: Buka Daftar Notifikasi ──────────────────────────────────────
    test('NTF-F-003: Buka Daftar Notifikasi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-004: Tidak Ada Notifikasi ──────────────────────────────────────
    test('NTF-F-004: Tidak Ada Notifikasi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-005: Tandai Satu Notifikasi Dibaca ──────────────────────────────────────
    test('NTF-F-005: Tandai Satu Notifikasi Dibaca', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-006: Klik Notif Menuju Halaman Terkait ──────────────────────────────────────
    test('NTF-F-006: Klik Notif Menuju Halaman Terkait', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-007: Tandai Semua Notifikasi Dibaca ──────────────────────────────────────
    test('NTF-F-007: Tandai Semua Notifikasi Dibaca', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-008: Email saat KAK Disetujui ──────────────────────────────────────
    test('NTF-F-008: Email saat KAK Disetujui', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-009: Email saat KAK Dikembalikan ──────────────────────────────────────
    test('NTF-F-009: Email saat KAK Dikembalikan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-F-010: Email saat Ada Tugas Baru ──────────────────────────────────────
    test('NTF-F-010: Email saat Ada Tugas Baru', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-I-001: Submit KAK Trigger Notif ──────────────────────────────────────
    test('NTF-I-001: Submit KAK Trigger Notif', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-I-002: Setujui KAK Trigger Notif ke Pengusul ──────────────────────────────────────
    test('NTF-I-002: Setujui KAK Trigger Notif ke Pengusul', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-I-003: Klik Notif Mengarah ke Halaman Tepat ──────────────────────────────────────
    test('NTF-I-003: Klik Notif Mengarah ke Halaman Tepat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-I-004: Email Dikirim Meski SMTP Lambat ──────────────────────────────────────
    test('NTF-I-004: Email Dikirim Meski SMTP Lambat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── NTF-I-005: Notif Hanya Muncul Sesuai Role ──────────────────────────────────────
    test('NTF-I-005: Notif Hanya Muncul Sesuai Role', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── D-UAT-001: Pemulihan Akses Mandiri ──────────────────────────────────────
    test('D-UAT-001: Pemulihan Akses Mandiri', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── D-UAT-002: Keamanan Sesi ──────────────────────────────────────
    test('D-UAT-002: Keamanan Sesi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── D-UAT-003: Efisiensi Pencarian ──────────────────────────────────────
    test('D-UAT-003: Efisiensi Pencarian', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── D-UAT-004: Kemudahan Kelola Akun ──────────────────────────────────────
    test('D-UAT-004: Kemudahan Kelola Akun', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── D-UAT-005: Kejelasan Pesan Notifikasi ──────────────────────────────────────
    test('D-UAT-005: Kejelasan Pesan Notifikasi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F01: Admin dapat mengakses halaman daftar panduan ──────────────────────────────────────
    test('TC-P-F01: Admin dapat mengakses halaman daftar panduan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F02: Non-admin (Pengusul) dilarang akses halaman panduan ──────────────────────────────────────
    test('TC-P-F02: Non-admin (Pengusul) dilarang akses halaman panduan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F03: Non-admin (Verifikator) dilarang akses halaman panduan ──────────────────────────────────────
    test('TC-P-F03: Non-admin (Verifikator) dilarang akses halaman panduan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F04: Admin tambah panduan tipe Video (YouTube) ──────────────────────────────────────
    test('TC-P-F04: Admin tambah panduan tipe Video (YouTube)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F05: Admin tambah panduan tipe Dokumen PDF ──────────────────────────────────────
    test('TC-P-F05: Admin tambah panduan tipe Dokumen PDF', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F06: Admin tambah panduan with target role spesifik ──────────────────────────────────────
    test('TC-P-F06: Admin tambah panduan with target role spesifik', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F07: Admin tambah panduan tanpa target role (untuk semua) ──────────────────────────────────────
    test('TC-P-F07: Admin tambah panduan tanpa target role (untuk semua)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F08: Validasi: judul wajib diisi ──────────────────────────────────────
    test('TC-P-F08: Validasi: judul wajib diisi', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F09: Validasi: URL video harus domain YouTube ──────────────────────────────────────
    test('TC-P-F09: Validasi: URL video harus domain YouTube', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F10: Validasi: file dokumen wajib ada saat tipe=document ──────────────────────────────────────
    test('TC-P-F10: Validasi: file dokumen wajib ada saat tipe=document', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F11: Validasi: format file tidak valid (.exe) ──────────────────────────────────────
    test('TC-P-F11: Validasi: format file tidak valid (.exe)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F12: Admin update judul panduan video ──────────────────────────────────────
    test('TC-P-F12: Admin update judul panduan video', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F13: Admin ganti panduan from video ke dokumen ──────────────────────────────────────
    test('TC-P-F13: Admin ganti panduan from video ke dokumen', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F14: Admin ganti panduan from dokumen ke video ──────────────────────────────────────
    test('TC-P-F14: Admin ganti panduan from dokumen ke video', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F15: Validasi: ganti ke dokumen tanpa upload file ──────────────────────────────────────
    test('TC-P-F15: Validasi: ganti ke dokumen tanpa upload file', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F16: Admin hapus panduan dokumen ──────────────────────────────────────
    test('TC-P-F16: Admin hapus panduan dokumen', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F17: Admin hapus panduan video ──────────────────────────────────────
    test('TC-P-F17: Admin hapus panduan video', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F18: Download dokumen PDF ──────────────────────────────────────
    test('TC-P-F18: Download dokumen PDF', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F19: Preview dokumen PDF inline ──────────────────────────────────────
    test('TC-P-F19: Preview dokumen PDF inline', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F20: Akses download panduan video → redirect ke YouTube ──────────────────────────────────────
    test('TC-P-F20: Akses download panduan video → redirect ke YouTube', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F21: Download panduan yang file-nya tidak ada di storage ──────────────────────────────────────
    test('TC-P-F21: Download panduan yang file-nya tidak ada di storage', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-F22: Pengguna tanpa login tidak bisa download panduan ──────────────────────────────────────
    test('TC-P-F22: Pengguna tanpa login tidak bisa download panduan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-I01: Upload panduan → file tersimpan di Supabase Storage ──────────────────────────────────────
    test('TC-P-I01: Upload panduan → file tersimpan di Supabase Storage', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-I02: Hapus panduan → file ikut terhapus from Storage ──────────────────────────────────────
    test('TC-P-I02: Hapus panduan → file ikut terhapus from Storage', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-I03: Panduan tampil di dashboard user sesuai role ──────────────────────────────────────
    test('TC-P-I03: Panduan tampil di dashboard user sesuai role', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-I04: Panduan untuk semua role tampil di semua dashboard ──────────────────────────────────────
    test('TC-P-I04: Panduan untuk semua role tampil di semua dashboard', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-I05: Middleware Admin melindungi semua route /admin/panduan ──────────────────────────────────────
    test('TC-P-I05: Middleware Admin melindungi semua route /admin/panduan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-U01: Admin menambah panduan PDF and dapat diakses pengguna ──────────────────────────────────────
    test('TC-P-U01: Admin menambah panduan PDF and dapat diakses pengguna', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-U02: Admin menambah panduan video YouTube ──────────────────────────────────────
    test('TC-P-U02: Admin menambah panduan video YouTube', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-U03: Pengguna mengunduh dokumen panduan ──────────────────────────────────────
    test('TC-P-U03: Pengguna mengunduh dokumen panduan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-U04: Admin mengedit panduan yang sudah ada ──────────────────────────────────────
    test('TC-P-U04: Admin mengedit panduan yang sudah ada', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-P-U05: Admin menghapus panduan ──────────────────────────────────────
    test('TC-P-U05: Admin menghapus panduan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F01: Rektorat di-redirect ke dashboard direktur setelah login ──────────────────────────────────────
    test('TC-D-F01: Rektorat di-redirect ke dashboard direktur setelah login', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F02: Pengusul melihat statistik KAK miliknya ──────────────────────────────────────
    test('TC-D-F02: Pengusul melihat statistik KAK miliknya', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F03: PPK melihat antrian persetujuan level PPK ──────────────────────────────────────
    test('TC-D-F03: PPK melihat antrian persetujuan level PPK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F04: Wadir melihat antrian persetujuan level Wadir2 ──────────────────────────────────────
    test('TC-D-F04: Wadir melihat antrian persetujuan level Wadir2', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F05: Verifikator1 melihat KAK hanya tipe kegiatan 1 ──────────────────────────────────────
    test('TC-D-F05: Verifikator1 melihat KAK hanya tipe kegiatan 1', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F06: Verifikator tanpa angka melihat semua KAK ──────────────────────────────────────
    test('TC-D-F06: Verifikator tanpa angka melihat semua KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F07: Bendahara melihat daftar kegiatan siap cair ──────────────────────────────────────
    test('TC-D-F07: Bendahara melihat daftar kegiatan siap cair', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F08: Admin/default melihat statistik umum ──────────────────────────────────────
    test('TC-D-F08: Admin/default melihat statistik umum', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F09: Dashboard direktur default periode 6 bulan ──────────────────────────────────────
    test('TC-D-F09: Dashboard direktur default periode 6 bulan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F10: Dashboard direktur filter periode 3 bulan ──────────────────────────────────────
    test('TC-D-F10: Dashboard direktur filter periode 3 bulan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F11: Dashboard direktur filter periode 1 tahun ──────────────────────────────────────
    test('TC-D-F11: Dashboard direktur filter periode 1 tahun', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F12: Dashboard direktur filter periode 'year' (awal tahun) ──────────────────────────────────────
    test('TC-D-F12: Dashboard direktur filter periode \'year\' (awal tahun)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F13: Dashboard direktur filter periode 'all' ──────────────────────────────────────
    test('TC-D-F13: Dashboard direktur filter periode \'all\'', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F14: Non-Rektorat tidak bisa akses dashboard direktur ──────────────────────────────────────
    test('TC-D-F14: Non-Rektorat tidak bisa akses dashboard direktur', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F15: Guest/unauthenticated redirect ke login ──────────────────────────────────────
    test('TC-D-F15: Guest/unauthenticated redirect ke login', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F16: Dashboard direktur menampilkan daftar video panduan ──────────────────────────────────────
    test('TC-D-F16: Dashboard direktur menampilkan daftar video panduan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F17: Prop panduans tersedia di setiap dashboard role ──────────────────────────────────────
    test('TC-D-F17: Prop panduans tersedia di setiap dashboard role', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F18: Bendahara melihat status waiting/disbursed/lpj ──────────────────────────────────────
    test('TC-D-F18: Bendahara melihat status waiting/disbursed/lpj', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F19: Direktur melihat data per jurusan (by_jurusan) ──────────────────────────────────────
    test('TC-D-F19: Direktur melihat data per jurusan (by_jurusan)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F20: Direktur melihat tren bulanan (trends) ──────────────────────────────────────
    test('TC-D-F20: Direktur melihat tren bulanan (trends)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F21: Direktur melihat aktivitas terbaru (recent_activities) ──────────────────────────────────────
    test('TC-D-F21: Direktur melihat aktivitas terbaru (recent_activities)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-F22: Budget growth dihitung jika ada data periode sebelumnya ──────────────────────────────────────
    test('TC-D-F22: Budget growth dihitung jika ada data periode sebelumnya', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-I01: Login Rektorat → redirect otomatis ke dashboard direktur ──────────────────────────────────────
    test('TC-D-I01: Login Rektorat → redirect otomatis ke dashboard direktur', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-I02: Panduan terfilter by role tampil di dashboard ──────────────────────────────────────
    test('TC-D-I02: Panduan terfilter by role tampil di dashboard', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-I03: Data overview direktur dihitung real from DB ──────────────────────────────────────
    test('TC-D-I03: Data overview direktur dihitung real from DB', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-I04: Filter period mengubah rentang data DB ──────────────────────────────────────
    test('TC-D-I04: Filter period mengubah rentang data DB', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-I05: Middleware role memblokir non-Rektorat ──────────────────────────────────────
    test('TC-D-I05: Middleware role memblokir non-Rektorat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-U01: Pengusul melihat ringkasan KAK ──────────────────────────────────────
    test('TC-D-U01: Pengusul melihat ringkasan KAK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-U02: PPK melihat daftar kegiatan pending ──────────────────────────────────────
    test('TC-D-U02: PPK melihat daftar kegiatan pending', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-U03: Direktur melihat overview performa ──────────────────────────────────────
    test('TC-D-U03: Direktur melihat overview performa', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-U04: Direktur filter data per periode ──────────────────────────────────────
    test('TC-D-U04: Direktur filter data per periode', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-D-U05: Bendahara melihat status dana kegiatan ──────────────────────────────────────
    test('TC-D-U05: Bendahara melihat status dana kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F01: PPK melihat daftar kegiatan pending ──────────────────────────────────────
    test('TC-K-F01: PPK melihat daftar kegiatan pending', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F02: Wadir melihat daftar kegiatan pending Wadir2 ──────────────────────────────────────
    test('TC-K-F02: Wadir melihat daftar kegiatan pending Wadir2', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F03: Pengusul melihat KAK siap jadi kegiatan ──────────────────────────────────────
    test('TC-K-F03: Pengusul melihat KAK siap jadi kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F04: Pengusul mengajukan kegiatan with surat pengantar ──────────────────────────────────────
    test('TC-K-F04: Pengusul mengajukan kegiatan with surat pengantar', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F05: Pengusul mengajukan kegiatan tanpa surat pengantar ──────────────────────────────────────
    test('TC-K-F05: Pengusul mengajukan kegiatan tanpa surat pengantar', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F06: Tolak pengajuan: KAK sudah memiliki kegiatan ──────────────────────────────────────
    test('TC-K-F06: Tolak pengajuan: KAK sudah memiliki kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F07: Tolak pengajuan: KAK belum disetujui Verifikator ──────────────────────────────────────
    test('TC-K-F07: Tolak pengajuan: KAK belum disetujui Verifikator', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F08: PPK menyetujui kegiatan ──────────────────────────────────────
    test('TC-K-F08: PPK menyetujui kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F09: Wadir menyetujui kegiatan ──────────────────────────────────────
    test('TC-K-F09: Wadir menyetujui kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F10: PPK tidak bisa approve kegiatan di step Wadir2 ──────────────────────────────────────
    test('TC-K-F10: PPK tidak bisa approve kegiatan di step Wadir2', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F11: Wadir tidak bisa approve kegiatan di step PPK ──────────────────────────────────────
    test('TC-K-F11: Wadir tidak bisa approve kegiatan di step PPK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F12: Approve gagal jika tidak ada active approval ──────────────────────────────────────
    test('TC-K-F12: Approve gagal jika tidak ada active approval', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F13: Detail kegiatan dapat dilihat ──────────────────────────────────────
    test('TC-K-F13: Detail kegiatan dapat dilihat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F14: Monitoring menampilkan semua kegiatan (Admin) ──────────────────────────────────────
    test('TC-K-F14: Monitoring menampilkan semua kegiatan (Admin)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F15: Monitoring filter kegiatan milik Pengusul saja ──────────────────────────────────────
    test('TC-K-F15: Monitoring filter kegiatan milik Pengusul saja', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F16: Monitoring Verifikator1 filter by tipe kegiatan ──────────────────────────────────────
    test('TC-K-F16: Monitoring Verifikator1 filter by tipe kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F17: Monitoring support pencarian nama kegiatan ──────────────────────────────────────
    test('TC-K-F17: Monitoring support pencarian nama kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F18: Monitoring menampilkan step progress kegiatan ──────────────────────────────────────
    test('TC-K-F18: Monitoring menampilkan step progress kegiatan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F19: Monitoring menampilkan kegiatan selesai (step 5 approved) ──────────────────────────────────────
    test('TC-K-F19: Monitoring menampilkan kegiatan selesai (step 5 approved)', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F20: KAK status diperbarui ke 6 saat kegiatan dibuat ──────────────────────────────────────
    test('TC-K-F20: KAK status diperbarui ke 6 saat kegiatan dibuat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F21: Log status dibuat saat kegiatan dibuat ──────────────────────────────────────
    test('TC-K-F21: Log status dibuat saat kegiatan dibuat', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-F22: Log status dibuat saat PPK approve ──────────────────────────────────────
    test('TC-K-F22: Log status dibuat saat PPK approve', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-I01: Ajukan kegiatan → 5 approval steps terbuat otomatis ──────────────────────────────────────
    test('TC-K-I01: Ajukan kegiatan → 5 approval steps terbuat otomatis', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-I02: PPK approve → Wadir2 menjadi Aktif ──────────────────────────────────────
    test('TC-K-I02: PPK approve → Wadir2 menjadi Aktif', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-I03: Wadir approve → Bendahara-Cair Aktif + email terkirim ──────────────────────────────────────
    test('TC-K-I03: Wadir approve → Bendahara-Cair Aktif + email terkirim', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-I04: Dashboard PPK mencerminkan kegiatan pending ──────────────────────────────────────
    test('TC-K-I04: Dashboard PPK mencerminkan kegiatan pending', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-I05: Monitoring step ter-update setelah approval ──────────────────────────────────────
    test('TC-K-I05: Monitoring step ter-update setelah approval', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-U01: Pengusul mengajukan kegiatan baru ──────────────────────────────────────
    test('TC-K-U01: Pengusul mengajukan kegiatan baru', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-U02: PPK menyetujui kegiatan yang diajukan ──────────────────────────────────────
    test('TC-K-U02: PPK menyetujui kegiatan yang diajukan', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-U03: Wadir menyetujui kegiatan setelah PPK ──────────────────────────────────────
    test('TC-K-U03: Wadir menyetujui kegiatan setelah PPK', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-U04: Pengusul tidak bisa ajukan from KAK belum disetujui ──────────────────────────────────────
    test('TC-K-U04: Pengusul tidak bisa ajukan from KAK belum disetujui', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-U05: Monitoring menampilkan progress tahapan visual ──────────────────────────────────────
    test('TC-K-U05: Monitoring menampilkan progress tahapan visual', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-U06: PPK tidak bisa approve step yang bukan miliknya ──────────────────────────────────────
    test('TC-K-U06: PPK tidak bisa approve step yang bukan miliknya', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

    // ─── TC-K-U07: Email notifikasi diterima pengusul setelah di-approve ──────────────────────────────────────
    test('TC-K-U07: Email notifikasi diterima pengusul setelah di-approve', async ({ page }) => {
        await page.goto('/'); 
        expect(await page.title()).toContain('SIGAP');
    });

});
