import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/monitoring_provider.dart';
import '../../models/dashboard_model.dart';
import '../ppk/ppk_kegiatan_list_page.dart';
import '../ppk/ppk_kegiatan_detail_page.dart';
import '../help_guide_page.dart';
import '../pengusul/kegiatan_page.dart';
import '../kegiatan_monitoring_page.dart';

import '../../widgets/stat_card.dart';
import '../../widgets/sigap_app_bar.dart';
import '../../widgets/status_badge.dart';

class PpkDashboardScreen extends StatefulWidget {
  const PpkDashboardScreen({super.key});

  @override
  State<PpkDashboardScreen> createState() => _PpkDashboardScreenState();
}

class _PpkDashboardScreenState extends State<PpkDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<BaseDashboardProvider>().loadDashboard(),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
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
    final String displayName = user?.namaLengkap.split(' ').first ?? 'User';
    final String roleLabel = user?.roleId == 4 ? 'PPK' : 'WADIR II';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: SigapAppBar(roleLabel: user?.roleId == 4 ? 'PPK KEGIATAN' : 'WAKIL DIREKTUR II'),
      body: Consumer<BaseDashboardProvider>(
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
          final items = provider.items;

          return RefreshIndicator(
            onRefresh: () => provider.loadDashboard(),
            color: AppTheme.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Greeting Section
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${_getGreeting()},',
                          style: AppTheme.caption.copyWith(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          displayName,
                          style: AppTheme.displayLg,
                        ),
                      ],
                    ),
                  ),

                  // Stat Cards row
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
                          subtitle: 'KEGIATAN',
                          label: 'Menunggu',
                          value: stats.pendingCount ?? 0,
                          isCyan: true,
                          onTap: () {
                            Navigator.of(context)
                                .push(
                                  MaterialPageRoute(
                                    builder: (_) => const PpkKegiatanListPage(),
                                  ),
                                )
                                .then((_) => provider.loadDashboard());
                          },
                        ),
                        StatCard(
                          subtitle: 'KEGIATAN',
                          label: 'Disetujui',
                          value: stats.approvedCount ?? 0,
                          isCyan: false,
                          onTap: () {
                            context.read<MonitoringProvider>().setSelectedFilter('Disetujui');
                            Navigator.of(context)
                                .push(
                                  MaterialPageRoute(
                                    builder: (_) => const KegiatanMonitoringPage(),
                                  ),
                                )
                                .then((_) => provider.loadDashboard());
                          },
                        ),
                        StatCard(
                          subtitle: 'KEGIATAN',
                          label: 'Ditolak',
                          value: stats.rejectedCount ?? 0,
                          isCyan: false,
                          onTap: () {
                            context.read<MonitoringProvider>().setSelectedFilter('Ditolak');
                            Navigator.of(context)
                                .push(
                                  MaterialPageRoute(
                                    builder: (_) => const KegiatanMonitoringPage(),
                                  ),
                                )
                                .then((_) => provider.loadDashboard());
                          },
                        ),
                        StatCard(
                          subtitle: 'KEGIATAN',
                          label: 'Total Kegiatan',
                          value: stats.totalKegiatan ?? 0,
                          isCyan: false,
                          onTap: () {
                            context.read<MonitoringProvider>().setSelectedFilter('Semua');
                            Navigator.of(context)
                                .push(
                                  MaterialPageRoute(
                                    builder: (_) => const KegiatanMonitoringPage(),
                                  ),
                                )
                                .then((_) => provider.loadDashboard());
                          },
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
                              icon: Icons.fact_check_rounded,
                              label: 'Persetujuan',
                              iconColor: AppTheme.primary,
                              tintColor: AppTheme.primaryLight,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const PpkKegiatanListPage(),
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

                  // Table/List container
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Menunggu Persetujuan',
                              style: AppTheme.subheading,
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.of(context)
                                    .push(
                                      MaterialPageRoute(
                                        builder: (_) => const PpkKegiatanListPage(),
                                      ),
                                    )
                                    .then((_) => provider.loadDashboard());
                              },
                              child: Text(
                                'Lihat Semua',
                                style: AppTheme.caption.copyWith(
                                  color: AppTheme.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (items.isNotEmpty)
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: items.length > 5 ? 5 : items.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final item = items[index];
                              return _ApprovalRow(item: item);
                            },
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(vertical: 40),
                            decoration: AppTheme.cardDecoration,
                            child: Center(
                              child: Column(
                                children: [
                                  const Icon(
                                    Icons.done_all_rounded,
                                    size: 48,
                                    color: AppTheme.success,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Tidak ada kegiatan menunggu persetujuan',
                                    style: AppTheme.body.copyWith(
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ApprovalRow extends StatelessWidget {
  final DashboardItem item;

  const _ApprovalRow({required this.item});

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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.nama,
                      style: AppTheme.subheading.copyWith(
                        fontSize: 14,
                        color: AppTheme.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Pengusul: ${item.pengusulNama ?? '-'}',
                      style: AppTheme.caption.copyWith(color: AppTheme.textSecondary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              const StatusBadge(status: 'PENDING'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    if (item.tipe != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          item.tipe!.toUpperCase(),
                          style: AppTheme.label.copyWith(
                            fontSize: 9,
                            color: const Color(0xFF475569),
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    if (item.createdAt != null)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.calendar_today_outlined,
                            size: 12,
                            color: AppTheme.textTertiary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            item.createdAt!,
                            style: AppTheme.caption.copyWith(color: AppTheme.textTertiary),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () {
                  final int parsedId = int.tryParse(item.id) ?? 0;
                  if (parsedId > 0) {
                    Navigator.of(context)
                        .push(
                          MaterialPageRoute(
                            builder: (_) => PpkKegiatanDetailPage(kegiatanId: parsedId),
                          ),
                        )
                        .then((value) {
                          if (value == true) {
                            context.read<BaseDashboardProvider>().loadDashboard();
                          }
                        });
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryLight,
                  foregroundColor: AppTheme.primary,
                  elevation: 0,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Detail',
                      style: AppTheme.bodyBold.copyWith(
                        fontSize: 12,
                        color: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward_rounded, size: 14, color: AppTheme.primary),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
