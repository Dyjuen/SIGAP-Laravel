<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kerangka Acuan Kerja (KAK) - {{ $kak->nama_kegiatan }}</title>
<style>
    /* Margin halaman: 2.5cm kiri-kanan, 2cm atas-bawah */
    @page {
        margin: 2cm 2.5cm;
    }
    
    body {
        font-family: 'Times New Roman', Times, serif;
        color: #000;
        background: #fff;
    }
    
    /* Cover Page Styles */
    .cover-page {
        text-align: center;
        page-break-after: always;
        padding-top: 100px;
    }
    .cover-logo {
        width: 350px;
        height: auto;
        margin: 0 auto 40px;
    }
    .cover-title {
        font-size: 20pt;
        font-weight: bold;
        text-transform: uppercase;
        margin: 0 0 8px 0;
        letter-spacing: 1.5px;
        line-height: 1.3;
    }
    .cover-subtitle {
        font-size: 18pt;
        font-weight: bold;
        text-transform: uppercase;
        margin: 0 0 50px 0;
        letter-spacing: 1px;
        line-height: 1.3;
    }
    .cover-activity-section {
        margin: 0 0 35px 0;
        line-height: 1.5;
    }
    .cover-activity-label {
        font-size: 14pt;
        font-weight: bold;
        margin-bottom: 12px;
    }
    .cover-activity-name {
        font-size: 14pt;
        font-weight: normal;
        margin: 0 60px;
        line-height: 1.6;
    }
    .cover-unit-section {
        margin: 0 0 50px 0;
    }
    .cover-unit-label {
        font-size: 14pt;
        font-weight: bold;
        margin-bottom: 12px;
    }
    .cover-unit-name {
        font-size: 15pt;
        font-weight: bold;
        margin: 0;
        line-height: 1.4;
    }
    .cover-footer {
        margin-top: 60px;
    }
    .cover-footer p {
        font-size: 13pt;
        font-weight: normal;
        margin: 8px 0;
        line-height: 1.5;
    }
    .cover-footer .year {
        font-size: 15pt;
        font-weight: bold;
        margin-top: 15px;
    }

    /* Setiap judul section (I, II, III, dst): spaceBefore=14, spaceAfter=6, fontSize=11, bold */
    .section-title {
        margin-top: 14pt;
        margin-bottom: 6pt;
        font-size: 11pt;
        font-weight: bold;
        color: #000;
        font-family: 'Times New Roman', Times, serif;
    }

    /* Sub-judul (contoh: "1. Sasaran Utama"): spaceBefore=8, spaceAfter=4, fontSize=10, bold */
    .sub-title {
        margin-top: 8pt;
        margin-bottom: 4pt;
        font-size: 10pt;
        font-weight: bold;
        font-family: 'Times New Roman', Times, serif;
    }

    /* Paragraf body: spaceAfter=4, leading=14, fontSize=10 */
    .content-text, p, td {
        margin-top: 0;
        margin-bottom: 4pt;
        line-height: 14pt;
        font-size: 10pt;
        font-family: 'Times New Roman', Times, serif;
    }
    
    /* Justify text where needed */
    .text-justify {
        text-align: justify;
    }

    /* Bullet/list item: leftIndent=20, spaceAfter=3, leading=14 */
    ul, ol {
        margin: 0;
        padding-left: 20pt;
    }
    li {
        margin-bottom: 3pt;
        line-height: 14pt;
        text-align: justify;
        font-size: 10pt;
        font-family: 'Times New Roman', Times, serif;
    }

    /* Antar section beri Spacer(1, 10) */
    .section-spacer {
        height: 10pt;
        display: block;
        width: 100%;
        clear: both;
    }

    /* Tabel: topPadding & bottomPadding tiap cell = 5, leftPadding & rightPadding = 4 */
    table.data-table {
        width: 100%;
        border-collapse: collapse;
    }
    table.data-table th, table.data-table td {
        border: 1px solid #000;
        padding: 5pt 4pt;
        font-size: 10pt;
        font-family: 'Times New Roman', Times, serif;
    }
    
    /* Info table (no borders) */
    table.info-table {
        width: 100%;
        border: none;
        border-collapse: collapse;
    }
    table.info-table td {
        border: none;
        padding: 2pt 0; /* Minimal padding for info table */
        vertical-align: top;
        font-size: 10pt;
    }
    
    /* Gunakan KeepTogether untuk membungkus setiap section/bab (dompdf equivalent: page-break-inside: avoid) */
    .section-container {
        page-break-inside: avoid;
    }
    
    * {
        font-family: 'Times New Roman', Times, serif !important;
    }
</style>
</head>
<body>
    <!-- COVER PAGE -->
    <div class="cover-page">
        <!-- Logo PNJ -->
        @php 
        $finalLogoPath = public_path('images/logo.png');
        if (!file_exists($finalLogoPath)) {
            $finalLogoPath = public_path('assets/img/logo/logo_pnj.png');
        }
        
        $imageSrc = '';
        if ($finalLogoPath && file_exists($finalLogoPath)) {
            $imageData = base64_encode(file_get_contents($finalLogoPath));
            $imageSrc = 'data:image/png;base64,' . $imageData;
        }
        @endphp
        
        @if ($imageSrc)
            <img src="{{ $imageSrc }}" alt="Logo PNJ" class="cover-logo" />
        @else
            <div style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 40px;">POLITEKNIK NEGERI JAKARTA</div>
        @endif
        
        <div class="cover-title">KERANGKA ACUAN KERJA</div>
        <div class="cover-subtitle">TAHUN ANGGARAN {{ \Carbon\Carbon::parse($kak->tanggal_mulai)->format('Y') }}</div>
        
        <div class="cover-activity-section">
            <div class="cover-activity-label">Kegiatan :</div>
            <div class="cover-activity-name">{{ $kak->nama_kegiatan }}</div>
        </div>
        
        <div class="cover-unit-section">
            <div class="cover-unit-label">Unit Kerja:</div>
            <div class="cover-unit-name">{{ $kak->pengusul->nama_lengkap ?? '-' }}</div>
        </div>
        
        <div class="cover-footer">
            <p>Politeknik Negeri Jakarta</p>
            <p class="year">Tahun {{ \Carbon\Carbon::parse($kak->tanggal_mulai)->format('Y') }}</p>
        </div>
    </div>

    <!-- ISI DOKUMEN -->
    <div class="text-justify">

    <!-- I. INFORMASI UMUM KEGIATAN -->
    <div class="section-container">
        <div class="section-title">I. INFORMASI UMUM KEGIATAN</div>
        
        <table class="info-table">
            <tr>
                <td style="width: 150pt;">Nama Kegiatan</td>
                <td style="width: 15pt;">:</td>
                <td>{{ $kak->nama_kegiatan }}</td>
            </tr>
            <tr>
                <td>Tipe Kegiatan</td>
                <td>:</td>
                <td>{{ $kak->tipeKegiatan->nama_tipe ?? '-' }}</td>
            </tr>
            <tr>
                <td>Pengusul</td>
                <td>:</td>
                <td>{{ $kak->pengusul->nama_lengkap ?? '-' }}</td>
            </tr>
            <tr>
                <td>Tanggal Pelaksanaan</td>
                <td>:</td>
                <td>{{ $kak->tanggal_mulai ? \Carbon\Carbon::parse($kak->tanggal_mulai)->format('d F Y') : '-' }} s/d {{ $kak->tanggal_selesai ? \Carbon\Carbon::parse($kak->tanggal_selesai)->format('d F Y') : '-' }}</td>
            </tr>
            <tr>
                <td>Lokasi</td>
                <td>:</td>
                <td>{{ $kak->lokasi ?: '-' }}</td>
            </tr>
            <tr>
                <td>Sumber Dana</td>
                <td>:</td>
                <td>{{ $kak->mataAnggaran->nama_sumber_dana ?? '-' }} ({{ $kak->mataAnggaran->kode_anggaran ?? '-' }})</td>
            </tr>
        </table>
    </div>

    <div class="section-spacer"></div>

    <!-- II. GAMBARAN UMUM KEGIATAN -->
    <div class="section-container">
        <div class="section-title">II. GAMBARAN UMUM KEGIATAN</div>
        <div class="content-text text-justify">
            {!! nl2br(e($kak->gambaran_umum ?? $kak->deskripsi_kegiatan ?? 'Tidak ada deskripsi')) !!}
        </div>
    </div>

    <div class="section-spacer"></div>

    <!-- III. PENERIMA MANFAAT -->
    @if ($kak->sasaran_utama || $kak->manfaat->count() > 0)
    <div class="section-container">
        <div class="section-title">III. PENERIMA MANFAAT</div>
        
        @if ($kak->sasaran_utama)
        <div class="sub-title">1. Sasaran Utama</div>
        <div class="content-text text-justify" style="margin-left: 20pt;">
            {!! nl2br(e($kak->sasaran_utama)) !!}
        </div>
        @endif
        
        @if ($kak->manfaat->count() > 0)
        <div class="sub-title">2. Manfaat Kegiatan</div>
        <div class="content-text text-justify" style="margin-left: 20pt;">
            Manfaat yang didapatkan setelah mengikuti kegiatan ini, yaitu:
        </div>
        <ol style="list-style-type: lower-alpha; margin-left: 20pt;">
            @foreach ($kak->manfaat as $index => $manfaatItem)
            <li>{{ $manfaatItem->manfaat }}</li>
            @endforeach
        </ol>
        @endif
    </div>
    <div class="section-spacer"></div>
    @endif

    <!-- IV. STRATEGI PENCAPAIAN -->
    <div class="section-container">
        <div class="section-title">IV. STRATEGI PENCAPAIAN</div>
        
        @if ($kak->metode_pelaksanaan)
        <div class="sub-title">Metode Pelaksanaan:</div>
        <div class="content-text text-justify">
            {!! nl2br(e($kak->metode_pelaksanaan)) !!}
        </div>
        @endif
        
        @if ($kak->tahapan->count() > 0)
        <div class="sub-title">Tahapan Pelaksanaan:</div>
        <ol>
            @foreach ($kak->tahapan as $tahapan)
            <li>{{ $tahapan->nama_tahapan }}</li>
            @endforeach
        </ol>
        @endif
    </div>

    <div class="section-spacer"></div>

    <!-- V. INDIKATOR KINERJA / TARGET KEBERHASILAN -->
    @if ($kak->targets->count() > 0)
    <div class="section-container">
        <div class="section-title">V. INDIKATOR KINERJA / TARGET KEBERHASILAN</div>
        <table class="data-table">
            <thead>
                <tr style="background-color: #e8e8e8;">
                    <th style="text-align: center; width: 5%;">No</th>
                    <th style="text-align: center; width: 20%;">Bulan</th>
                    <th style="text-align: center; width: 60%;">Indikator Keberhasilan</th>
                    <th style="text-align: center; width: 15%;">Target (%)</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($kak->targets as $index => $target)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td style="text-align: center;">{{ $target->bulan_indikator }}</td>
                    <td>{{ $target->deskripsi_target }}</td>
                    <td style="text-align: center;">{{ number_format($target->persentase_target, 0) }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    <div class="section-spacer"></div>
    @endif

    <!-- VI. RINCIAN ANGGARAN BIAYA (RAB) -->
    <div class="section-container">
        <div class="section-title">VI. RINCIAN ANGGARAN BIAYA (RAB)</div>
        
        @if ($kak->anggaran->count() > 0)
        <table class="data-table">
            <thead>
                <tr style="background-color: #e8e8e8;">
                    <th style="text-align: center; width: 4%;">No</th>
                    <th style="text-align: center; width: 18%;">Uraian</th>
                    <th style="text-align: center; width: 6%;">Vol 1</th>
                    <th style="text-align: center; width: 7%;">Sat 1</th>
                    <th style="text-align: center; width: 6%;">Vol 2</th>
                    <th style="text-align: center; width: 7%;">Sat 2</th>
                    <th style="text-align: center; width: 6%;">Vol 3</th>
                    <th style="text-align: center; width: 7%;">Sat 3</th>
                    <th style="text-align: center; width: 18%;">Harga Satuan (Rp)</th>
                    <th style="text-align: center; width: 21%;">Jumlah (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @php 
                $no = 1;
                $totalDiusulkan = 0;
                $groupedAnggaran = $kak->anggaran->groupBy('kategori_belanja_id');
                @endphp
                
                @foreach ($groupedAnggaran as $kategoriId => $items)
                    @php
                        $kategoriName = $items->first()->kategoriBelanja->nama_kategori ?? 'Lain-lain';
                        $subtotalKategori = 0;
                    @endphp
                    
                    <tr style="background-color: #d0d0d0;">
                        <td colspan="10" style="font-weight: bold;">
                            {{ $kategoriName }}
                        </td>
                    </tr>
                    
                    @foreach ($items as $item)
                        @php
                            $volume = ($item->volume1 ?: 1) * ($item->volume2 ?: 1) * ($item->volume3 ?: 1);
                            $jumlah = $volume * $item->harga_satuan;
                            $totalDiusulkan += $jumlah;
                            $subtotalKategori += $jumlah;
                        @endphp
                        <tr>
                            <td style="text-align: center;">{{ $no++ }}</td>
                            <td>{{ $item->uraian }}</td>
                            <td style="text-align: center;">{{ number_format($item->volume1, 0, ',', '.') }}</td>
                            <td style="text-align: center;">{{ $item->satuan1->nama_satuan ?? '-' }}</td>
                            <td style="text-align: center;">{{ $item->volume2 ? number_format($item->volume2, 0, ',', '.') : '-' }}</td>
                            <td style="text-align: center;">{{ $item->satuan2->nama_satuan ?? '-' }}</td>
                            <td style="text-align: center;">{{ $item->volume3 ? number_format($item->volume3, 0, ',', '.') : '-' }}</td>
                            <td style="text-align: center;">{{ $item->satuan3->nama_satuan ?? '-' }}</td>
                            <td style="text-align: right;">{{ number_format($item->harga_satuan, 0, ',', '.') }}</td>
                            <td style="text-align: right;">{{ number_format($jumlah, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                    
                    <tr style="background-color: #f5f5f5;">
                        <td colspan="9" style="text-align: right; font-weight: bold;">
                            Subtotal {{ $kategoriName }}
                        </td>
                        <td style="text-align: right; font-weight: bold;">
                            {{ number_format($subtotalKategori, 0, ',', '.') }}
                        </td>
                    </tr>
                @endforeach
                
                <tr style="background-color: #e8e8e8;">
                    <td colspan="9" style="text-align: right; font-weight: bold;">TOTAL ANGGARAN DIUSULKAN</td>
                    <td style="text-align: right; font-weight: bold;">{{ number_format($totalDiusulkan, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
        @else
        <div class="content-text" style="font-style: italic; color: #666;">Belum ada rincian anggaran biaya.</div>
        @endif
    </div>

    <div class="section-spacer"></div>

    <!-- VII. INDIKATOR KINERJA UTAMA (IKU) -->
    @if ($kak->ikus->count() > 0)
    <div class="section-container">
        <div class="section-title">VII. KETERKAITAN DENGAN INDIKATOR KINERJA UTAMA (IKU)</div>
        <table class="data-table">
            <thead>
                <tr style="background-color: #e8e8e8;">
                    <th style="text-align: center; width: 5%;">No</th>
                    <th style="text-align: center; width: 15%;">Kode IKU</th>
                    <th style="text-align: center; width: 60%;">Nama IKU</th>
                    <th style="text-align: center; width: 20%;">Target</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($kak->ikus as $index => $ikuItem)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td style="text-align: center;">{{ $ikuItem->iku->kode_iku ?? '-' }}</td>
                    <td>{{ $ikuItem->iku->nama_iku ?? '-' }}</td>
                    <td style="text-align: center;">{{ number_format($ikuItem->target, 0, ',', '.') }} {{ $ikuItem->satuan->nama_satuan ?? '' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- PENGESAHAN -->
    <div style="page-break-before: always; padding-top: 60px;">
        <div style="text-align: left; margin-bottom: 40px; margin-left: 40px;" class="content-text">
            Depok, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}
        </div>
        
        <table style="width: 100%; border: none; margin-top: 50px;" cellpadding="0" cellspacing="0">
            <tr>
                <td style="width: 40%; border: none; vertical-align: top; text-align: center;">
                    <strong style="font-size: 11pt;">Mengetahui,</strong><br>
                    <strong style="font-size: 11pt;">Kepala Bagian</strong><br>
                    <div style="height: 80pt;"></div>
                    <div style="border-bottom: 1px solid #000; width: 150px; display: inline-block;"></div>
                    <br>
                    <strong style="font-size: 11pt;">(...........................)</strong>
                </td>
                <td style="width: 20%; border: none;"></td>
                <td style="width: 40%; border: none; vertical-align: top; text-align: center;">
                    <strong style="font-size: 11pt;">Pengusul Kegiatan,</strong><br>
                    <div style="height: 80pt;"></div>
                    <div style="border-bottom: 1px solid #000; width: 150px; display: inline-block;"></div>
                    <br>
                    <strong style="font-size: 11pt;">{{ $kak->pengusul->nama_lengkap ?? '-' }}</strong>
                </td>
            </tr>
        </table>
    </div>

    </div> <!-- END JUSTIFY WRAPPER -->
</body>
</html>
