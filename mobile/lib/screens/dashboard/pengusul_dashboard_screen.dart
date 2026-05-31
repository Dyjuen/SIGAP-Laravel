import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/activity_item.dart';
import '../../widgets/blue_stat_card.dart';
import '../help_guide_page.dart';
import '../profile_page.dart';
import '../pengusul/kak_create_page.dart';
import '../pengusul/kak_list_page.dart';
import '../help_guide_page.dart';
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
        color: selected ? const Color(0xFF00BCD4) : const Color(0xFF475569),
      ),
      title: Text(
        title,
        style: GoogleFonts.figtree(
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
          color: selected ? const Color(0xFF00BCD4) : const Color(0xFF0F172A),
        ),
      ),
      onTap: onTap,
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: const Color(0xFF0F172A), size: 32),
                const SizedBox(height: 8),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.figtree(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF0F172A),
                    letterSpacing: 0,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ),
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
        drawer: const DashboardDrawer(roleId: 2), // Pengusul
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
                            user?.namaLengkap ?? 'Pengusul Kegiatan',
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
                              childAspectRatio: 1.15,
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => const KakListPage(initialStatusId: null),
                                        ),
                                      ).then((_) => dashboardProvider.loadDashboard());
                                    },
                                    child: BlueStatCard(
                                      bg: const Color(0xFF33C8DA),
                                      label: 'PENCAIRAN',
                                      textColor: Colors.white,
                                      value: dashboardProvider.stats!.totalKak
                                          .toString(),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => const KakListPage(initialStatusId: 1),
                                        ),
                                      ).then((_) => dashboardProvider.loadDashboard());
                                    },
                                    child: BlueStatCard(
                                      bg: Colors.white,
                                      label: 'KEGIATAN',
                                      textColor: const Color(0xFF33C8DA),
                                      value: dashboardProvider.stats!.draftKak
                                          .toString(),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => const KakListPage(initialStatusId: 2),
                                        ),
                                      ).then((_) => dashboardProvider.loadDashboard());
                                    },
                                    child: BlueStatCard(
                                      bg: Colors.white,
                                      label: 'LPJ',
                                      textColor: const Color(0xFF33C8DA),
                                      value: dashboardProvider.stats!.reviewKak
                                        .toString(),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => const KakListPage(initialStatusId: 5),
                                        ),
                                      ).then((_) => dashboardProvider.loadDashboard());
                                    },
                                    child: BlueStatCard(
                                      bg: const Color(0xFFE0F7FA),
                                      label: 'REVISI',
                                      textColor: const Color(0xFF33C8DA),
                                      value: dashboardProvider.stats!.approvedKak
                                          .toString(),
                                    ),
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
                          Row(
                            children: [
                              _buildQuickActionCard(
                                icon: Icons.add_circle_outline_rounded,
                                label: 'Buat KAK',
                                onTap: () async {
                                  final result = await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => const KakCreatePage(),
                                    ),
                                  );

                                  if (result == true && mounted) {
                                    await dashboardProvider.loadDashboard();
                                  }
                                },
                              ),
                              const SizedBox(width: 16),
                              _buildQuickActionCard(
                                icon: Icons.assignment_rounded,
                                label: 'Daftar KAK',
                                onTap: () => _openPageAndReload(
                                  context,
                                  dashboardProvider,
                                  const KakListPage(),
                                ),
                              ),
                              const SizedBox(width: 16),
                              _buildQuickActionCard(
                                icon: Icons.help_outline_rounded,
                                label: 'Panduan',
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
            ),
          );
        },
      ),
    );
  }
}
