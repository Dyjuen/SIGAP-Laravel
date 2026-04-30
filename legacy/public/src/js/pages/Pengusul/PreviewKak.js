// frontend/src/pages/Pengusul/PreviewKak.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderPreviewKakPage(path, userRole, providedData = null) {
  // Get data from localStorage or use provided data
  let data = providedData;
  
  if (!data) {
    const storedData = localStorage.getItem('kakFormData');
    console.log("Stored data from localStorage:", storedData);
    
    if (storedData) {
      data = JSON.parse(storedData);
      console.log("Parsed data:", data);
    } else {
      console.warn("No data in localStorage!");
      data = {};
    }
  }
  
  console.log("Final data:", data);

  const pageContent = `
    <style>
      /* Scrollbar Hiding */
      html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
      }
      html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
      }

      /* Desktop right padding to prevent content from touching right edge */
      @media (min-width: 1024px) {
        .preview-container {
          padding-right: 1rem;
        }
      }

      /* ============================================= */
      /* PRINT STYLES */
      /* ============================================= */
      @media print {
        body { margin: 0; padding: 0; }
        .no-print { display: none !important; }
        .preview-container { 
          background: none !important;
          padding: 0 !important;
        }
        .pdf-preview {
          box-shadow: none !important;
          margin: 0 !important;
          padding: 20mm !important;
          border: none !important;
          border-radius: 0 !important;
          page-break-after: avoid;
        }
        .page-break {
          page-break-before: always;
          margin-top: 0;
          padding-top: 0;
        }
        .kop-surat { 
          border-bottom: 4px solid #000 !important;
        }
        .rab-table th, 
        .rab-table tr.category-header td, 
        .rab-table tr.total td {
          background: #FFFF00 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .rab-table tr.subtotal td,
        .rab-table tr.item-row td {
          background: #FFFFFF !important;
        }
      }

      /* ============================================= */
      /* CONTAINER & LAYOUT */
      /* ============================================= */
      .preview-container {
        background: #f5f5f5;
        min-height: 100vh;
        padding: 40px 20px;
      }

      .pdf-preview {
        background: #ffffff;
        color: #000000;
        font-family: 'Times New Roman', Times, serif;
        max-width: 210mm;
        min-height: 297mm;
        margin: 0 auto 30px auto;
        padding: 25mm 20mm;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        position: relative;
      }

      /* ============================================= */
      /* KOP SURAT - IMPROVED */
      /* ============================================= */
      .kop-surat {
        text-align: center;
        border-bottom: 4px solid #000;
        padding: 15px 0 20px 0;
        margin-bottom: 35px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 25px;
        min-height: 120px;
      }

      .kop-surat img {
        width: 110px;
        height: 110px;
        object-fit: contain;
        flex-shrink: 0;
        position: absolute;
        left: 20px;
      }

      .kop-surat .header-text {
        flex: 1;
        text-align: center;
        padding: 0 140px;
      }

      .kop-surat h3 {
        font-size: 14px;
        font-weight: 800;
        margin: 3px 0;
        text-transform: uppercase;
        letter-spacing: 1px;
        line-height: 1.5;
        color: #000;
      }

      .kop-surat h2 {
        font-size: 19px;
        font-weight: 900;
        margin: 8px 0;
        letter-spacing: 1.5px;
        color: #000;
      }

      .kop-surat p {
        font-size: 11px;
        margin: 3px 0;
        line-height: 1.6;
        color: #000;
        font-weight: 500;
      }

      /* ============================================= */
      /* DOCUMENT TITLE */
      /* ============================================= */
      .doc-title {
        text-align: center;
        font-size: 17px;
        font-weight: 900;
        margin: 35px 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        line-height: 1.8;
        color: #000;
        padding: 15px 0;
        border-top: 3px solid #000;
        border-bottom: 3px solid #000;
      }

      /* ============================================= */
      /* INFO TABLE */
      /* ============================================= */
      .info-table {
        width: 100%;
        margin-bottom: 30px;
        border-collapse: collapse;
        font-size: 12px;
        background: #fff;
        border: 2px solid #000;
      }

      .info-table td {
        padding: 12px 15px;
        vertical-align: top;
        border: 1px solid #000;
        line-height: 1.8;
      }

      .info-table td:first-child {
        width: 40%;
        font-weight: 700;
        background: #f8f9fa;
        color: #000;
      }

      .info-table td:nth-child(2) {
        width: 3%;
        text-align: center;
        font-weight: 800;
      }

      .info-table td:last-child {
        width: 57%;
        background: #fff;
        font-weight: 500;
      }

      .info-table td.nested {
        padding-left: 30px;
        background: #ffffff;
        font-weight: 500;
      }

      .info-table td.section-header {
        font-weight: 700;
        background: #e9ecef;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* ============================================= */
      /* SECTIONS */
      /* ============================================= */
      .section {
        margin-bottom: 25px;
      }

      .section-title {
        font-weight: 800;
        font-size: 13px;
        margin: 20px 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #000;
      }

      .subsection-title {
        font-weight: 700;
        font-size: 12px;
        margin: 15px 0 8px 0;
        color: #000;
      }

      .content {
        text-align: justify;
        line-height: 1.9;
        font-size: 11px;
        margin-bottom: 15px;
        color: #000;
      }

      .content ul, .content ol {
        margin: 10px 0;
        padding-left: 30px;
      }

      .content li {
        margin-bottom: 8px;
        line-height: 1.9;
      }

      /* ============================================= */
      /* RAB INFO SECTION - NOT TABLE */
      /* ============================================= */
      .rab-info {
        font-size: 11px;
        line-height: 1.8;
        margin-bottom: 25px;
      }

      .rab-info p {
        margin: 5px 0;
        display: flex;
      }

      .rab-info .label {
        width: 250px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .rab-info .colon {
        width: 20px;
        text-align: center;
        flex-shrink: 0;
      }

      .rab-info .value {
        flex: 1;
      }

      /* ============================================= */
      /* RAB TABLE - EXACT MATCH TO IMAGE */
      /* ============================================= */
      .rab-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 10px;
        border: 2px solid #000;
      }

      .rab-table th,
      .rab-table td {
        border: 1px solid #000;
        padding: 8px;
        text-align: center;
        vertical-align: middle;
      }

      /* Header row - Yellow background */
      .rab-table thead tr:first-child th {
        background: #FFFF00;
        color: #000;
        font-weight: 700;
        font-size: 10px;
        text-transform: capitalize;
        border: 1px solid #000;
        padding: 10px 8px;
      }

      /* Second header row */
      .rab-table thead tr:nth-child(2) th {
        background: #FFFF00;
        color: #000;
        font-weight: 700;
        font-size: 9px;
        border: 1px solid #000;
        padding: 8px;
      }

      /* Body cells */
      .rab-table tbody td {
        background: #FFFFFF;
        color: #000;
        font-size: 10px;
        padding: 6px 8px;
      }

      /* Column widths */
      .rab-table th:nth-child(1),
      .rab-table td:nth-child(1) { 
        width: 35%;
        text-align: left;
        font-weight: 600;
      }
      
      .rab-table th:nth-child(2),
      .rab-table td:nth-child(2) { 
        width: 8%;
      }
      
      .rab-table th:nth-child(3),
      .rab-table td:nth-child(3) { 
        width: 8%;
      }

      .rab-table th:nth-child(4),
      .rab-table td:nth-child(4) { 
        width: 20%;
      }

      .rab-table td:nth-child(5) { 
        width: 5%;
        font-weight: 600;
      }
      
      .rab-table th:nth-child(6),
      .rab-table td:nth-child(6) { 
        width: 12%;
        text-align: right;
        padding-right: 10px;
      }
      
      .rab-table th:nth-child(7),
      .rab-table td:nth-child(7) { 
        width: 12%;
        text-align: right;
        padding-right: 10px;
        font-weight: 700;
      }

      /* Category header - Yellow background */
      .rab-table tr.category-header td {
        background: #FFFF00;
        color: #000;
        font-weight: 700;
        text-align: left;
        padding: 8px 10px;
        font-size: 10px;
        border: 1px solid #000;
      }

      /* Items under category */
      .rab-table tr.item-row td:first-child {
        padding-left: 15px;
        font-weight: 500;
        text-align: left;
      }

      /* Subtotal rows */
      .rab-table tr.subtotal td {
        font-weight: 700;
        background: #FFFFFF;
        color: #000;
        border-top: 2px solid #000;
        font-size: 10px;
      }

      .rab-table tr.subtotal td:first-child {
        text-align: right;
        padding-right: 15px;
      }

      /* Total row - Yellow background */
      .rab-table tr.total td {
        font-weight: 800;
        background: #FFFF00;
        color: #000;
        font-size: 11px;
        text-transform: uppercase;
        border: 2px solid #000;
        padding: 10px;
      }

      .rab-table tr.total td:first-child {
        text-align: center;
      }

      /* ============================================= */
      /* TIMELINE TABLE */
      /* ============================================= */
      .timeline-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 10px;
      }

      .timeline-table th,
      .timeline-table td {
        border: 1px solid #000;
        padding: 8px 10px;
        text-align: center;
      }

      .timeline-table th {
        background: #e9ecef;
        color: #000;
        font-weight: 700;
        font-size: 10px;
        text-transform: uppercase;
      }

      .timeline-table td:first-child {
        width: 30px;
        font-weight: 600;
      }

      .timeline-table td:nth-child(2) {
        text-align: left;
        padding-left: 12px;
        font-weight: 500;
      }

      /* ============================================= */
      /* SIGNATURE GRID */
      /* ============================================= */
      .signature-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 50px 40px;
        margin-top: 60px;
      }

      .signature-box {
        text-align: center;
        font-size: 11px;
      }

      .signature-box p {
        margin: 5px 0;
        line-height: 1.6;
      }

      .signature-space {
        height: 70px;
        margin: 10px 0;
      }

      .signature-box .name {
        font-weight: 700;
        text-decoration: underline;
        font-size: 12px;
      }

      /* ============================================= */
      /* ACTION BUTTONS */
      /* ============================================= */
      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin: 0 0 30px 0;
        padding: 0;
      }

      .btn-action {
        padding: 14px 40px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        border: none;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }

      .btn-action:active {
        transform: translateY(0);
      }

      .btn-back {
        background: #6B7280;
        color: white;
      }

      .btn-back:hover {
        background: #4B5563;
      }

      .btn-print {
        background: #10B981;
        color: white;
      }

      .btn-print:hover {
        background: #059669;
      }

      /* ============================================= */
      /* PAGE BREAK */
      /* ============================================= */
      .page-break {
        page-break-before: always;
        margin-top: 0;
        padding-top: 0;
      }

      /* ============================================= */
      /* PAGE FOOTER */
      /* ============================================= */
      .page-footer {
        position: absolute;
        bottom: 20mm;
        left: 25mm;
        right: 25mm;
        text-align: center;
        font-size: 9px;
        color: #666;
        border-top: 1px solid #ddd;
        padding-top: 10px;
      }

      .page-footer p {
        margin: 3px 0;
        line-height: 1.5;
      }

      /* ============================================= */
      /* RESPONSIVE */
      /* ============================================= */
      @media (max-width: 768px) {
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .preview-container {
          padding: 20px 10px;
        }
        
        .pdf-preview {
          padding: 20mm 15mm !important;
          margin-bottom: 20px;
        }
        
        .action-buttons {
          flex-direction: column;
          gap: 15px;
        }
        
        .btn-action {
          width: 100%;
        }

        .kop-surat {
          flex-direction: column;
          gap: 10px;
        }

        .kop-surat img {
          position: static;
        }

        .kop-surat .header-text {
          padding: 0 20px;
        }

        .signature-grid {
          grid-template-columns: 1fr;
          gap: 40px;
        }
      }
    </style>

    <div class="preview-container">
      <div class="action-buttons no-print">
        <button id="btnBackUsulan" class="btn-action btn-back">
          Kembali
        </button>
        <button id="btnPrint" class="btn-action btn-print">
          Cetak PDF
        </button>
      </div>

      <!-- HALAMAN 1: COVER PAGE -->
      <div class="pdf-preview">
        <div class="kop-surat">
          <img src="/assets/img/logo/logo_pnj.png" alt="Logo PNJ" onerror="this.style.display='none'"/>
          <div class="header-text">
            <h3>Kementerian Pendidikan Tinggi, Sains, dan Teknologi</h3>
            <h2>Politeknik Negeri Jakarta</h2>
            <p>Jalan Prof.DR.G.A.Siwabessy, Kampus UI, Depok 16425</p>
            <p>Telepon (021) 7270036, Hunting, Fax (021) 7270034</p>
            <p>Laman: http://www.pnj.ac.id • e-pos: humas@pnj.ac.id</p>
          </div>
        </div>

        <div class="doc-title">
          Kerangka Acuan Kerja Output<br/>
          Tahun Anggaran ${new Date().getFullYear()}
        </div>

        <table class="info-table">
          <tr>
            <td><strong>Program</strong></td>
            <td>:</td>
            <td>Program Pendidikan dan Pelatihan Vokasi</td>
          </tr>
          <tr>
            <td><strong>Kegiatan</strong></td>
            <td>:</td>
            <td>${data.namaKegiatan || "-"}</td>
          </tr>
          <tr>
            <td><strong>Output</strong></td>
            <td>:</td>
            <td>4467.DBA.001 Layanan Pendidikan (PNBP/BLU Vokasi)</td>
          </tr>
          <tr>
            <td><strong>Unit Kerja</strong></td>
            <td>:</td>
            <td>${data.unitKerja || "Himpunan Mahasiswa"}</td>
          </tr>
        </table>
      </div>

      <!-- HALAMAN 2: LEMBAR PENGESAHAN -->
      <div class="pdf-preview page-break">
        <div class="kop-surat">
          <img src="/assets/img/logo/logo_pnj.png" alt="Logo PNJ" onerror="this.style.display='none'"/>
          <div class="header-text">
            <h3>${(data.namaKegiatan || "Kegiatan").toUpperCase()}</h3>
            <h3>${(data.namaOrmawa || "Organisasi Mahasiswa").toUpperCase()}</h3>
            <h2>Politeknik Negeri Jakarta</h2>
            <p>Sekretariat: ${data.alamatSekretariat || "Politeknik Negeri Jakarta, Kampus Baru UI Depok 16425"}</p>
            <p>Telepon: ${data.telepon || "-"} | Email: ${data.email || "-"}</p>
          </div>
        </div>

        <div class="doc-title">Lembar Pengesahan KAK</div>

        <table class="info-table">
          <tr>
            <td colspan="3" class="section-header">No Urut di Pra</td>
          </tr>
          <tr>
            <td class="nested">Tanggal Input</td>
            <td>:</td>
            <td>${formatDate(new Date())}</td>
          </tr>
          <tr>
            <td class="nested">Tanggal Surat</td>
            <td>:</td>
            <td>${data.tanggalSurat ? formatDate(data.tanggalSurat) : "-"}</td>
          </tr>
          <tr>
            <td class="nested">Nomor Surat</td>
            <td>:</td>
            <td>${data.nomorSurat || "-"}</td>
          </tr>
          <tr>
            <td class="nested">Asal Surat</td>
            <td>:</td>
            <td>${data.asalSurat || "-"}</td>
          </tr>
          <tr>
            <td class="nested">Hal</td>
            <td>:</td>
            <td>${data.hal || "-"}</td>
          </tr>
        </table>

        <div style="margin-top: 30px;">
          <p style="font-size: 12px; font-weight: bold; margin-bottom: 10px;">Diteruskan kepada</p>
          <ol style="font-size: 11px; line-height: 1.8; margin-left: 20px;">
            <li>Kabag Keuangan dan Umum</li>
            <li>PPSPM</li>
            <li>Bendahara Pengeluaran</li>
          </ol>
        </div>

        <div style="margin-top: 30px;">
          <p style="font-size: 11px; line-height: 1.8;">
            <strong>Keterangan:</strong> Untuk
            <label style="margin-left: 15px;">
              <input type="checkbox" ${data.persetujuan === 'Setuju/ACC' ? 'checked' : ''} disabled> Setuju/ACC
            </label>
            <label style="margin-left: 15px;">
              <input type="checkbox" ${data.persetujuan === 'Tidak disetujui' ? 'checked' : ''} disabled> Tidak disetujui
            </label>
          </p>
          <p style="font-size: 11px; line-height: 1.8; margin-top: 10px;">
            Harap dilindaklanjuti sesuai dengan ketentuan yang berlaku. Terima kasih.
          </p>
        </div>

        <div style="margin-top: 30px;">
          <p style="font-size: 11px;">(${data.kodeKegiatan || "20000"})</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
          <div style="width: 45%;"></div>
          <div style="width: 45%; text-align: center;">
            <p style="font-size: 11px; margin-bottom: 5px;">Depok, ${formatMonthYear(new Date())}</p>
            <p style="font-size: 11px; font-weight: bold; margin-bottom: 70px;">Pejabat Pembuat Komitmen RM non Gaji dan Barang dan BLU</p>
            <p style="font-size: 11px; font-weight: bold; text-decoration: underline; margin-top: 10px;">(Nama PPK)</p>
            <p style="font-size: 11px;">NIP. (NIP PPK)</p>
          </div>
        </div>
      </div>

      <!-- HALAMAN 3: ISI KAK -->
      <div class="pdf-preview page-break">
        <div class="kop-surat">
          <img src="/assets/img/logo/logo_pnj.png" alt="Logo PNJ" onerror="this.style.display='none'"/>
          <div class="header-text">
            <h3>${(data.namaKegiatan || "Kegiatan").toUpperCase()}</h3>
            <h3>${(data.namaOrmawa || "Organisasi Mahasiswa").toUpperCase()}</h3>
            <h2>Politeknik Negeri Jakarta</h2>
            <p>Sekretariat: ${data.alamatSekretariat || "Politeknik Negeri Jakarta, Kampus Baru UI Depok 16425"}</p>
            <p>Telepon: ${data.telepon || "-"} | Email: ${data.email || "-"}</p>
          </div>
        </div>

        <div class="doc-title">
          Kerangka Acuan Kerja<br/>
          ${(data.namaKegiatan || "").toUpperCase()}<br/>
          TA ${new Date().getFullYear()}
        </div>

        <table class="info-table">
          <tr>
            <td>Kementerian Negara/Lembaga</td>
            <td>:</td>
            <td>Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi</td>
          </tr>
          <tr>
            <td>Unit Eselon II</td>
            <td>:</td>
            <td>Direktorat Jenderal Pendidikan Vokasi</td>
          </tr>
          <tr>
            <td>Satuan Kerja</td>
            <td>:</td>
            <td>Politeknik Negeri Jakarta</td>
          </tr>
          <tr>
            <td>Program</td>
            <td>:</td>
            <td>023.DL Program Pendidikan dan Pelatihan Vokasi</td>
          </tr>
          <tr>
            <td>Sasaran Program</td>
            <td>:</td>
            <td>Meningkatnya mutu dan relevansi lulusan pendidikan dan pelatihan vokasi sesuai dengan kebutuhan dunia kerja</td>
          </tr>
          <tr>
            <td>Indikator Kinerja Program</td>
            <td>:</td>
            <td>Mahasiswa yang mendapatkan layanan pendidikan tinggi vokasi</td>
          </tr>
          <tr>
            <td>Kegiatan</td>
            <td>:</td>
            <td>4467 Peningkatan Kualitas dan Kapasitas Perguruan Tinggi Vokasi</td>
          </tr>
          <tr>
            <td>Sasaran Kegiatan</td>
            <td>:</td>
            <td>Meningkatnya kualitas lulusan pendidikan tinggi vokasi</td>
          </tr>
          <tr>
            <td>Indikator Kinerja Kegiatan</td>
            <td>:</td>
            <td>Mahasiswa berkegiatan/meraih prestasi di luar program studi</td>
          </tr>
          <tr>
            <td>Indikator Kinerja Utama (IKU)</td>
            <td>:</td>
            <td>Persentase mahasiswa S1 dan D4/D3/D2/D1 yang meraih prestasi</td>
          </tr>
          <tr>
            <td>Klasifikasi Rincian Output (KRO)</td>
            <td>:</td>
            <td>(DBA) Pendidikan Tinggi</td>
          </tr>
          <tr>
            <td>Rincian Output (RO)</td>
            <td>:</td>
            <td>4467.DBA.001 Layanan Pendidikan (PNBP/BLU Vokasi)</td>
          </tr>
          <tr>
            <td>Volume RO</td>
            <td>:</td>
            <td>${data.jumlahPeserta || "-"} orang</td>
          </tr>
          <tr>
            <td>Satuan RO</td>
            <td>:</td>
            <td>Mahasiswa</td>
          </tr>
        </table>

        <div class="section">
          <div class="section-title">A. Latar Belakang</div>
          
          <div class="subsection-title">1. Dasar Hukum</div>
          <div class="content">
            <p>Dasar Hukum Tugas Fungsi/Kebijakan:</p>
            <ol type="a">
              <li>Undang-Undang Nomor 17 Tahun 2003 tentang Keuangan Negara;</li>
              <li>Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;</li>
              <li>Undang-Undang Nomor 12 Tahun 2012 tentang Pendidikan Tinggi;</li>
              <li>Peraturan Presiden Republik Indonesia Nomor 62 Tahun 2021 tentang Kementerian Pendidikan, Kebudayaan, Riset dan Teknologi;</li>
              <li>Peraturan Menteri Pendidikan dan Kebudayaan Nomor 3 Tahun 2020 tentang Standar Nasional Pendidikan Tinggi;</li>
            </ol>
          </div>

          <div class="subsection-title">2. Gambaran Umum</div>
          <div class="content">
            <p>${data.gambaranUmum || "Gambaran umum kegiatan belum diisi."}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">B. Penerima Manfaat</div>
          
          <div class="subsection-title">1. Sasaran Utama</div>
          <div class="content">
            ${formatArrayToList(data.sasaranUtama)}
          </div>

          <div class="subsection-title">2. Manfaat</div>
          <div class="content">
            ${formatArrayToList(data.manfaat)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">C. Strategi Pencapaian Keluaran</div>
          
          <div class="subsection-title">1. Metode Pelaksanaan</div>
          <div class="content">
            <p>${data.metodePelaksanaan || "Metode pelaksanaan belum diisi."}</p>
          </div>

          <div class="subsection-title">2. Tahapan</div>
          <div class="content">
            ${formatArrayToList(data.tahapanPelaksanaan)}
          </div>

          <div class="subsection-title">3. Waktu Pelaksanaan</div>
          <div class="content">
            ${generateTimelineTable(data.tahapanPelaksanaanKinerja)}
          </div>

          <div class="subsection-title">4. Indikator Kinerja</div>
          <div class="content">
            ${generateKpiTable(data.indikatorKinerja)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">D. Kurun Waktu Pelaksanaan</div>
          <div class="content">
            <p>Kegiatan ${data.namaKegiatan || "ini"} akan dilaksanakan dalam jangka waktu ${calculateDuration(data.tanggalMulai, data.tanggalSelesai)} dijadwalkan dari tanggal ${formatDate(data.tanggalMulai)} hingga tanggal ${formatDate(data.tanggalSelesai)}.</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">E. Biaya yang Diperlukan</div>
          <div class="content">
            <p>Biaya yang diperlukan untuk pelaksanaan kegiatan ini sebesar <strong>Rp ${data.biaya ? parseInt(data.biaya).toLocaleString('id-ID') : "-"}</strong>. Agar kegiatan ini dapat dilaksanakan dengan baik, maka rincian biaya kegiatan yang diperlukan kami lampirkan dalam lampiran proposal ini.</p>
          </div>
        </div>
      </div>

      <!-- HALAMAN 4: LAMPIRAN RAB -->
      <div class="pdf-preview page-break">
        <div class="kop-surat">
          <img src="/assets/img/logo/logo_pnj.png" alt="Logo PNJ" onerror="this.style.display='none'"/>
          <div class="header-text">
            <h3>${(data.namaKegiatan || "Kegiatan").toUpperCase()}</h3>
            <h3>${(data.namaOrmawa || "Organisasi Mahasiswa").toUpperCase()}</h3>
            <h2>Politeknik Negeri Jakarta</h2>
            <p>Sekretariat: ${data.alamatSekretariat || "Politeknik Negeri Jakarta, Kampus Baru UI Depok 16425"}</p>
            <p>Telepon: ${data.telepon || "-"} | Email: ${data.email || "-"}</p>
          </div>
        </div>

        <p style="font-size: 12px; margin: 20px 0 10px 0;">Lampiran 1 (Rencana Anggaran Biaya)</p>

        <div class="section-title" style="text-align: center; margin-bottom: 25px; font-size: 14px;">
          RENCANA ANGGARAN BIAYA
        </div>

        <div class="rab-info">
          <p>
            <span class="label">Kementrian Negara/Lembaga</span>
            <span class="colon">:</span>
            <span class="value">Kementerian Pendidikan, Kebudayaan, Riset, Teknologi</span>
          </p>
          <p>
            <span class="label">Bidang/Jurusan/Unit/PTN</span>
            <span class="colon">:</span>
            <span class="value">${data.bidangJurusan || "Rekayasa/Teknik Sipil/HMS/Politeknik Negeri Jakarta"}</span>
          </p>
          <p>
            <span class="label">Kegiatan</span>
            <span class="colon">:</span>
            <span class="value">${data.namaKegiatan || "-"}</span>
          </p>
          <p>
            <span class="label">Keluaran (Output)</span>
            <span class="colon">:</span>
            <span class="value">${data.outputKegiatan || data.namaKegiatan || "-"}</span>
          </p>
          <p>
            <span class="label">Volume</span>
            <span class="colon">:</span>
            <span class="value">${data.jumlahPeserta || "-"} orang</span>
          </p>
          <p>
            <span class="label">Satuan Ukur</span>
            <span class="colon">:</span>
            <span class="value">Mahasiswa</span>
          </p>
          <p>
            <span class="label">Alokasi Dana</span>
            <span class="colon">:</span>
            <span class="value">Rp ${data.biaya ? parseInt(data.biaya).toLocaleString('id-ID') : "-"}</span>
          </p>
        </div>

        ${generateRABTable(data.rab)}

        <div class="signature-grid" style="margin-top: 40px;">
          <div class="signature-box">
            <p>Mengetahui,</p>
            <p style="font-weight: 700;">Dosen Pembimbing</p>
            <div class="signature-space"></div>
            <p class="name">${data.namaPembimbing || "(Nama Pembimbing)"}</p>
            <p>NIP. ${data.nipPembimbing || "-"}</p>
          </div>

          <div class="signature-box">
            <p>Depok, ${formatDate(new Date())}</p>
            <p style="font-weight: 700;">Ketua Pelaksana</p>
            <div class="signature-space"></div>
            <p class="name">${data.namaKetua || data.pengusul || "(Nama Ketua Pelaksana)"}</p>
            <p>NIM. ${data.nimKetua || data.nim || "-"}</p>
          </div>
        </div>

        <div class="page-footer">
          <p><strong>${data.namaKegiatan || "KEGIATAN"}</strong></p>
          <p>${data.namaOrmawa || "ORGANISASI"} - POLITEKNIK NEGERI JAKARTA</p>
          <p>Sekretariat: ${data.alamatSekretariat || "Politeknik Negeri Jakarta"} | Telepon: ${data.telepon || "-"} | Email: ${data.email || "-"}</p>
        </div>
      </div>

      <div class="action-buttons no-print">
        <button id="btnBackUsulan2" class="btn-action btn-back">
          Kembali
        </button>
        <button id="btnPrint2" class="btn-action btn-print">
          Cetak PDF
        </button>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  // ===============================================
  // HELPER FUNCTIONS
  // ===============================================

  function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return "-";
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const finalDays = diffDays === 0 ? 1 : diffDays;
      const months = Math.floor(finalDays / 30);
      const days = finalDays % 30;
      
      if (months > 0) {
        return days > 0 ? `${months} bulan ${days} hari` : `${months} bulan`;
      }
      return `${finalDays} hari`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return "-";
    }
  }

  function formatDate(dateInput) {
    if (!dateInput) return "-";
    try {
      const date = (typeof dateInput === "string" || typeof dateInput === "number") ? new Date(dateInput) : dateInput;
      if (!date || isNaN(date.getTime())) return "-";
      const day = String(date.getDate()).padStart(2, '0');
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                     "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return "-";
    }
  }

  function formatMonthYear(dateInput) {
    if (!dateInput) return "-";
    try {
      const date = new Date(dateInput);
      if (!date || isNaN(date.getTime())) return "-";
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting month/year:', error);
      return "-";
    }
  }

  function formatArrayToList(arr) {
    if (!arr) return "<p>-</p>";
    if (!Array.isArray(arr)) {
      if (typeof arr === "object" && arr !== null) {
        if (arr.judul || arr.title) {
          return `<ul><li><strong>${arr.judul || arr.title}</strong>: ${arr.deskripsi || arr.text || ""}</li></ul>`;
        }
        return `<p>${String(arr)}</p>`;
      }
      return `<p>${String(arr)}</p>`;
    }
    if (arr.length === 0) return "<p>-</p>";
    
    if (typeof arr[0] === "string") {
      return `
        <ul style="margin-top: 8px; padding-left: 30px;">
          ${arr.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      `;
    }

    return `
      <ul style="margin-top: 8px; padding-left: 30px;">
        ${arr
          .map((item) => {
            const title = item.judul || item.title || "";
            const desc = item.deskripsi || item.text || "";
            if (title) return `<li><strong>${title}:</strong> ${desc}</li>`;
            return `<li>${desc || JSON.stringify(item)}</li>`;
          })
          .join("")}
      </ul>
    `;
  }

  function generateTimelineTable(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return "<p>-</p>";
    const rows = arr.map((item, idx) => {
      const no = item.no || (idx + 1);
      const kegiatan = item.kegiatan || item.title || item || "-";
      const mulai = item.mulai || item.start || item.tanggalMulai || "-";
      const selesai = item.selesai || item.end || item.tanggalSelesai || "-";
      return `<tr>
        <td>${no}</td>
        <td style="text-align: left;">${kegiatan}</td>
        <td style="width:120px;">${typeof mulai === 'string' && mulai !== '-' ? formatDate(mulai) : mulai}</td>
        <td style="width:120px;">${typeof selesai === 'string' && selesai !== '-' ? formatDate(selesai) : selesai}</td>
      </tr>`;
    }).join("");
    return `<table class="timeline-table">
      <thead>
        <tr>
          <th style="width:30px;">No</th>
          <th>Uraian Kegiatan</th>
          <th>Mulai</th>
          <th>Selesai</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function generateKpiTable(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return "<p>-</p>";
    const rows = arr.map((it, idx) => {
      const bulan = it.bulan || "-";
      const indikator = it.indikator || it.nama || it.title || "-";
      const target = it.target || it.nilai || "-";
      return `<tr>
        <td style="text-align: center;">${idx+1}</td>
        <td style="text-align: center;">${bulan}</td>
        <td style="text-align: left;">${indikator}</td>
        <td style="text-align: center;">${target}%</td>
      </tr>`;
    }).join("");
    return `<table class="timeline-table"> 
      <thead>
        <tr>
          <th style="width:5%;">No</th>
          <th style="width:15%;">Bulan</th>
          <th>Indikator Keberhasilan</th>
          <th style="width:15%;">Target</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function generateRABTable(rab) {
    if (!rab || (Array.isArray(rab) && rab.length === 0)) {
      return `<p style="font-size:11px; text-align: center; color: #666; margin: 20px 0;">Data RAB belum tersedia.</p>`;
    }

    // Table header - EXACT MATCH to image
    let html = `
      <table class="rab-table">
        <thead>
          <tr>
            <th rowspan="2">Uraian<br/>Suboutput/Komponen/Subkomponen/Detail</th>
            <th colspan="2">Volume</th>
            <th rowspan="2">Jenis<br/>Komponen<br/>(U/P)</th>
            <th rowspan="2">Rincian Perhitungan</th>
            <th rowspan="2">Harga<br/>Satuan</th>
            <th rowspan="2">Jumlah</th>
          </tr>
          <tr>
            <th>Sub Output</th>
          </tr>
        </thead>
        <tbody>
    `;

    let grandTotal = 0;
    let romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

    // Check if rab is array of categories or flat array
    if (Array.isArray(rab)) {
      // Check if first item has kategori property (categorized)
      if (rab.length > 0 && rab[0].kategori) {
        // Categorized RAB
        rab.forEach((category, catIdx) => {
          const categoryName = category.kategori || category.nama || `Kategori ${catIdx + 1}`;
          let categorySubtotal = 0;
          const romanNum = romanNumerals[catIdx] || (catIdx + 1);

          // Category header row - YELLOW
          html += `
            <tr class="category-header">
              <td colspan="7"><strong>${romanNum}. ${categoryName}</strong></td>
            </tr>
          `;

          // Category items
          const items = category.items || [];
          items.forEach((item) => {
            const namaItem = item.uraian || item.namaBarang || item.nama || "-";
            const volume = item.volume || item.jumlah || "";
            const satuan = item.satuan || "";
            const jenisKomponen = item.jenisKomponen || item.jenis || "";
            const rincian = item.rincian || `${volume} ${satuan} x 1 Paket x 1 Kali`;
            const jumlahRincian = item.jumlahRincian || volume || "";
            const hargaSatuan = Number(item.hargaSatuan || item.harga || 0);
            const jumlahHarga = hargaSatuan * (Number(volume) || 1);
            
            categorySubtotal += jumlahHarga;

            html += `
              <tr class="item-row">
                <td style="text-align: left;">${namaItem}</td>
                <td>${volume || ""}</td>
                <td>${satuan || ""}</td>
                <td>${jenisKomponen}</td>
                <td style="text-align: left;">${rincian}</td>
                <td>Rp${hargaSatuan.toLocaleString('id-ID')}</td>
                <td>Rp${jumlahHarga.toLocaleString('id-ID')}</td>
              </tr>
            `;
          });

          // Subtotal row
          html += `
            <tr class="subtotal">
              <td colspan="6" style="text-align: right; padding-right: 15px;">subtotal</td>
              <td>Rp${categorySubtotal.toLocaleString('id-ID')}</td>
            </tr>
          `;

          grandTotal += categorySubtotal;
        });

      } else {
        // Flat array RAB (no categories)
        rab.forEach((item) => {
          const namaItem = item.uraian || item.namaBarang || item.nama || "-";
          const volume = item.volume || item.jumlah || "";
          const satuan = item.satuan || "";
          const jenisKomponen = item.jenisKomponen || item.jenis || "";
          const rincian = item.rincian || `${volume} ${satuan} x 1 Paket x 1 Kali`;
          const hargaSatuan = Number(item.hargaSatuan || item.harga || 0);
          const jumlahHarga = hargaSatuan * (Number(volume) || 1);
          
          grandTotal += jumlahHarga;

          html += `
            <tr class="item-row">
              <td style="text-align: left;">${namaItem}</td>
              <td>${volume || ""}</td>
              <td>${satuan || ""}</td>
              <td>${jenisKomponen}</td>
              <td style="text-align: left;">${rincian}</td>
              <td>Rp${hargaSatuan.toLocaleString('id-ID')}</td>
              <td>Rp${jumlahHarga.toLocaleString('id-ID')}</td>
            </tr>
          `;
        });
      }
    }

    // Total row - YELLOW
    html += `
          <tr class="total">
            <td colspan="6">JUMLAH</td>
            <td><strong>Rp${grandTotal.toLocaleString('id-ID')}</strong></td>
          </tr>
        </tbody>
      </table>
    `;

    return html;
  }

  // ===============================================
  // EVENT LISTENERS
  // ===============================================
  setTimeout(() => {
    const handleBack = () => window.history.back();
    const handlePrint = () => window.print();

    const btnBack1 = document.getElementById("btnBackUsulan");
    const btnPrint1 = document.getElementById("btnPrint");
    const btnBack2 = document.getElementById("btnBackUsulan2");
    const btnPrint2 = document.getElementById("btnPrint2");

    if (btnBack1) btnBack1.addEventListener("click", handleBack);
    if (btnPrint1) btnPrint1.addEventListener("click", handlePrint);
    if (btnBack2) btnBack2.addEventListener("click", handleBack);
    if (btnPrint2) btnPrint2.addEventListener("click", handlePrint);
  }, 300);
}