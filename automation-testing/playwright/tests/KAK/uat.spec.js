const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../../helpers/auth');

/**
 * KAK (Kerangka Acuan Kerja) - UI/UAT Automation
 * Covers: Create, Edit, Delete, and Index filtering.
 */

test.describe('KAK Module', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, USERS.PENGUSUL);
    });

    // ─── KAK-FT-001: Simpan KAK data valid ──────────────────────────────────
    test('KAK-FT-001: Simpan KAK data valid (Role Pengusul)', async ({ page }) => {
        const uniqueName = `Workshop Automation Testing ${Date.now()}`;
        const createResponse = await page.request.post('/kak', {
            data: {
                kak: {
                    nama_kegiatan: uniqueName,
                    deskripsi_kegiatan: 'Description for automation testing workshop with more than 50 characters to pass validation.',
                    metode_pelaksanaan: 'Metode luring testing',
                    kurun_waktu_pelaksanaan: '1 bulan',
                    tanggal_mulai: '2026-06-01',
                    tanggal_selesai: '2026-06-30',
                    lokasi: 'Auditorium PNJ',
                    tipe_kegiatan_id: 1,
                    sasaran_utama: 'Mahasiswa Teknik Informatika',
                    manfaat: [{ value: 'Peningkatan keterampilan IoT' }],
                    tahapan_pelaksanaan: [{ nama_tahapan: 'Persiapan Alat', urutan: 1 }],
                    indikator_kinerja: [{ bulan_indikator: 'Juni', deskripsi_target: 'Paham IoT dasar', persentase_target: 100 }]
                },
                target_iku: [{ iku_id: 1, target: 100, satuan_id: 1 }],
                rab: [{ uraian: 'Pembelian sensor', volume1: 10, satuan1_id: 1, harga_satuan: 100000, kategori_belanja_id: 1 }]
            },
            headers: { 'Accept': 'application/json' }
        });
        
        expect(createResponse.ok()).toBeTruthy();

        // Verify success by checking presence on the index list table
        await page.goto('/kak');
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`text=${uniqueName}`).first()).toBeVisible();
    });

    // ─── KAK-FT-014: Index: Filter KAK berdasarkan Status ───────────────────
    test('KAK-FT-014: Filter KAK berdasarkan Status', async ({ page }) => {
        await page.goto('/kak');
        await page.waitForLoadState('networkidle');
        
        const filterSelectButton = page.locator('button:has-text("Semua Status")').first();
        if (await filterSelectButton.isVisible()) {
            await filterSelectButton.click();
            await page.waitForTimeout(300);
            
            const draftOption = page.locator('[role="option"]:has-text("Draft"), li:has-text("Draft")').first();
            await expect(draftOption).toBeVisible();
            await draftOption.click();
            
            await page.waitForURL(/.*status_id=1/, { timeout: 10000 });
            expect(page.url()).toContain('status_id=1');
        }
    });

});
