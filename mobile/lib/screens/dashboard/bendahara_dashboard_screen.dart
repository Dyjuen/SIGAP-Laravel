import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/dashboard_model.dart';
import '../../services/chatbot_service.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/sigap_app_bar.dart';
import '../../widgets/status_badge.dart';
import '../pengusul/lpj_detail_page.dart';
import '../pengusul/lpj_list_page.dart';

import '../help_guide_page.dart';

class BendaharaDashboardScreen extends StatefulWidget {
  const BendaharaDashboardScreen({super.key});

  @override
  State<BendaharaDashboardScreen> createState() =>
      _BendaharaDashboardScreenState();
}

class _BendaharaDashboardScreenState extends State<BendaharaDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<BendaharaDashboardProvider>().loadDashboard(),
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

  String _formatCurrency(double? value) {
    if (value == null) return 'Rp 0';
    if (value >= 1000000000) {
      return 'Rp ${(value / 1000000000).toStringAsFixed(1)}M';
    } else if (value >= 1000000) {
      return 'Rp ${(value / 1000000).toStringAsFixed(1)}jt';
    } else if (value >= 1000) {
      return 'Rp ${(value / 1000).toStringAsFixed(1)}rb';
    }
    return 'Rp ${value.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: const SigapAppBar(roleLabel: 'BENDAHARA'),
      body: Consumer2<AuthProvider, BendaharaDashboardProvider>(
        builder: (context, authProvider, provider, _) {
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
                          authProvider.user?.namaLengkap ?? 'Bendahara',
                          style: AppTheme.displayLg,
                        ),
                      ],
                    ),
                  ),

                  if (stats != null) ...[
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.8,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
                      children: [
                        StatCard(
                          subtitle: 'LPJ',
                          label: 'Pending',
                          value: stats.lpjPending ?? 0,
                          isCyan: true,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const LpjListPage(),
                              ),
                            ).then((_) => provider.loadDashboard());
                          },
                        ),
                        StatCard(
                          subtitle: 'LPJ',
                          label: 'Approved',
                          value: stats.lpjApproved ?? 0,
                          isCyan: false,
                        ),
                        StatCard(
                          subtitle: 'ANGGARAN',
                          label: 'Diusulkan',
                          value: _formatCurrency(stats.totalDanaDisusulkan),
                          isCyan: false,
                        ),
                        StatCard(
                          subtitle: 'ANGGARAN',
                          label: 'Dicairkan',
                          value: _formatCurrency(stats.totalDanaDicairkan),
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

                  // LPJ Menunggu Approval list
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'LPJ Menunggu Approval',
                              style: AppTheme.subheading,
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const LpjListPage(),
                                  ),
                                ).then((_) => provider.loadDashboard());
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
                            itemCount: items.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final item = items[index];
                              return _LpjItemCard(item: item, formatter: _formatCurrency);
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
                                    Icons.check_circle_outline_rounded,
                                    size: 48,
                                    color: AppTheme.success,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Tidak ada LPJ menunggu approval',
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

class _LpjItemCard extends StatelessWidget {
  final DashboardItem item;
  final String Function(double?) formatter;

  const _LpjItemCard({required this.item, required this.formatter});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => LpjDetailPage(kegiatanId: item.id),
          ),
        ).then((_) {
          if (context.mounted) {
            context.read<BendaharaDashboardProvider>().loadDashboard();
          }
        });
      },
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
                      if (item.pengusulNama != null)
                        Text(
                          'Dari: ${item.pengusulNama}',
                          style: AppTheme.caption.copyWith(
                            color: AppTheme.textSecondary,
                          ),
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
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Dana Diusulkan',
                        style: AppTheme.caption.copyWith(color: AppTheme.textTertiary),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        formatter(item.danaDisusulkan),
                        style: AppTheme.bodyBold.copyWith(
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Dana Dicairkan',
                        style: AppTheme.caption.copyWith(color: AppTheme.textTertiary),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        formatter(item.danaDicairkan),
                        style: AppTheme.bodyBold.copyWith(
                          color: (item.danaDicairkan ?? 0) > 0
                              ? AppTheme.success
                              : AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => LpjDetailPage(kegiatanId: item.id),
                    ),
                  ).then((_) {
                    if (context.mounted) {
                      context.read<BendaharaDashboardProvider>().loadDashboard();
                    }
                  });
                },
                icon: const Icon(Icons.done, size: 16, color: Colors.white),
                label: Text(
                  'Proses',
                  style: AppTheme.bodyBold.copyWith(color: Colors.white, fontSize: 13),
                ),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  backgroundColor: AppTheme.primary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
