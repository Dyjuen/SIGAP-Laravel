import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/activity_item.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/sigap_app_bar.dart';
import '../../services/chatbot_service.dart';
import '../help_guide_page.dart';
import '../pengusul/kak_form_page.dart';
import '../pengusul/kak_list_page.dart';
import '../pengusul/kegiatan_page.dart';
import '../pengusul/lpj_list_page.dart';
import '../kegiatan_monitoring_page.dart';

class PengusulDashboardScreen extends StatefulWidget {
  const PengusulDashboardScreen({super.key});

  @override
  State<PengusulDashboardScreen> createState() =>
      _PengusulDashboardScreenState();
}

class _PengusulDashboardScreenState extends State<PengusulDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<PengusulDashboardProvider>().loadDashboard(),
    );
  }

  Future<void> _openPageAndReload(
    BuildContext context,
    PengusulDashboardProvider dashboardProvider,
    Widget page,
  ) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => page));
    if (!mounted) return;
    await dashboardProvider.loadDashboard();
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
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: const SigapAppBar(roleLabel: 'PENGUSUL KEGIATAN'),
      body: Consumer2<AuthProvider, PengusulDashboardProvider>(
        builder: (context, authProvider, dashboardProvider, _) {
          if (dashboardProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(color: AppTheme.primary),
            );
          }

          if (dashboardProvider.isError) {
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
                      dashboardProvider.errorMessage,
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
                      onPressed: dashboardProvider.loadDashboard,
                      child: Text('Coba Lagi', style: AppTheme.bodyBold.copyWith(color: Colors.white)),
                    ),
                  ],
                ),
              ),
            );
          }

          final stats = dashboardProvider.stats;

          return RefreshIndicator(
            onRefresh: () => dashboardProvider.loadDashboard(),
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
                          authProvider.user?.namaLengkap ?? 'Pengusul Kegiatan',
                          style: AppTheme.displayLg,
                        ),
                      ],
                    ),
                  ),

                  // Stat Cards
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
                          label: 'Draft',
                          value: stats.draftKak,
                          isCyan: true,
                          onTap: () => _openPageAndReload(
                            context,
                            dashboardProvider,
                            const KakListPage(initialStatusId: 1),
                          ),
                        ),
                        StatCard(
                          subtitle: 'KAK',
                          label: 'Review',
                          value: stats.reviewKak,
                          isCyan: false,
                          onTap: () => _openPageAndReload(
                            context,
                            dashboardProvider,
                            const KakListPage(initialStatusId: 2),
                          ),
                        ),
                        StatCard(
                          subtitle: 'KAK',
                          label: 'Disetujui',
                          value: stats.approvedKak,
                          isCyan: false,
                          onTap: () => _openPageAndReload(
                            context,
                            dashboardProvider,
                            const KakListPage(initialStatusId: 3),
                          ),
                        ),
                        StatCard(
                          subtitle: 'KAK',
                          label: 'Ditolak',
                          value: stats.rejectedKak,
                          isCyan: false,
                          onTap: () => _openPageAndReload(
                            context,
                            dashboardProvider,
                            const KakListPage(initialStatusId: 4),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),
                  ],

                  // Quick Actions Container
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
                              icon: Icons.visibility_rounded,
                              label: 'Monitoring',
                              iconColor: const Color(0xFF6366F1),
                              tintColor: const Color(0xFFEEF2FF),
                              onTap: () => _openPageAndReload(
                                context,
                                dashboardProvider,
                                const KegiatanMonitoringPage(),
                              ),
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

                  // Recent Activities
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Aktivitas Terbaru',
                          style: AppTheme.subheading,
                        ),
                        const SizedBox(height: 16),
                        if (dashboardProvider.items.isNotEmpty)
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: dashboardProvider.items.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final item = dashboardProvider.items[index];
                              return ActivityItem(
                                icon: const Icon(
                                  Icons.history_edu_rounded,
                                  color: AppTheme.primary,
                                  size: 24,
                                ),
                                status: item.status ?? 'PENDING',
                                time: item.createdAt ?? '',
                                title: item.nama,
                              );
                            },
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(vertical: 40),
                            decoration: AppTheme.cardDecoration,
                            child: Center(
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.inbox_outlined,
                                    size: 48,
                                    color: AppTheme.textTertiary.withOpacity(0.5),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Belum ada aktivitas terbaru',
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
