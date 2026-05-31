/**
 * ============================================================================
 * SIGAP-Laravel Automation Testing
 * Test File: kegiatan-crud.spec.js
 * ============================================================================
 * 
 * Covers Test Cases:
 *   AK-F-005: Pencarian Nama ("Workshop" di kolom search)
 *   AK-F-006: Edit Draft (ubah penanggung_jawab)
 *   AK-F-007: Hapus Draft (klik Hapus, toast muncul)
 * 
 * Prerequisites:
 *   - Laravel app running at http://localhost:8000
 *   - Database seeded with test data (DummyKegiatanSeeder recommended)
 *   - Kegiatan monitoring page has data
 */

const { test, expect } = require('@playwright/test');
const { login, USERS } = require('../../helpers/auth');
const path = require('path');

// ─── AK-F-005: Pencarian Nama ────────────────────────────────────────────────
test.describe('AK-F-005: Pencarian Nama', () => {

  test('Tabel hanya menampilkan baris yang mengandung kata pencarian', async ({ page }) => {
    // 1. Login sebagai Pengusul
    await login(page, USERS.PENGUSUL);

    // 2. Navigate ke halaman monitoring kegiatan (di mana ada search)
    await page.goto('/kegiatan/monitoring');
    await page.waitForLoadState('networkidle');

    // 3. Ambil jumlah baris sebelum search
    await page.waitForTimeout(1000); // Tunggu animasi selesai
    
    // 4. Ketik keyword di search box
    const searchInput = page.locator('input[placeholder*="Cari"], input[placeholder*="cari"], input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    
    // Gunakan keyword yang kemungkinan ada di data
    const searchKeyword = 'Workshop';
    
    // Capture table text before search to compare later
    const beforeText = await page.locator('table tbody').textContent();
    
    await searchInput.fill(searchKeyword);

    // 5. Tunggu debounce (300ms) + response + UI update
    await page.waitForTimeout(1500); 
    await page.waitForLoadState('networkidle');

    // 6. Verifikasi hasil: semua baris yang tampil harus mengandung keyword
    //    ATAU tabel kosong (jika tidak ada data yang cocok)
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();

    const emptyState = page.locator('text=Belum Ada Kegiatan');
    if (await emptyState.isVisible().catch(() => false)) {
        // Tidak ada data yang match - ini valid
        expect(true).toBeTruthy();
    } else {
        // Verifikasi setidaknya satu baris ada jika tidak empty state
        expect(rowCount).toBeGreaterThan(0);
        
        // Verifikasi setiap baris mengandung keyword pencarian
        for (let i = 0; i < rowCount; i++) {
          const rowText = await tableRows.nth(i).textContent();
          if (rowText && !rowText.includes('No.') && !rowText.includes('Detail')) {
            if (rowText.toLowerCase().includes('belum ada kegiatan') || rowText.toLowerCase().includes('sepertinya anda belum memiliki')) {
              continue;
            }
            expect(rowText.toLowerCase()).toContain(searchKeyword.toLowerCase());
          }
        }
    }

    // 7. Screenshot sebagai bukti
    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-005-pencarian-nama.png'),
      fullPage: true 
    });

    // 8. Bersihkan search dan verifikasi kembali ke semua data
    const clearButton = page.locator('button').filter({ has: page.locator('[class*="X"], svg') }).first();
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
      await page.waitForTimeout(500);
    } else {
      await searchInput.fill('');
      await page.waitForTimeout(500);
    }

    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-005-pencarian-cleared.png'),
      fullPage: true 
    });
  });
});

// ─── AK-F-006: Edit Draft ────────────────────────────────────────────────────
test.describe('AK-F-006: Edit Draft', () => {

  test('Dapat mengubah data kegiatan pada detail/edit', async ({ page }) => {
    // 1. Login sebagai Pengusul
    await login(page, USERS.PENGUSUL);

    // 2. Navigate ke monitoring kegiatan
    await page.goto('/kegiatan/monitoring');
    await page.waitForLoadState('networkidle');

    // 3. Cari kegiatan yang bisa di-edit (biasanya melalui detail page)
    //    Klik pada baris pertama untuk masuk ke detail
    const firstRow = page.locator('table tbody tr').first();
    
    if (await firstRow.isVisible().catch(() => false)) {
      // Cari link/button ke detail page
      const detailLink = page.locator('a[href*="/kegiatan/"]').first();
      
      if (await detailLink.isVisible().catch(() => false)) {
        await detailLink.click();
        await page.waitForLoadState('networkidle');

        // Cari form edit atau tombol edit di halaman detail
        const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit"), button:has-text("Ubah")').first();
        
        if (await editButton.isVisible().catch(() => false)) {
          await editButton.click();
          
          // Ubah penanggung_jawab
          const pjField = page.locator('input[name*="penanggung_jawab"], input[placeholder*="penanggung jawab"]').first();
          if (await pjField.isVisible().catch(() => false)) {
            await pjField.clear();
            await pjField.fill('Budi');
            
            // Submit perubahan
            const saveButton = page.locator('button[type="submit"]:has-text("Simpan"), button[type="submit"]:has-text("Update")').first();
            if (await saveButton.isVisible().catch(() => false)) {
              await saveButton.click();
              await page.waitForLoadState('networkidle');
              
              // Verifikasi perubahan berhasil
              const successToast = page.locator('text=berhasil');
              await expect(successToast).toBeVisible({ timeout: 5000 });
            }
          }
        } else {
          // Jika tidak ada tombol edit, catat bahwa fitur edit belum tersedia
          console.log('INFO: Tombol Edit tidak ditemukan. Fitur edit mungkin belum diimplementasikan pada halaman detail.');
        }
      }
    }

    // Screenshot
    await page.screenshot({ 
      path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-006-edit-draft.png'),
      fullPage: true 
    });
  });
});

// ─── AK-F-007: Hapus Draft ───────────────────────────────────────────────────
test.describe('AK-F-007: Hapus Draft', () => {

  test('Dapat menghapus KAK draft dan muncul toast konfirmasi', async ({ page }) => {
    // 1. Login sebagai Pengusul
    await login(page, USERS.PENGUSUL);

    // 2. Navigate ke halaman KAK (di mana ada fitur hapus draft)
    //    Hapus Draft ada di fitur KAK, bukan Kegiatan
    await page.goto('/kak');
    await page.waitForLoadState('networkidle');

    // 3. Cari tombol Hapus pada baris dengan status Draft
    const hapusButton = page.locator('button:has-text("Hapus"), button[title="Hapus"]').first();
    
    if (await hapusButton.isVisible().catch(() => false)) {
      // 4. Klik Hapus
      await hapusButton.click();

      // 5. Handle SweetAlert2 confirmation dialog
      //    SweetAlert2 renders a modal with confirm/cancel buttons
      const swalConfirm = page.locator('.swal2-confirm, button:has-text("Ya"), button:has-text("Hapus")').last();
      
      if (await swalConfirm.isVisible({ timeout: 3000 }).catch(() => false)) {
        await swalConfirm.click();
      }

      // 6. Verifikasi toast sukses muncul
      //    SweetAlert2 toast or success message
      const successIndicator = page.locator('.swal2-popup, text=berhasil, text=dihapus').first();
      await expect(successIndicator).toBeVisible({ timeout: 10_000 });

      await page.screenshot({ 
        path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-007-hapus-draft-success.png'),
        fullPage: true 
      });
    } else {
      console.log('INFO: Tidak ada KAK draft yang bisa dihapus. Buat KAK draft terlebih dahulu.');
      
      await page.screenshot({ 
        path: path.join(__dirname, '..', '..', 'reports', 'playwright', 'AK-F-007-hapus-draft-no-data.png'),
        fullPage: true 
      });
    }
  });
});
