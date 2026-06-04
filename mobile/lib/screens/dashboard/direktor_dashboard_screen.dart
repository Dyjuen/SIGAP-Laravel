import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/sigap_app_bar.dart';
import '../help_guide_page.dart';
import '../pengusul/kak_list_page.dart';
import '../pengusul/kegiatan_page.dart';
import '../kegiatan_monitoring_page.dart';

class DirektorDashboardScreen extends StatefulWidget {
  const DirektorDashboardScreen({super.key});

  @override
  State<DirektorDashboardScreen> createState() =>
      _DirektorDashboardScreenState();
}

class _DirektorDashboardScreenState extends State<DirektorDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<DirektorDashboardProvider>().loadDashboard(),
    );
  }

  Widget _buildQuickActionItem({
    required IconData icon,
    required String label,
    required Color iconColor,
    required Color tintColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: tintColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: iconColor.withValues(alpha: 0.12), width: 1),
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 22,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            label,
            textAlign: TextAlign.center,
            style: AppTheme.label.copyWith(
              color: AppTheme.textPrimary,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
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
            return const Center(
              child: CircularProgressIndicator(color: AppTheme.primary),
            );
          }

          if (provider.isError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline_rounded,
                      size: 64,
                      color: AppTheme.danger,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Terjadi Kesalahan',
                      style: AppTheme.heading,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      provider.errorMessage,
                      style: AppTheme.body.copyWith(color: AppTheme.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
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

          final stats = provider.stats;

          return RefreshIndicator(
            onRefresh: () => provider.loadDashboard(),
            color: AppTheme.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Welcome Header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Selamat Datang,',
                          style: AppTheme.caption.copyWith(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          user?.namaLengkap ?? 'Direktur',
                          style: AppTheme.displayLg,
                        ),
                      ],
                    ),
                  ),

                  // Stat Cards Scroll
                  if (stats != null) ...[
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 2.2,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
                      children: [
                        StatCard(
                          subtitle: 'KAK',
                          label: 'Total KAK',
                          value: stats.totalKak,
                          isCyan: true,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const KakListPage(),
                              ),
                            ).then((_) => provider.loadDashboard());
                          },
                        ),
                        StatCard(
                          subtitle: 'KAK',
                          label: 'Approved',
                          value: stats.approvedKak,
                          isCyan: false,
                        ),
                        StatCard(
                          subtitle: 'KEGIATAN',
                          label: 'Total Kegiatan',
                          value: stats.totalKegiatan ?? 0,
                          isCyan: false,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const KegiatanPage(),
                              ),
                            ).then((_) => provider.loadDashboard());
                          },
                        ),
                        StatCard(
                          subtitle: 'KEGIATAN',
                          label: 'Selesai',
                          value: stats.kegiatanSelesai ?? 0,
                          isCyan: false,
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),
                  ],

                  // Quick Actions
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Akses Cepat',
                          style: AppTheme.subheading,
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildQuickActionItem(
                              icon: Icons.file_copy_rounded,
                              label: 'Daftar KAK',
                              iconColor: const Color(0xFFF59E0B),
                              tintColor: const Color(0xFFFEF3C7),
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const KakListPage(),
                                  ),
                                ).then((_) => provider.loadDashboard());
                              },
                            ),
                            _buildQuickActionItem(
                              icon: Icons.task_alt_rounded,
                              label: 'Kegiatan',
                              iconColor: const Color(0xFF3B82F6),
                              tintColor: const Color(0xFFDBEAFE),
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const KegiatanPage(),
                                  ),
                                ).then((_) => provider.loadDashboard());
                              },
                            ),
                            _buildQuickActionItem(
                              icon: Icons.visibility_rounded,
                              label: 'Monitoring',
                              iconColor: const Color(0xFF6366F1),
                              tintColor: const Color(0xFFEEF2FF),
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const KegiatanMonitoringPage(),
                                  ),
                                ).then((_) => provider.loadDashboard());
                              },
                            ),
                            _buildQuickActionItem(
                              icon: Icons.menu_book_rounded,
                              label: 'Panduan',
                              iconColor: const Color(0xFF64748B),
                              tintColor: const Color(0xFFF1F5F9),
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const HelpGuidePage(),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // KPI Section
                  if (stats != null) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Indikator Kinerja',
                            style: AppTheme.subheading,
                          ),
                          const SizedBox(height: 16),
                          _KpiCard(
                            label: 'Tingkat Kelulusan KAK',
                            value:
                                '${((stats.approvedKak / (stats.totalKak > 0 ? stats.totalKak : 1)) * 100).toStringAsFixed(1)}%',
                            targetValue: '80%',
                            isGood:
                                (stats.approvedKak /
                                    (stats.totalKak > 0 ? stats.totalKak : 1)) >=
                                0.8,
                          ),
                          const SizedBox(height: 12),
                          _KpiCard(
                            label: 'Tingkat Penyelesaian Kegiatan',
                            value:
                                '${(((stats.kegiatanSelesai ?? 0) / ((stats.totalKegiatan ?? 0) > 0 ? stats.totalKegiatan! : 1)) * 100).toStringAsFixed(1)}%',
                            targetValue: '75%',
                            isGood:
                                ((stats.kegiatanSelesai ?? 0) /
                                    ((stats.totalKegiatan ?? 0) > 0 ? stats.totalKegiatan! : 1)) >=
                                0.75,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),
                  ],

                  // Performance per Unit
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Performa per Unit/Jurusan',
                          style: AppTheme.subheading,
                        ),
                        const SizedBox(height: 16),
                        const _UnitPerformanceList(),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Key Insights
                  if (stats != null) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.primary.withOpacity(0.12)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.lightbulb_circle_rounded,
                                  color: AppTheme.primary,
                                  size: 24,
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  'Insight Cepat',
                                  style: AppTheme.subheading.copyWith(
                                    color: AppTheme.primary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              stats.totalKak > 0
                                  ? 'Total KAK tahun ini: ${stats.totalKak} dengan tingkat approval ${((stats.approvedKak / stats.totalKak) * 100).toStringAsFixed(0)}%'
                                  : 'Belum ada data KAK untuk tahun ini',
                              style: AppTheme.body.copyWith(
                                color: AppTheme.primary,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],

                  // Footer info
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
                    child: Column(
                      children: [
                        Text(
                          'SIGAP PNJ v1.0.4',
                          style: AppTheme.caption.copyWith(
                            color: AppTheme.textTertiary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Politeknik Negeri Jakarta',
                          style: AppTheme.caption.copyWith(
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final String targetValue;
  final bool isGood;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.targetValue,
    required this.isGood,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.cardDecoration,
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: AppTheme.subheading.copyWith(fontSize: 13, color: AppTheme.textPrimary),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isGood ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isGood ? 'MENCAPAI TARGET' : 'BELUM TARGET',
                  style: AppTheme.label.copyWith(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: isGood ? AppTheme.success : AppTheme.danger,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Realisasi',
                    style: AppTheme.caption.copyWith(color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: AppTheme.heading.copyWith(fontSize: 20, color: AppTheme.textPrimary),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Target',
                    style: AppTheme.caption.copyWith(color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    targetValue,
                    style: AppTheme.heading.copyWith(fontSize: 20, color: AppTheme.textTertiary),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: double.parse(value.replaceAll('%', '')) / 100,
              minHeight: 6,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(
                isGood ? AppTheme.success : const Color(0xFFF59E0B),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _UnitPerformanceList extends StatelessWidget {
  const _UnitPerformanceList();

  @override
  Widget build(BuildContext context) {
    final units = [
      {
        'nama': 'Teknik Informatika Komputer',
        'kak_count': 12,
        'kak_approved': 10,
        'performance': 0.85,
      },
      {
        'nama': 'Teknik Sipil',
        'kak_count': 8,
        'kak_approved': 6,
        'performance': 0.75,
      },
      {
        'nama': 'Akuntansi',
        'kak_count': 6,
        'kak_approved': 5,
        'performance': 0.83,
      },
    ];

    return Column(
      children: units.map((unit) {
        final performance = unit['performance'] as double;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Container(
            decoration: AppTheme.cardDecoration,
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        unit['nama'] as String,
                        style: AppTheme.subheading.copyWith(fontSize: 13, color: AppTheme.textPrimary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${(performance * 100).toStringAsFixed(0)}%',
                        style: AppTheme.label.copyWith(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: performance,
                    minHeight: 5,
                    backgroundColor: const Color(0xFFF1F5F9),
                    valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${unit['kak_approved']} dari ${unit['kak_count']} KAK disetujui',
                  style: AppTheme.caption.copyWith(color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
