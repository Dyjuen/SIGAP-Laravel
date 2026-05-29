import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/dashboard/blue_stat_card.dart';
import '../../widgets/dashboard/activity_item.dart';
import '../landing_page.dart';
import '../help_guide_page.dart';
import '../profile_page.dart';
import 'kegiatan_form_page.dart';
import 'kak_list_page.dart';

class PengusulDashboardPage extends StatefulWidget {
  const PengusulDashboardPage({super.key});

  @override
  State<PengusulDashboardPage> createState() => _PengusulDashboardPageState();
}

class _PengusulDashboardPageState extends State<PengusulDashboardPage> {
  bool _isLoading = true;
  Map<String, dynamic> _stats = {
    'total_kak': 0,
    'draft_kak': 0,
    'review_kak': 0,
    'approved_kak': 0,
    'rejected_kak': 0,
  };
  List<dynamic> _recentKaks = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final statsRes = await ApiService.get('/pengusul/stats');
      final recentRes = await ApiService.get('/pengusul/recent-kaks');

      if (statsRes.statusCode == 200 && recentRes.statusCode == 200) {
        setState(() {
          _stats = jsonDecode(statsRes.body);
          _recentKaks = jsonDecode(recentRes.body);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F4F8),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00BCD4)))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF00BCD4),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header Blur Effect
                    ClipRRect(
                      borderRadius: BorderRadius.zero,
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                        child: Container(
                          decoration: const BoxDecoration(
                            color: Color(0xCCFFFFFF),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(left: 24, right: 24, top: 48, bottom: 16),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: const [
                                            Text(
                                              'SIGAP',
                                              style: TextStyle(
                                                fontFamily: 'Figtree',
                                                fontWeight: FontWeight.w900,
                                                fontSize: 24,
                                                color: Color(0xFF0F172A),
                                              ),
                                            ),
                                            SizedBox(width: 4),
                                            Text(
                                              'PNJ',
                                              style: TextStyle(
                                                fontFamily: 'Figtree',
                                                fontWeight: FontWeight.w900,
                                                fontSize: 24,
                                                color: Color(0xFF475569),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const Text(
                                          'Sistem Informasi Gerbang Administrasi',
                                          style: TextStyle(
                                            fontFamily: 'Figtree',
                                            fontSize: 12,
                                            color: Color(0xFF64748B),
                                          ),
                                        ),
                                      ],
                                    ),
                                    GestureDetector(
                                      onTap: () => Navigator.of(context)
                                          .push(MaterialPageRoute(builder: (_) => const ProfilePage()))
                                          .then((_) => _loadData()),
                                      child: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFE0F2FE),
                                          borderRadius: BorderRadius.circular(9999),
                                        ),
                                        child: const Icon(
                                          Icons.person_rounded,
                                          color: Color(0xFF0284C7),
                                          size: 20,
                                        ),
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
                    
                    // Welcome Message
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const Text(
                            'Selamat Datang,',
                            style: TextStyle(
                              fontFamily: 'Figtree',
                              fontSize: 22,
                              color: Color(0xFF64748B),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            user?.namaLengkap ?? 'Pengusul',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontFamily: 'Figtree',
                              fontWeight: FontWeight.w900,
                              fontSize: 28,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Stats Cards
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: BlueStatCard(
                                  bg: const Color(0xFF0284C7),
                                  label: 'TOTAL USULAN',
                                  subtitle: 'KAK',
                                  textColor: Colors.white,
                                  value: _stats['total_kak']?.toString() ?? '0',
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: BlueStatCard(
                                  bg: Colors.white,
                                  label: 'DRAFT',
                                  subtitle: 'BELUM DIAJUKAN',
                                  textColor: const Color(0xFF0284C7),
                                  value: _stats['draft_kak']?.toString() ?? '0',
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: BlueStatCard(
                                  bg: Colors.white,
                                  label: 'REVIEW',
                                  subtitle: 'DALAM PROSES',
                                  textColor: const Color(0xFF0284C7),
                                  value: _stats['review_kak']?.toString() ?? '0',
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: BlueStatCard(
                                  bg: const Color(0xFFE0F2FE),
                                  label: 'DISETUJUI',
                                  subtitle: 'KAK',
                                  textColor: const Color(0xFF0284C7),
                                  value: _stats['approved_kak']?.toString() ?? '0',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Quick Access
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Akses Cepat',
                                style: TextStyle(
                                  fontFamily: 'Figtree',
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => const KakListPage()),
                                  ).then((_) => _loadData());
                                },
                                child: const Text(
                                  'Lihat Semua',
                                  style: TextStyle(
                                    fontFamily: 'Figtree',
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Color(0xFF0284C7),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildQuickAccessBtn(
                                  context,
                                  icon: Icons.add_circle_outline_rounded,
                                  label: 'Buat KAK',
                                  onTap: () => Navigator.of(context)
                                      .push(MaterialPageRoute(builder: (_) => KegiatanFormPage(onSuccess: _loadData)))
                                      .then((_) => _loadData()),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildQuickAccessBtn(
                                  context,
                                  icon: Icons.assignment_rounded,
                                  label: 'Daftar KAK',
                                  onTap: () => Navigator.of(context)
                                      .push(MaterialPageRoute(builder: (_) => const KakListPage()))
                                      .then((_) => _loadData()),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildQuickAccessBtn(
                                  context,
                                  icon: Icons.help_outline_rounded,
                                  label: 'Panduan',
                                  onTap: () => Navigator.of(context)
                                      .push(MaterialPageRoute(builder: (_) => const HelpGuidePage()))
                                      .then((_) => _loadData()),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Recent Activities
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Aktivitas Terbaru',
                            style: TextStyle(
                              fontFamily: 'Figtree',
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 16),
                          if (_recentKaks.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              width: double.infinity,
                              child: const Column(
                                children: [
                                  Icon(Icons.inbox_outlined, color: Color(0xFFCBD5E1), size: 40),
                                  SizedBox(height: 8),
                                  Text(
                                    'Belum ada KAK yang dibuat.\nTekan "Buat KAK" untuk memulai.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13, fontFamily: 'Figtree'),
                                  ),
                                ],
                              ),
                            )
                          else
                            ..._recentKaks.map((kak) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _buildActivityItem(kak),
                                )),
                        ],
                      ),
                    ),

                    // Footer / Version
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                      child: Column(
                        children: [
                          const Text(
                            'SIGAP PNJ v1.0.4',
                            style: TextStyle(
                              fontFamily: 'Figtree',
                              fontSize: 12,
                              color: Color(0xFF64748B),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Politeknik Negeri Jakarta',
                            style: TextStyle(
                              fontFamily: 'Figtree',
                              fontSize: 12,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: OutlinedButton(
                              onPressed: () async {
                                await authProvider.logout();
                                if (context.mounted) {
                                  Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(builder: (_) => const LandingPage()),
                                  );
                                }
                              },
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFFFDA4AF)),
                                foregroundColor: Colors.redAccent,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text(
                                'Keluar Sesi',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, fontFamily: 'Figtree'),
                              ),
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
  }

  Widget _buildQuickAccessBtn(BuildContext context, {required IconData icon, required String label, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          children: [
            Icon(icon, color: const Color(0xFF0F172A), size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'Figtree',
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(Map<String, dynamic> kak) {
    final statusId = kak['status_id'] as int? ?? 1;
    final statusNama = kak['status_nama'] ?? 'Draft';
    final title = kak['nama_kegiatan'] ?? 'Pengajuan KAK';
    final time = kak['updated_at'] ?? 'Baru saja';

    IconData iconData;
    Color statusColor;
    Color statusBgColor;

    switch (statusId) {
      case 1: // Draft
        iconData = Icons.edit_document;
        statusColor = const Color(0xFF64748B);
        statusBgColor = const Color(0xFFF1F5F9);
        break;
      case 2: // Review
        iconData = Icons.rate_review_rounded;
        statusColor = const Color(0xFFF59E0B);
        statusBgColor = const Color(0xFFFFFBEB);
        break;
      case 3: // Approved
        iconData = Icons.check_circle_outline_rounded;
        statusColor = const Color(0xFF10B981);
        statusBgColor = const Color(0xFFECFDF5);
        break;
      case 4: // Rejected
        iconData = Icons.cancel_outlined;
        statusColor = const Color(0xFFEF4444);
        statusBgColor = const Color(0xFFFEF2F2);
        break;
      case 5: // Revisi
        iconData = Icons.history_edu_rounded;
        statusColor = const Color(0xFF8B5CF6);
        statusBgColor = const Color(0xFFF5F3FF);
        break;
      default:
        iconData = Icons.description_outlined;
        statusColor = const Color(0xFF64748B);
        statusBgColor = const Color(0xFFF1F5F9);
    }

    return ActivityItem(
      icon: Icon(iconData, color: const Color(0xFF0284C7), size: 24),
      title: title,
      time: time,
      status: statusNama.toUpperCase(),
      statusColor: statusColor,
      statusBgColor: statusBgColor,
    );
  }
}
