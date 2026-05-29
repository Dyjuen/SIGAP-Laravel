import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/blue_stat_card.dart';
import '../../widgets/activity_item.dart';
import '../pengusul/kak_create_page.dart';
import '../pengusul/kak_list_page.dart';
import '../help_guide_page.dart';

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

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: Consumer2<AuthProvider, PengusulDashboardProvider>(
          builder: (context, authProvider, dashboardProvider, _) {
            if (dashboardProvider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF00BCD4)),
                ),
              );
            }

            if (dashboardProvider.isError) {
              return Center(
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
                      onPressed: () {
                        dashboardProvider.loadDashboard();
                      },
                      child: const Text('Coba Lagi'),
                    ),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () => dashboardProvider.loadDashboard(),
              color: const Color(0xFF00BCD4),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header with backdrop
                    ClipRRect(
                      borderRadius: BorderRadius.zero,
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.95),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Padding(
                                padding: const EdgeInsets.fromLTRB(
                                  24,
                                  24,
                                  24,
                                  16,
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Text(
                                              'SIGAP',
                                              style: GoogleFonts.figtree(
                                                fontSize: 24,
                                                fontWeight: FontWeight.w900,
                                                color: const Color(0xFF0F172A),
                                                letterSpacing: 0,
                                                height: 1.3,
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              'PNJ',
                                              style: GoogleFonts.figtree(
                                                fontSize: 24,
                                                fontWeight: FontWeight.w900,
                                                color: const Color(0xFF00BCD4),
                                                letterSpacing: 0,
                                                height: 1.3,
                                              ),
                                            ),
                                          ],
                                        ),
                                        Text(
                                          'Sistem Informasi Gerbang Administrasi',
                                          style: GoogleFonts.figtree(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                            color: const Color(0xFF64748B),
                                            letterSpacing: 0,
                                            height: 1.4,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE0F7FA),
                                        borderRadius: BorderRadius.circular(
                                          9999,
                                        ),
                                      ),
                                      padding: const EdgeInsets.all(8),
                                      child: const Icon(
                                        Icons.person,
                                        color: Color(0xFF00BCD4),
                                        size: 20,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                height: 1,
                                color: const Color(0xFFE2E8F0),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.center,
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
                          // Stat Cards 2x2 Grid
                          if (dashboardProvider.stats != null) ...[
                            Row(
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Expanded(
                                  child: BlueStatCard(
                                    bg: const Color(0xFF00BCD4),
                                    label: 'PENCAIRAN',
                                    textColor: Colors.white,
                                    value: dashboardProvider.stats!.totalKak
                                        .toString(),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: BlueStatCard(
                                    bg: Colors.white,
                                    label: 'KEGIATAN',
                                    textColor: const Color(0xFF00BCD4),
                                    value: dashboardProvider.stats!.draftKak
                                        .toString(),
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
                                  child: BlueStatCard(
                                    bg: Colors.white,
                                    label: 'LPJ',
                                    textColor: const Color(0xFF00BCD4),
                                    value: dashboardProvider.stats!.reviewKak
                                        .toString(),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: BlueStatCard(
                                    bg: const Color(0xFFE0F7FA),
                                    label: 'REVISI',
                                    textColor: const Color(0xFF00BCD4),
                                    value: dashboardProvider.stats!.approvedKak
                                        .toString(),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                          ],

                          // Quick Actions
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
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const KakListPage(),
                                    ),
                                  ).then((_) {
                                    dashboardProvider.loadDashboard();
                                  });
                                },
                                child: Text(
                                  'Lihat Semua',
                                  style: GoogleFonts.figtree(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: const Color(0xFF00BCD4),
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
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const KakCreatePage(),
                                      ),
                                    ).then((result) {
                                      if (result == true) {
                                        // Reload dashboard after create
                                        dashboardProvider.loadDashboard();
                                      }
                                    });
                                  },
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: const Color(0xFFE2E8F0),
                                        width: 1,
                                      ),
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.add_circle_outline_rounded,
                                            color: const Color(0xFF0F172A),
                                            size: 32,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            'Buat KAK',
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
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => const KakListPage(),
                                      ),
                                    ).then((_) {
                                      dashboardProvider.loadDashboard();
                                    });
                                  },
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: const Color(0xFFE2E8F0),
                                        width: 1,
                                      ),
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.assignment_rounded,
                                            color: const Color(0xFF0F172A),
                                            size: 32,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            'Daftar KAK',
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
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => const HelpGuidePage(),
                                      ),
                                    );
                                  },
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: const Color(0xFFE2E8F0),
                                        width: 1,
                                      ),
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.help_outline_rounded,
                                            color: const Color(0xFF0F172A),
                                            size: 32,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            'Panduan',
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
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Activities
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
                                        color: const Color(0xFF00BCD4),
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
