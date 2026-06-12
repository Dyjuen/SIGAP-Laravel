import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../models/dashboard_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/sigap_app_bar.dart';
import '../help_guide_page.dart';
import '../pengusul/kak_list_page.dart';
import '../pengusul/kegiatan_page.dart';
import '../kegiatan_monitoring_page.dart';
import 'topsis_detail_bottom_sheet.dart';
import 'widgets/direktur_kpi_card.dart';
import 'widgets/direktur_trend_chart.dart';
import 'widgets/direktur_dana_pie_chart.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
String _formatMoney(double amount) {
  if (amount >= 1e9) return 'Rp ${(amount / 1e9).toStringAsFixed(1)}M';
  if (amount >= 1e6) return 'Rp ${(amount / 1e6).toStringAsFixed(1)}Jt';
  if (amount == 0) return 'Rp 0';
  return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(amount);
}

String _formatMoneyShort(double amount) {
  if (amount >= 1e9) return '${(amount / 1e9).toStringAsFixed(1)}M';
  if (amount >= 1e6) return '${(amount / 1e6).toStringAsFixed(1)}Jt';
  return NumberFormat.decimalPattern('id_ID').format(amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
class DirektorDashboardScreen extends StatefulWidget {
  const DirektorDashboardScreen({super.key});

  @override
  State<DirektorDashboardScreen> createState() => _DirektorDashboardScreenState();
}

class _DirektorDashboardScreenState extends State<DirektorDashboardScreen> {
  bool _showTopsisTable = false;
  int? _expandedJurusanIdx;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<DirektorDashboardProvider>().loadDashboard());
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: const SigapAppBar(roleLabel: 'DIREKTUR'),
      body: Consumer<DirektorDashboardProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
          }

          if (provider.isError) {
            return _buildError(provider);
          }

          final data = provider.direktorData;
          if (data == null) {
            return const Center(child: Text('Tidak ada data'));
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadDashboard(),
            color: AppTheme.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ── Welcome Header ─────────────────────────────────────────
                  _buildHeader(user?.namaLengkap ?? 'Direktur'),

                  // ── Period Filter ──────────────────────────────────────────
                  _buildPeriodFilter(provider),
                  const SizedBox(height: 8),

                  // ── AI Executive Summary ───────────────────────────────────
                  _buildAiSummary(data),
                  const SizedBox(height: 20),

                  // ── 4 Hero KPI Cards ───────────────────────────────────────
                  _buildHeroKpis(data.overview),
                  const SizedBox(height: 20),

                  // ── 3 Insight Cards (horizontal) ───────────────────────────
                  _buildInsightCards(data),
                  const SizedBox(height: 28),

                  // ── SPK / TOPSIS Ranking ───────────────────────────────────
                  _buildSectionHeader('Analisis Kinerja Unit (SPK/TOPSIS)', Icons.workspace_premium_rounded),
                  const SizedBox(height: 12),
                  _buildTopsisRanking(provider, data),
                  const SizedBox(height: 20),

                  // ── Parameter Bobot Kriteria ───────────────────────────────
                  _buildWeightsSection(data.spkConfig),
                  const SizedBox(height: 20),

                  // ── Kegiatan Teladan vs Hambatan ───────────────────────────
                  _buildKegiatanActionCenter(data.topsisActivities),
                  const SizedBox(height: 20),

                  // ── Tabel Audit TOPSIS (collapsible) ──────────────────────
                  _buildAuditTableToggle(data.topsisActivities),
                  const SizedBox(height: 28),

                  // ── Trend Chart ────────────────────────────────────────────
                  _buildSectionHeader('Trend Realisasi & Kegiatan', Icons.trending_up_rounded),
                  const SizedBox(height: 12),
                  DirektorTrendChart(trends: data.trends),
                  const SizedBox(height: 28),

                  // ── Distribusi Dana (Donut) ────────────────────────────────
                  _buildSectionHeader('Distribusi Dana per Unit', Icons.pie_chart_rounded),
                  const SizedBox(height: 12),
                  DirektorDanaPieChart(byJurusan: data.byJurusan),
                  const SizedBox(height: 28),

                  // ── Performa per Unit (Bar style) ──────────────────────────
                  _buildSectionHeader('Performa per Unit/Jurusan', Icons.bar_chart_rounded),
                  const SizedBox(height: 12),
                  _buildUnitPerformanceList(data.byJurusan),
                  const SizedBox(height: 48),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Builders
  // ─────────────────────────────────────────────────────────────────────────

  Widget _buildError(DirektorDashboardProvider provider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 64, color: AppTheme.danger),
            const SizedBox(height: 16),
            Text('Terjadi Kesalahan', style: AppTheme.heading),
            const SizedBox(height: 8),
            Text(provider.errorMessage, style: AppTheme.body.copyWith(color: AppTheme.textSecondary), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              onPressed: () => provider.loadDashboard(),
              child: Text('Coba Lagi', style: AppTheme.bodyBold.copyWith(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(String name) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Selamat Datang,', style: AppTheme.caption.copyWith(fontSize: 14)),
          const SizedBox(height: 4),
          Text(name, style: AppTheme.displayLg),
          const SizedBox(height: 4),
          Text('Monitoring Kinerja & Anggaran Terkini', style: AppTheme.caption),
        ],
      ),
    );
  }

  Widget _buildPeriodFilter(DirektorDashboardProvider provider) {
    final periods = [
      ('3months', '3 Bln'),
      ('6months', '6 Bln'),
      ('1year', '1 Thn'),
      ('year', 'Tahun Ini'),
      ('all', 'Semua'),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 0),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.border),
          boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2))],
        ),
        child: Row(
          children: periods.map(((String val, String label) rec) {
            final isSelected = provider.selectedPeriod == rec.$1;
            return Expanded(
              child: GestureDetector(
                onTap: () => provider.changePeriod(rec.$1),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: isSelected
                        ? [const BoxShadow(color: Color(0x3300BCD4), blurRadius: 8, offset: Offset(0, 2))]
                        : null,
                  ),
                  child: Text(
                    rec.$2,
                    textAlign: TextAlign.center,
                    style: AppTheme.label.copyWith(
                      color: isSelected ? Colors.white : AppTheme.textSecondary,
                      fontWeight: FontWeight.w700,
                      fontSize: 10,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildAiSummary(DirektorDashboardData data) {
    final ov = data.overview;
    final isGood = ov.persentaseSerapan > 50;
    final bestUnit = data.bestUnit;
    final worstUnit = data.worstUnit;

    // Generate AI-style TOPSIS summary
    String topsisText = 'Belum ada analisis kinerja unit untuk periode ini.';
    if (data.topsisJurusans.isNotEmpty) {
      final top = data.topsisJurusans.first;
      final low = data.topsisJurusans.last;
      topsisText = 'Unit ${top.namaJurusan} memimpin kinerja administrasi (Indeks: ${top.avgScore.toStringAsFixed(4)}).';
      if (low.namaJurusan != top.namaJurusan) {
        if (low.avgC4 < 70) {
          topsisText += ' Unit ${low.namaJurusan} perlu pendampingan khusus pada pelaporan LPJ.';
        } else {
          topsisText += ' Unit ${low.namaJurusan} memerlukan akselerasi tata kelola administrasi.';
        }
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        decoration: AppTheme.cardDecoration,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome_rounded, color: AppTheme.primary, size: 20),
                const SizedBox(width: 10),
                Text('AI Executive Summary', style: AppTheme.subheading.copyWith(fontSize: 15)),
              ],
            ),
            const SizedBox(height: 16),
            // Keuangan card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isGood ? const Color(0xFFE0F7FA) : const Color(0xFFFFF8E1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isGood ? const Color(0xFF80DEEA) : const Color(0xFFFFCC80)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: isGood ? AppTheme.primary : AppTheme.warning,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      isGood ? Icons.auto_awesome_rounded : Icons.warning_amber_rounded,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Keuangan & Penyerapan',
                            style: AppTheme.bodyBold.copyWith(color: isGood ? AppTheme.primary : AppTheme.warning)),
                        const SizedBox(height: 4),
                        Text(
                          'Realisasi anggaran ${isGood ? "berjalan baik" : "perlu perhatian"} (${ov.persentaseSerapan.toStringAsFixed(1)}%). '
                          '${isGood ? "Apresiasi untuk ${bestUnit?.namaJurusan ?? "-"} yang memimpin efisiensi." : "Tinjau ${worstUnit?.namaJurusan ?? "-"} untuk akselerasi."}',
                          style: AppTheme.caption.copyWith(height: 1.5),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // TOPSIS card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFE0F7FA),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF80DEEA)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.emoji_events_rounded, color: Colors.white, size: 16),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Evaluasi Kinerja Unit (TOPSIS)',
                            style: AppTheme.bodyBold.copyWith(color: AppTheme.primary)),
                        const SizedBox(height: 4),
                        Text(topsisText, style: AppTheme.caption.copyWith(height: 1.5)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroKpis(DirektorOverview ov) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.55,
        children: [
          DirektorKpiCard(
            label: 'Total Pengajuan',
            value: ov.totalKak.toString(),
            icon: Icons.description_rounded,
            isPrimary: true,
          ),
          DirektorKpiCard(
            label: 'Kegiatan Selesai',
            value: ov.kegiatanSelesai.toString(),
            icon: Icons.check_circle_outline_rounded,
            isPrimary: false,
          ),
          DirektorKpiCard(
            label: 'Total Anggaran',
            value: _formatMoney(ov.danaDiminta),
            icon: Icons.account_balance_wallet_rounded,
            isPrimary: true,
          ),
          DirektorKpiCard(
            label: 'Realisasi Dana',
            value: _formatMoney(ov.danaTerserap),
            icon: Icons.pie_chart_rounded,
            isPrimary: false,
          ),
        ],
      ),
    );
  }

  Widget _buildInsightCards(DirektorDashboardData data) {
    final ov = data.overview;
    final bestUnit = data.bestUnit;
    final worstUnit = data.worstUnit;
    final growth = ov.budgetGrowth;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: SizedBox(
        height: 110,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _InsightCard(
                label: 'Serapan Terbaik',
                value: bestUnit?.namaJurusan ?? '-',
                subtitle: '${bestUnit?.persentaseSerapan.toStringAsFixed(0) ?? 0}% Serapan',
                icon: Icons.emoji_events_rounded,
                isPrimary: false,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _InsightCard(
                label: 'Sisa Terbesar',
                value: worstUnit?.namaJurusan ?? '-',
                subtitle: 'Sisa ${_formatMoneyShort((worstUnit?.danaDiminta ?? 0) - (worstUnit?.danaTerserap ?? 0))}',
                icon: Icons.info_outline_rounded,
                isPrimary: true,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _InsightCard(
                label: 'Tren Anggaran',
                value: '${growth > 0 ? "+" : ""}${growth.toStringAsFixed(1)}%',
                subtitle: 'vs Periode Lalu',
                icon: Icons.trending_up_rounded,
                isPrimary: false,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primary, size: 20),
          const SizedBox(width: 8),
          Text(title, style: AppTheme.subheading),
        ],
      ),
    );
  }

  Widget _buildTopsisRanking(DirektorDashboardProvider provider, DirektorDashboardData data) {
    if (data.topsisJurusans.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: AppTheme.cardDecoration,
          child: const Center(
            child: Text('Belum ada data SPK untuk periode ini.',
                style: TextStyle(color: AppTheme.textSecondary)),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: data.topsisJurusans.asMap().entries.map((entry) {
          final idx = entry.key;
          final jur = entry.value;
          final isExpanded = _expandedJurusanIdx == idx;

          Color badgeColor;
          Color badgeBg;
          String badgeText;
          if (jur.avgScore >= 0.7) {
            badgeColor = AppTheme.success;
            badgeBg = const Color(0xFFD1FAE5);
            badgeText = 'Kinerja Unggul';
          } else if (jur.avgScore >= 0.5) {
            badgeColor = AppTheme.warning;
            badgeBg = const Color(0xFFFEF3C7);
            badgeText = 'Kinerja Stabil';
          } else {
            badgeColor = AppTheme.danger;
            badgeBg = const Color(0xFFFEE2E2);
            badgeText = 'Butuh Akselerasi';
          }

          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isExpanded ? AppTheme.primary.withOpacity(0.4) : AppTheme.border,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isExpanded
                        ? AppTheme.primary.withOpacity(0.08)
                        : Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: [
                  InkWell(
                    onTap: () => setState(() {
                      _expandedJurusanIdx = isExpanded ? null : idx;
                    }),
                    borderRadius: BorderRadius.circular(16),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          // Rank badge
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: idx == 0 ? AppTheme.primary : const Color(0xFFF1F5F9),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text('#${idx + 1}',
                                  style: AppTheme.label.copyWith(
                                    color: idx == 0 ? Colors.white : AppTheme.textSecondary,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                  )),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(jur.namaJurusan,
                                    style: AppTheme.bodyBold.copyWith(fontSize: 13),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 2),
                                Text(
                                  'Selesai: ${jur.kegiatanSelesai} | Serapan: ${jur.persentaseSerapan.toStringAsFixed(0)}%',
                                  style: AppTheme.caption.copyWith(fontSize: 10),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: badgeBg,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: badgeColor.withOpacity(0.25)),
                            ),
                            child: Text(badgeText,
                                style: AppTheme.label.copyWith(color: badgeColor, fontSize: 9, fontWeight: FontWeight.w800)),
                          ),
                          const SizedBox(width: 6),
                          Icon(
                            isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                            color: AppTheme.textSecondary,
                            size: 20,
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Expanded Detail
                  if (isExpanded) ...[
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Audit scores grid
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                Text('Metrik Audit Kinerja (SPK)',
                                    style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700)),
                                const SizedBox(height: 8),
                                _buildAuditRow('Ketepatan Waktu', jur.avgC1),
                                _buildAuditRow('Efisiensi Anggaran', jur.avgC2),
                                _buildAuditRow('Kesesuaian Output', jur.avgC3),
                                _buildAuditRow('Kedisiplinan LPJ', jur.avgC4),
                                const Divider(height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Skor TOPSIS:', style: AppTheme.caption.copyWith(color: AppTheme.primary, fontWeight: FontWeight.w700)),
                                    Text(jur.avgScore.toStringAsFixed(4),
                                        style: AppTheme.bodyBold.copyWith(color: AppTheme.primary)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),
                          // Recommendation
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDFF),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFB2EBF2)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Rekomendasi Internal',
                                    style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700, color: AppTheme.primary)),
                                const SizedBox(height: 4),
                                Text(
                                  jur.avgC4 < 70
                                      ? 'Prioritas: Pengawasan administratif ketat terhadap pelaporan LPJ yang sering terlambat.'
                                      : jur.avgC2 < 70
                                          ? 'Prioritas: Evaluasi perencanaan RAB agar realisasi dana lebih mendekati estimasi.'
                                          : 'Apresiasi: Pertahankan kinerja administratif dan jadikan percontohan unit lain.',
                                  style: AppTheme.caption.copyWith(height: 1.5),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildAuditRow(String label, double value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTheme.caption.copyWith(fontSize: 11)),
          Text('${value.toStringAsFixed(1)}%',
              style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildWeightsSection(SpkConfig config) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        decoration: AppTheme.cardDecoration,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.tune_rounded, color: AppTheme.primary, size: 18),
                const SizedBox(width: 8),
                Text('Parameter Bobot Kriteria SPK', style: AppTheme.subheading.copyWith(fontSize: 14)),
              ],
            ),
            const SizedBox(height: 4),
            Text('Bobot yang dikonfigurasi oleh Administrator untuk perhitungan TOPSIS.',
                style: AppTheme.caption),
            const SizedBox(height: 14),
            _buildWeightRow('C1: Ketepatan Waktu', 'Realisasi vs jadwal KAK', config.weightWaktu),
            _buildWeightRow('C2: Ketepatan Anggaran', 'Deviasi realisasi dana', config.weightAnggaran),
            _buildWeightRow('C3: Kesesuaian Output', 'Pencapaian target output', config.weightOutput),
            _buildWeightRow('C4: Kepatuhan LPJ', 'Kecepatan penyerahan LPJ', config.weightLpj),
          ],
        ),
      ),
    );
  }

  Widget _buildWeightRow(String title, String subtitle, double weight) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.border),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                  Text(subtitle, style: AppTheme.caption.copyWith(fontSize: 10)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.border),
              ),
              child: Text('${weight.toStringAsFixed(0)}%',
                  style: AppTheme.bodyBold.copyWith(color: AppTheme.primary, fontSize: 13)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKegiatanActionCenter(List<TopsisActivity> activities) {
    final teladan = activities.where((a) => a.topsisScore >= 0.6).take(3).toList();
    final hambatan = activities.where((a) => a.c4 < 70 || a.c1 < 70).take(3).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          // Kegiatan Teladan
          Container(
            decoration: AppTheme.cardDecoration,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.verified_rounded, color: Color(0xFF10B981), size: 18),
                    const SizedBox(width: 8),
                    Text('Kegiatan Teladan (Administrasi Terbaik)',
                        style: AppTheme.subheading.copyWith(fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 12),
                if (teladan.isEmpty)
                  const Text('Belum ada kegiatan dengan performa administrasi unggul.',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 12))
                else
                  ...teladan.map((act) => _buildActionItem(
                        act.namaKegiatan,
                        'Unit: ${act.jurusan}',
                        act.c4 >= 90 ? 'LPJ Tepat Waktu' : 'Administrasi Tertib',
                        const Color(0xFFD1FAE5),
                        const Color(0xFF10B981),
                      )),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Hambatan
          Container(
            decoration: AppTheme.cardDecoration,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Color(0xFFF59E0B), size: 18),
                    const SizedBox(width: 8),
                    Text('Hambatan Administrasi & LPJ',
                        style: AppTheme.subheading.copyWith(fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 12),
                if (hambatan.isEmpty)
                  const Text('Seluruh kegiatan berjalan tertib tanpa kendala berarti.',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 12))
                else
                  ...hambatan.map((act) => _buildActionItem(
                        act.namaKegiatan,
                        'Unit: ${act.jurusan}',
                        act.c4 < 70 ? 'Keterlambatan LPJ' : 'Deviasi Anggaran',
                        const Color(0xFFFEE2E2),
                        AppTheme.danger,
                      )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionItem(String title, String subtitle, String badge, Color badgeBg, Color badgeColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.border),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                  Text(subtitle, style: AppTheme.caption.copyWith(fontSize: 10)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: badgeBg,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(badge,
                  style: AppTheme.label.copyWith(color: badgeColor, fontSize: 9, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuditTableToggle(List<TopsisActivity> activities) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          GestureDetector(
            onTap: () => setState(() => _showTopsisTable = !_showTopsisTable),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _showTopsisTable ? 'Sembunyikan Tabel Audit TOPSIS' : 'Tampilkan Tabel Audit TOPSIS (Metrik SPK)',
                    style: AppTheme.caption.copyWith(fontWeight: FontWeight.w700, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(width: 6),
                  Icon(
                    _showTopsisTable ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                    size: 18,
                    color: AppTheme.textSecondary,
                  ),
                ],
              ),
            ),
          ),
          if (_showTopsisTable) ...[
            const SizedBox(height: 12),
            _TopsisAuditTable(activities: activities),
          ],
        ],
      ),
    );
  }

  Widget _buildUnitPerformanceList(List<JurusanData> units) {
    if (units.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: AppTheme.cardDecoration,
          child: const Center(child: Text('Belum ada data unit.', style: TextStyle(color: AppTheme.textSecondary))),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: units.map((unit) {
          final perf = (unit.persentaseSerapan / 100).clamp(0.0, 1.0);
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Container(
              decoration: AppTheme.cardDecoration,
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(unit.namaJurusan,
                            style: AppTheme.bodyBold.copyWith(fontSize: 13),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text('${unit.persentaseSerapan.toStringAsFixed(0)}%',
                            style: AppTheme.label.copyWith(color: AppTheme.primary, fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: perf,
                      minHeight: 5,
                      backgroundColor: const Color(0xFFF1F5F9),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text('${unit.kegiatanSelesai} kegiatan selesai dari ${unit.kakDiajukan} KAK diajukan',
                      style: AppTheme.caption.copyWith(fontSize: 10)),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }




}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Widgets
// ─────────────────────────────────────────────────────────────────────────────

class _InsightCard extends StatelessWidget {
  final String label;
  final String value;
  final String subtitle;
  final IconData icon;
  final bool isPrimary;

  const _InsightCard({
    required this.label,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.isPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      decoration: BoxDecoration(
        gradient: isPrimary
            ? const LinearGradient(colors: [Color(0xFF00BCD4), Color(0xFF0097A7)], begin: Alignment.topLeft, end: Alignment.bottomRight)
            : null,
        color: isPrimary ? null : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isPrimary ? Colors.transparent : AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: isPrimary ? const Color(0x3300BCD4) : Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: AppTheme.caption.copyWith(
                      color: isPrimary ? Colors.white70 : AppTheme.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 9),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              Icon(icon, color: isPrimary ? Colors.white70 : AppTheme.primary, size: 12),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTheme.heading.copyWith(
              color: isPrimary ? Colors.white : AppTheme.primary,
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: AppTheme.caption.copyWith(
                color: isPrimary ? Colors.white70 : AppTheme.textSecondary,
                fontSize: 9),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color iconColor;
  final Color tintColor;
  final VoidCallback onTap;

  const _QuickActionItem({
    required this.icon,
    required this.label,
    required this.iconColor,
    required this.tintColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: tintColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: iconColor.withOpacity(0.12)),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(height: 7),
          Text(label,
              textAlign: TextAlign.center,
              style: AppTheme.label.copyWith(color: AppTheme.textPrimary, fontSize: 10, fontWeight: FontWeight.w600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPSIS Audit Table (scrollable)
// ─────────────────────────────────────────────────────────────────────────────
class _TopsisAuditTable extends StatelessWidget {
  final List<TopsisActivity> activities;
  const _TopsisAuditTable({required this.activities});

  @override
  Widget build(BuildContext context) {
    if (activities.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.cardDecoration,
        child: const Center(child: Text('Tidak ada data kegiatan.', style: TextStyle(color: AppTheme.textSecondary))),
      );
    }

    return Container(
      decoration: AppTheme.cardDecoration,
      clipBehavior: Clip.hardEdge,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                const Icon(Icons.table_chart_rounded, color: AppTheme.primary, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Datasheet TOPSIS (Audit Internal)',
                    style: AppTheme.bodyBold.copyWith(fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Text('Geser untuk lihat semua ›', style: AppTheme.caption.copyWith(fontSize: 10)),
              ],
            ),
          ),
          const Divider(height: 1),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowHeight: 36,
              dataRowMinHeight: 44,
              dataRowMaxHeight: 56,
              columnSpacing: 12,
              horizontalMargin: 14,
              headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
              columns: const [
                DataColumn(label: Text('Rank', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('Nama Kegiatan', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('Unit', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('C1', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('C2', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('C3', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('C4', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('TOPSIS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('Kategori', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
                DataColumn(label: Text('Detail', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
              ],
              rows: activities.asMap().entries.map((entry) {
                final idx = entry.key;
                final act = entry.value;

                Color katColor;
                Color katBg;
                switch (act.kategori) {
                  case 'Sangat Baik':
                    katColor = AppTheme.success;
                    katBg = const Color(0xFFD1FAE5);
                    break;
                  case 'Baik':
                    katColor = AppTheme.primary;
                    katBg = AppTheme.primaryLight;
                    break;
                  case 'Cukup':
                    katColor = AppTheme.warning;
                    katBg = const Color(0xFFFEF3C7);
                    break;
                  default:
                    katColor = AppTheme.danger;
                    katBg = const Color(0xFFFEE2E2);
                }

                return DataRow(
                  color: WidgetStateProperty.all(idx.isEven ? Colors.white : const Color(0xFFFAFAFA)),
                  cells: [
                    DataCell(Text('${idx + 1}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
                    DataCell(SizedBox(
                      width: 150,
                      child: Text(act.namaKegiatan,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis),
                    )),
                    DataCell(SizedBox(
                      width: 90,
                      child: Text(act.jurusan, style: const TextStyle(fontSize: 10), maxLines: 1, overflow: TextOverflow.ellipsis),
                    )),
                    DataCell(Text(act.c1.toStringAsFixed(0), style: const TextStyle(fontSize: 11))),
                    DataCell(Text(act.c2.toStringAsFixed(0), style: const TextStyle(fontSize: 11))),
                    DataCell(Text(act.c3.toStringAsFixed(0), style: const TextStyle(fontSize: 11))),
                    DataCell(Text(act.c4.toStringAsFixed(0), style: const TextStyle(fontSize: 11))),
                    DataCell(Text(act.topsisScore.toStringAsFixed(4),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primary))),
                    DataCell(
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(color: katBg, borderRadius: BorderRadius.circular(6)),
                        child: Text(act.kategori,
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: katColor)),
                      ),
                    ),
                    DataCell(
                      IconButton(
                        icon: const Icon(Icons.info_outline_rounded, color: AppTheme.primary, size: 18),
                        constraints: const BoxConstraints(),
                        padding: EdgeInsets.zero,
                        onPressed: () => showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => TopsisDetailBottomSheet(activity: act),
                        ),
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
