import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_theme.dart';
import '../../models/dashboard_model.dart';

/// Bottom sheet untuk detail audit TOPSIS satu kegiatan.
/// Menampilkan detail perhitungan TOPSIS dalam 4-tab interaktif.
class TopsisDetailBottomSheet extends StatelessWidget {
  final TopsisActivity activity;

  const TopsisDetailBottomSheet({super.key, required this.activity});

  String _fmtRp(double? val) {
    if (val == null) return '—';
    return 'Rp ${val.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    )}';
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Handle bar
            const SizedBox(height: 12),
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Title section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.analytics_rounded, color: AppTheme.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Detail Perhitungan TOPSIS', style: AppTheme.heading.copyWith(fontSize: 18)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    activity.namaKegiatan,
                    style: AppTheme.bodyBold.copyWith(fontSize: 13, color: AppTheme.textPrimary),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text('Unit/Jurusan: ${activity.jurusan}', style: AppTheme.caption),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // TabBar selector
            TabBar(
              labelColor: AppTheme.primary,
              unselectedLabelColor: AppTheme.textSecondary,
              indicatorColor: AppTheme.primary,
              indicatorSize: TabBarIndicatorSize.tab,
              labelStyle: AppTheme.label.copyWith(fontSize: 10, fontWeight: FontWeight.w800),
              unselectedLabelStyle: AppTheme.label.copyWith(fontSize: 10, fontWeight: FontWeight.w600),
              tabs: const [
                Tab(icon: Icon(Icons.calculate_rounded, size: 18), text: 'Nilai Kriteria'),
                Tab(icon: Icon(Icons.bar_chart_rounded, size: 18), text: 'Normalisasi'),
                Tab(icon: Icon(Icons.gps_fixed_rounded, size: 18), text: 'Solusi Ideal'),
                Tab(icon: Icon(Icons.military_tech_rounded, size: 18), text: 'Skor Akhir'),
              ],
            ),

            // TabBarView content
            Expanded(
              child: Container(
                color: AppTheme.background,
                child: TabBarView(
                  children: [
                    _buildTabRaw(),
                    _buildTabNormalisasi(),
                    _buildTabSolusiIdeal(),
                    _buildTabSkorAkhir(),
                  ],
                ),
              ),
            ),

            // Tutup Button
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 20),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('Tutup', style: AppTheme.bodyBold.copyWith(color: Colors.white)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabRaw() {
    final c1d = activity.c1Debug;
    final c2d = activity.c2Debug;
    final c3d = activity.c3Debug;
    final c4d = activity.c4Debug;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Nilai Mentah Kriteria',
          style: AppTheme.subheading.copyWith(fontSize: 14),
        ),
        const SizedBox(height: 4),
        Text(
          'Nilai mentah dari database sebelum dikonversikan ke dalam matriks keputusan.',
          style: AppTheme.caption,
        ),
        const SizedBox(height: 16),

        // C1 Waktu
        _buildRawCard(
          title: 'C1 – Kesesuaian Waktu',
          score: activity.c1,
          icon: Icons.schedule_rounded,
          color: Colors.blue,
          children: c1d['source'] == 'calculated'
              ? [
                  _rawInfoRow('Tgl Rencana', '${c1d['tgl_mulai_rencana'] ?? '—'} s/d ${c1d['tgl_selesai_rencana'] ?? '—'}'),
                  _rawInfoRow('Durasi Rencana', '${c1d['durasi_rencana'] ?? '—'} hari'),
                  _rawInfoRow('Tgl Aktual/LPJ', '${c1d['tgl_mulai_aktual'] ?? '—'} s/d ${c1d['tgl_selesai_aktual'] ?? '—'}'),
                  _rawInfoRow('Durasi Aktual', '${c1d['durasi_aktual'] ?? '—'} hari'),
                  _rawInfoRow('Deviasi Durasi', '${c1d['deviasi_persen'] ?? '0'}%', highlight: true),
                  _buildFormulaRow('max(50, 100 - ${c1d['deviasi_persen'] ?? 0}%) = ${activity.c1.toStringAsFixed(0)}'),
                ]
              : [
                  _rawInfoRow('Sumber Data', 'Data diinput langsung oleh Administrator'),
                  _buildFormulaRow('C1 Stored = ${activity.c1.toStringAsFixed(0)}'),
                ],
        ),
        const SizedBox(height: 12),

        // C2 Anggaran
        _buildRawCard(
          title: 'C2 – Ketepatan Anggaran',
          score: activity.c2,
          icon: Icons.account_balance_wallet_rounded,
          color: Colors.purple,
          children: c2d['source'] == 'calculated'
              ? [
                  _rawInfoRow('RAB Diajukan', _fmtRp((c2d['anggaran_rencana'] as num?)?.toDouble())),
                  _rawInfoRow('Realisasi Dana', _fmtRp((c2d['anggaran_aktual'] as num?)?.toDouble())),
                  _rawInfoRow('Deviasi Anggaran', '${c2d['deviasi_persen'] ?? '0'}%', highlight: true),
                  _buildFormulaRow('max(50, 100 - ${c2d['deviasi_persen'] ?? 0}%) = ${activity.c2.toStringAsFixed(0)}'),
                ]
              : [
                  _rawInfoRow('Sumber Data', 'Data diinput langsung oleh Administrator'),
                  _buildFormulaRow('C2 Stored = ${activity.c2.toStringAsFixed(0)}'),
                ],
        ),
        const SizedBox(height: 12),

        // C3 Output (IKU)
        _buildRawCard(
          title: 'C3 – Kesesuaian Output',
          score: activity.c3,
          icon: Icons.task_alt_rounded,
          color: Colors.teal,
          children: c3d['source'] == 'calculated'
              ? [
                  _rawInfoRow('Total Target IKU', '${c3d['total_iku'] ?? 0}'),
                  _rawInfoRow('IKU Terpenuhi', '${c3d['terpenuhi'] ?? 0}', highlight: true),
                  _rawInfoRow('Persentase Pemenuhan', '${c3d['persentase'] ?? 0}%'),
                  _buildFormulaRow('floor(${c3d['terpenuhi'] ?? 0} / ${c3d['total_iku'] ?? 1} * 100) = ${activity.c3.toStringAsFixed(0)}'),
                ]
              : [
                  _rawInfoRow('Sumber Data', 'Data diinput langsung oleh Administrator'),
                  _buildFormulaRow('C3 Stored = ${activity.c3.toStringAsFixed(0)}'),
                ],
        ),
        const SizedBox(height: 12),

        // C4 LPJ
        _buildRawCard(
          title: 'C4 – Kepatuhan LPJ',
          score: activity.c4,
          icon: Icons.description_rounded,
          color: Colors.orange,
          children: c4d['source'] == 'calculated'
              ? [
                  _rawInfoRow('Waktu di Bendahara', '${c4d['hari_di_lpj'] ?? '—'} hari'),
                  _rawInfoRow('Keterlambatan (Batas 14 hari)', '${c4d['hari_terlambat'] ?? 0} hari', highlight: (c4d['hari_terlambat'] ?? 0) > 0),
                  _buildFormulaRow('max(50, 100 - ${c4d['hari_terlambat'] ?? 0}) = ${activity.c4.toStringAsFixed(0)}'),
                ]
              : [
                  _rawInfoRow('Sumber Data', 'Data diinput langsung oleh Administrator'),
                  _buildFormulaRow('C4 Stored = ${activity.c4.toStringAsFixed(0)}'),
                ],
        ),
      ],
    );
  }

  Widget _buildRawCard({
    required String title,
    required double score,
    required IconData icon,
    required Color color,
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      clipBehavior: Clip.hardEdge,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: color.withOpacity(0.05),
            child: Row(
              children: [
                Icon(icon, color: color, size: 18),
                const SizedBox(width: 8),
                Text(title, style: AppTheme.bodyBold.copyWith(fontSize: 13, color: color)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    score.toStringAsFixed(0),
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: children,
            ),
          ),
        ],
      ),
    );
  }

  Widget _rawInfoRow(String label, String value, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTheme.caption),
          Text(
            value,
            style: AppTheme.caption.copyWith(
              fontWeight: highlight ? FontWeight.w800 : FontWeight.w600,
              color: highlight ? AppTheme.primary : AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormulaRow(String formula) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(8),
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          const Icon(Icons.functions_rounded, size: 14, color: AppTheme.textSecondary),
          const SizedBox(width: 6),
          Text(
            'Rumus: ',
            style: AppTheme.caption.copyWith(fontSize: 10, fontWeight: FontWeight.w700),
          ),
          Expanded(
            child: Text(
              formula,
              style: GoogleFonts.firaCode(
                fontSize: 9,
                fontWeight: FontWeight.w500,
                color: AppTheme.primary,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabNormalisasi() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Normalisasi & Pembobotan',
          style: AppTheme.subheading.copyWith(fontSize: 14),
        ),
        const SizedBox(height: 4),
        Text(
          'Normalisasi membagi nilai kriteria dengan akar jumlah kuadrat kriteria alternatif (Euclidean Norm), kemudian dikalikan dengan bobot kriteria w.',
          style: AppTheme.caption,
        ),
        const SizedBox(height: 16),

        // Formula visual card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Formula Normalisasi', style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    'r_ij = c_ij / √Σ(c_kj²)',
                    style: GoogleFonts.firaCode(fontSize: 11, color: AppTheme.primary, fontWeight: FontWeight.w600),
                  ),
                  const Spacer(),
                  Text(
                    'v_ij = r_ij × w_j',
                    style: GoogleFonts.firaCode(fontSize: 11, color: AppTheme.primary, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Scrollable Table Container
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          clipBehavior: Clip.hardEdge,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columnSpacing: 16,
              headingRowHeight: 40,
              dataRowMinHeight: 40,
              dataRowMaxHeight: 48,
              headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
              columns: const [
                DataColumn(label: Text('Kriteria', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                DataColumn(label: Text('c_ij', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                DataColumn(label: Text('Pembagi', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                DataColumn(label: Text('r_ij', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                DataColumn(label: Text('w_j', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                DataColumn(label: Text('v_ij (Bobot)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primary))),
              ],
              rows: [
                _normRow('C1 Waktu', activity.c1, activity.normC1, activity.r1, activity.w1, activity.v1),
                _normRow('C2 Anggaran', activity.c2, activity.normC2, activity.r2, activity.w2, activity.v2),
                _normRow('C3 Output', activity.c3, activity.normC3, activity.r3, activity.w3, activity.v3),
                _normRow('C4 LPJ', activity.c4, activity.normC4, activity.r4, activity.w4, activity.v4),
              ],
            ),
          ),
        ),
      ],
    );
  }

  DataRow _normRow(String kriteria, double c, double pembagi, double r, double w, double v) {
    return DataRow(
      cells: [
        DataCell(Text(kriteria, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
        DataCell(Text(c.toStringAsFixed(0), style: const TextStyle(fontSize: 11))),
        DataCell(Text(pembagi.toStringAsFixed(4), style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary))),
        DataCell(Text(r.toStringAsFixed(6), style: const TextStyle(fontSize: 11))),
        DataCell(Text('${w.toStringAsFixed(0)}%', style: const TextStyle(fontSize: 11))),
        DataCell(Text(
          v.toStringAsFixed(6),
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primary),
        )),
      ],
    );
  }

  Widget _buildTabSolusiIdeal() {
    final idealPos = activity.idealPos;
    final idealNeg = activity.idealNeg;

    final double pos1 = (idealPos['v1'] as num?)?.toDouble() ?? 0.0;
    final double pos2 = (idealPos['v2'] as num?)?.toDouble() ?? 0.0;
    final double pos3 = (idealPos['v3'] as num?)?.toDouble() ?? 0.0;
    final double pos4 = (idealPos['v4'] as num?)?.toDouble() ?? 0.0;

    final double neg1 = (idealNeg['v1'] as num?)?.toDouble() ?? 0.0;
    final double neg2 = (idealNeg['v2'] as num?)?.toDouble() ?? 0.0;
    final double neg3 = (idealNeg['v3'] as num?)?.toDouble() ?? 0.0;
    final double neg4 = (idealNeg['v4'] as num?)?.toDouble() ?? 0.0;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Solusi Ideal Positif & Negatif',
          style: AppTheme.subheading.copyWith(fontSize: 14),
        ),
        const SizedBox(height: 4),
        Text(
          'A+ adalah nilai tertinggi per kriteria di antara alternatif. A- adalah nilai terendah. Jarak alternatif ke A+ dan A- dihitung dengan rumus Euclidean Distance.',
          style: AppTheme.caption,
        ),
        const SizedBox(height: 16),

        // Scrollable Table Container
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          clipBehavior: Clip.hardEdge,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columnSpacing: 16,
              headingRowHeight: 40,
              dataRowMinHeight: 40,
              dataRowMaxHeight: 48,
              headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
              columns: const [
                DataColumn(label: Text('Kriteria', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                DataColumn(label: Text('v_ij (Bobot)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                DataColumn(label: Text('A⁺ (Terbaik)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.success))),
                DataColumn(label: Text('A⁻ (Terburuk)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.danger))),
                DataColumn(label: Text('(v_ij - A⁺)²', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                DataColumn(label: Text('(v_ij - A⁻)²', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
              ],
              rows: [
                _idealRow('C1 Waktu', activity.v1, pos1, neg1),
                _idealRow('C2 Anggaran', activity.v2, pos2, neg2),
                _idealRow('C3 Output', activity.v3, pos3, neg3),
                _idealRow('C4 LPJ', activity.v4, pos4, neg4),
              ],
            ),
          ),
        ),
      ],
    );
  }

  DataRow _idealRow(String kriteria, double v, double aPos, double aNeg) {
    final dPos2 = (v - aPos) * (v - aPos);
    final dNeg2 = (v - aNeg) * (v - aNeg);
    return DataRow(
      cells: [
        DataCell(Text(kriteria, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
        DataCell(Text(v.toStringAsFixed(6), style: const TextStyle(fontSize: 11))),
        DataCell(Text(aPos.toStringAsFixed(6), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.success))),
        DataCell(Text(aNeg.toStringAsFixed(6), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.danger))),
        DataCell(Text(dPos2.toStringAsFixed(8), style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary))),
        DataCell(Text(dNeg2.toStringAsFixed(8), style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary))),
      ],
    );
  }

  Widget _buildTabSkorAkhir() {
    Color badgeColor;
    Color badgeBg;
    String badgeText;

    switch (activity.kategori) {
      case 'Sangat Baik':
        badgeColor = AppTheme.success;
        badgeBg = const Color(0xFFD1FAE5);
        badgeText = '🏆 Sangat Baik';
        break;
      case 'Baik':
        badgeColor = AppTheme.primary;
        badgeBg = AppTheme.primaryLight;
        badgeText = '✅ Baik';
        break;
      case 'Cukup':
        badgeColor = AppTheme.warning;
        badgeBg = const Color(0xFFFEF3C7);
        badgeText = '⚠️ Cukup';
        break;
      default:
        badgeColor = AppTheme.danger;
        badgeBg = const Color(0xFFFEE2E2);
        badgeText = '🔴 Kurang';
    }

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Perhitungan Skor Akhir',
          style: AppTheme.subheading.copyWith(fontSize: 14),
        ),
        const SizedBox(height: 4),
        Text(
          'Preferensi TOPSIS dihitung berdasarkan kedekatan relatif suatu alternatif terhadap solusi ideal positif.',
          style: AppTheme.caption,
        ),
        const SizedBox(height: 16),

        // Score Hero card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00BCD4), Color(0xFF0097A7)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: const [BoxShadow(color: Color(0x3300BCD4), blurRadius: 16, offset: Offset(0, 6))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Skor TOPSIS Preferensi', style: AppTheme.caption.copyWith(color: Colors.white70)),
              const SizedBox(height: 4),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    activity.topsisScore.toStringAsFixed(4),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'Outfit',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: badgeBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      badgeText,
                      style: AppTheme.label.copyWith(color: badgeColor, fontSize: 10, fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Nilai preferensi berkisar antara 0 sampai 1. Nilai yang mendekati 1 menunjukkan kinerja administrasi yang lebih ideal.',
                style: AppTheme.caption.copyWith(color: Colors.white70, fontSize: 10),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Distance items
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.border),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Detail Jarak Solusi Ideal', style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              _rawInfoRow('Jarak Solusi Positif (D⁺)', activity.sPos.toStringAsFixed(6)),
              _rawInfoRow('Jarak Solusi Negatif (D⁻)', activity.sNeg.toStringAsFixed(6)),
              const Divider(height: 20),
              _rawInfoRow('Pembagi Jarak (D⁺ + D⁻)', (activity.sPos + activity.sNeg).toStringAsFixed(6)),
              _buildFormulaRow('Hasil Akhir = D⁻ / (D⁺ + D⁻) = ${activity.topsisScore.toStringAsFixed(6)}'),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Recommendation card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFF0FDFF),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFB2EBF2)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.info_outline_rounded, color: AppTheme.primary, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Rekomendasi Analitis',
                      style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700, color: AppTheme.primary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      activity.topsisScore >= 0.8
                          ? 'Performa administrasi sangat unggul. Jadikan tata kelola kegiatan ini sebagai standardisasi unit kerja.'
                          : activity.topsisScore >= 0.6
                              ? 'Performa administrasi sudah baik dan stabil. Lakukan optimasi minor pada kriteria dengan skor di bawah 80.'
                              : activity.topsisScore >= 0.4
                                  ? 'Performa administrasi cukup memadai, namun memerlukan perhatian khusus pada kriteria yang memiliki skor deviasi tinggi.'
                                  : 'Diperlukan pendampingan administratif intensif untuk meninjau kendala LPJ dan deviasi anggaran.',
                      style: AppTheme.caption.copyWith(height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
