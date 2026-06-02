import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/activity_item.dart';
import '../../widgets/blue_stat_card.dart';
import '../help_guide_page.dart';
import '../pengusul/kak_form_page.dart';
import '../pengusul/kak_list_page.dart';
import '../pengusul/kegiatan_page.dart';
import '../pengusul/lpj_list_page.dart';
import '../kegiatan_monitoring_page.dart';
import '../../widgets/dashboard_drawer.dart';

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

    if (!mounted) {
      return;
    }

    await dashboardProvider.loadDashboard();
  }

  Future<void> _openDrawerPage(
    BuildContext context,
    PengusulDashboardProvider dashboardProvider,
    Widget page,
  ) async {
    Navigator.pop(context);
    await _openPageAndReload(context, dashboardProvider, page);
  }

  Widget _buildDrawerTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool selected = false,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: selected ? const Color(0xFF33C8DA) : const Color(0xFF475569),
      ),
      title: Text(
        title,
        style: GoogleFonts.figtree(
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
          color: selected ? const Color(0xFF33C8DA) : const Color(0xFF0F172A),
        ),
      ),
      onTap: onTap,
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
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: tintColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: iconColor.withOpacity(0.06),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 26,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.figtree(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1F2937),
              height: 1.25,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: const DashboardAppBar(),
        body: Consumer2<AuthProvider, PengusulDashboardProvider>(
          builder: (context, authProvider, dashboardProvider, _) {
            if (dashboardProvider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
                ),
              );
            }

            if (dashboardProvider.isError) {
              return Scaffold(
                backgroundColor: const Color(0xFFF8FAFC),
                body: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 48,
                        color: Colors.red,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Terjadi Kesalahan',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(dashboardProvider.errorMessage),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: dashboardProvider.loadDashboard,
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () => dashboardProvider.loadDashboard(),
              color: const Color(0xFF33C8DA),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Custom header dihapus karena sudah pakai AppBar dan Drawer
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Selamat Datang,',
                            style: GoogleFonts.figtree(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF64748B),
                              letterSpacing: 0,
                              height: 1.3,
                            ),
                          ),
                          Text(
                            authProvider.user?.namaLengkap ??
                                'Pengusul Kegiatan',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.figtree(
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF0F172A),
                              letterSpacing: 0,
                              height: 1.25,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (dashboardProvider.stats != null)
                            GridView.count(
                              crossAxisCount: 2,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                              childAspectRatio: 1.85,
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const KakListPage(
                                          initialStatusId: null,
                                        ),
                                      ),
                                    ).then(
                                      (_) =>
                                          dashboardProvider.loadDashboard(),
                                    );
                                  },
                                  child: BlueStatCard(
                                    label: 'SEMUA KAK',
                                    value: dashboardProvider.stats!.totalKak
                                        .toString(),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const KakListPage(
                                          initialStatusId: 1,
                                        ),
                                      ),
                                    ).then(
                                      (_) =>
                                          dashboardProvider.loadDashboard(),
                                    );
                                  },
                                  child: BlueStatCard(
                                    label: 'DRAFT',
                                    value: dashboardProvider.stats!.draftKak
                                        .toString(),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => const KakListPage(
                                          initialStatusId: 2,
                                        ),
                                      ),
                                    ).then(
                                      (_) => dashboardProvider.loadDashboard(),
                                    );
                                  },
                                  child: BlueStatCard(
                                    label: 'REVIEW',
                                    value: dashboardProvider.stats!.reviewKak
                                        .toString(),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => const KakListPage(
                                          initialStatusId: 3,
                                        ),
                                      ),
                                    ).then(
                                      (_) => dashboardProvider.loadDashboard(),
                                    );
                                  },
                                  child: BlueStatCard(
                                    label: 'DISETUJUI',
                                    value: dashboardProvider.stats!.approvedKak
                                        .toString(),
                                  ),
                                ),
                              ],
                            ),
                          const SizedBox(height: 32),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Akses Cepat',
                                style: GoogleFonts.figtree(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF0F172A),
                                  letterSpacing: 0,
                                  height: 1.35,
                                ),
                              ),
                              GestureDetector(
                                onTap: () => _openPageAndReload(
                                  context,
                                  dashboardProvider,
                                  const KakListPage(),
                                ),
                                child: Text(
                                  'Lihat Semua',
                                  style: GoogleFonts.figtree(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: const Color(0xFF33C8DA),
                                    letterSpacing: 0,
                                    height: 1.3,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          GridView.count(
                            crossAxisCount: 4,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisSpacing: 8,
                            mainAxisSpacing: 16,
                            childAspectRatio: 0.8,
                            children: [
                              _buildQuickActionItem(
                                icon: Icons.add_circle_outline_rounded,
                                label: 'Buat KAK',
                                iconColor: const Color(0xFF33C8DA),
                                tintColor: const Color(0xFF33C8DA).withOpacity(0.08),
                                onTap: () async {
                                  final result = await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => const KakFormPage(),
                                    ),
                                  );
                                  if (result == true && mounted) {
                                    await dashboardProvider.loadDashboard();
                                  }
                                },
                              ),
                              _buildQuickActionItem(
                                icon: Icons.file_copy_rounded,
                                label: 'Daftar KAK',
                                iconColor: const Color(0xFFF59E0B),
                                tintColor: const Color(0xFFF59E0B).withOpacity(0.08),
                                onTap: () => _openPageAndReload(
                                  context,
                                  dashboardProvider,
                                  const KakListPage(),
                                ),
                              ),
                              _buildQuickActionItem(
                                icon: Icons.task_alt_rounded,
                                label: 'Kegiatan',
                                iconColor: const Color(0xFF3B82F6),
                                tintColor: const Color(0xFF3B82F6).withOpacity(0.08),
                                onTap: () => _openPageAndReload(
                                  context,
                                  dashboardProvider,
                                  const KegiatanPage(),
                                ),
                              ),
                              _buildQuickActionItem(
                                icon: Icons.visibility_rounded,
                                label: 'Monitoring',
                                iconColor: const Color(0xFF6366F1),
                                tintColor: const Color(0xFF6366F1).withOpacity(0.08),
                                onTap: () => _openPageAndReload(
                                  context,
                                  dashboardProvider,
                                  const KegiatanMonitoringPage(),
                                ),
                              ),
                              _buildQuickActionItem(
                                icon: Icons.receipt_long_rounded,
                                label: 'Kelola LPJ',
                                iconColor: const Color(0xFF10B981),
                                tintColor: const Color(0xFF10B981).withOpacity(0.08),
                                onTap: () => _openPageAndReload(
                                  context,
                                  dashboardProvider,
                                  const LpjListPage(),
                                ),
                              ),
                              _buildQuickActionItem(
                                icon: Icons.menu_book_rounded,
                                label: 'Panduan',
                                iconColor: const Color(0xFF64748B),
                                tintColor: const Color(0xFF64748B).withOpacity(0.08),
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
                          const SizedBox(height: 24),
                          Text(
                            'Aktivitas Terbaru',
                            style: GoogleFonts.figtree(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF0F172A),
                              letterSpacing: 0,
                              height: 1.35,
                            ),
                          ),
                          const SizedBox(height: 16),
                          if (dashboardProvider.items.isNotEmpty)
                            Column(
                              children: List.generate(
                                dashboardProvider.items.length,
                                (index) {
                                  final item = dashboardProvider.items[index];
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 16),
                                    child: ActivityItem(
                                      icon: Icon(
                                        Icons.history_edu_rounded,
                                        color: const Color(0xFF33C8DA),
                                        size: 24,
                                      ),
                                      status: item.status ?? 'PENDING',
                                      time: item.createdAt ?? '',
                                      title: item.nama,
                                    ),
                                  );
                                },
                              ),
                            )
                          else
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 32),
                              child: Center(
                                child: Column(
                                  children: [
                                    Icon(
                                      Icons.inbox_outlined,
                                      size: 48,
                                      color: Colors.grey[300],
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      'Belum ada aktivitas',
                                      style: GoogleFonts.figtree(
                                        fontSize: 14,
                                        color: Colors.grey[500],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: 48,
                        horizontal: 24,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'SIGAP PNJ v1.0.4',
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF64748B),
                              letterSpacing: 0,
                              height: 1.2,
                            ),
                          ),
                          Text(
                            'Politeknik Negeri Jakarta',
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF0F172A),
                              letterSpacing: 0,
                              height: 1.2,
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
      ),
    );
  }
}
