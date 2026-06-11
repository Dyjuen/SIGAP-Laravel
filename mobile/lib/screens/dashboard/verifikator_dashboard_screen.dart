import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../providers/dashboard_provider.dart';
import '../../models/dashboard_model.dart';
import '../../providers/auth_provider.dart';
import '../../services/chatbot_service.dart';
import '../help_guide_page.dart';
import '../verifikator/verifikator_approval_page.dart';
import '../verifikator/verifikator_kak_list_page.dart';

import '../../widgets/stat_card.dart';
import '../../widgets/sigap_app_bar.dart';
import '../../widgets/status_badge.dart';

class VerifikatorDashboardScreen extends StatefulWidget {
  const VerifikatorDashboardScreen({super.key});

  @override
  State<VerifikatorDashboardScreen> createState() =>
      _VerifikatorDashboardScreenState();
}

class _VerifikatorDashboardScreenState
    extends State<VerifikatorDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<VerifikatorDashboardProvider>().loadDashboard(),
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
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: const SigapAppBar(roleLabel: 'VERIFIKATOR KAK'),
      body: Consumer2<AuthProvider, VerifikatorDashboardProvider>(
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
          final items = provider.items.where((item) {
            final status = item.status?.toLowerCase() ?? '';
            return !status.contains('disetujui') && 
                   !status.contains('approved') && 
                   !status.contains('revisi');
          }).toList();

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
                          authProvider.user?.namaLengkap ?? 'Verifikator KAK',
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
                          label: 'Pending',
                          value: stats.pendingCount ?? 0,
                          isCyan: true,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const VerifikatorKakListPage(),
                              ),
                            ).then((_) {
                              if (context.mounted) {
                                context.read<VerifikatorDashboardProvider>().loadDashboard();
                              }
                            });
                          },
                        ),
                        StatCard(
                          subtitle: 'KAK',
                          label: 'Approved',
                          value: stats.approvedCount ?? 0,
                          isCyan: false,
                        ),
                        StatCard(
                          subtitle: 'KAK',
                          label: 'Ditolak',
                          value: stats.rejectedCount ?? 0,
                          isCyan: false,
                        ),
                        StatCard(
                          subtitle: 'KAK',
                          label: 'Total KAK',
                          value: stats.totalVerified ?? 0,
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

                  // KAK Menunggu Verifikasi
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Menunggu Verifikasi',
                              style: AppTheme.subheading,
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const VerifikatorKakListPage(),
                                  ),
                                ).then((_) {
                                  if (context.mounted) {
                                    context.read<VerifikatorDashboardProvider>().loadDashboard();
                                  }
                                });
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
                              return _VerificationItemCard(item: item);
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
                                    'Tidak ada KAK menunggu verifikasi',
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

class _VerificationItemCard extends StatelessWidget {
  final DashboardItem item;

  const _VerificationItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                VerifikatorApprovalPage(kakId: int.tryParse(item.id) ?? 0),
          ),
        ).then((result) {
          if (result == true) {
            context.read<VerifikatorDashboardProvider>().loadDashboard();
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
                StatusBadge(status: item.status ?? 'REVIEW'),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                if (item.tipe != null) ...[
                  Text(
                    item.tipe!,
                    style: AppTheme.caption.copyWith(color: AppTheme.textTertiary),
                  ),
                  const SizedBox(width: 12),
                ],
                if (item.createdAt != null)
                  Text(
                    item.createdAt!,
                    style: AppTheme.caption.copyWith(color: AppTheme.textTertiary),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
