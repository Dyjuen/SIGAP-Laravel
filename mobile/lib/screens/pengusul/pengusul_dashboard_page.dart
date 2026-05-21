import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
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
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'SIGAP PNJ',
              style: TextStyle(
                color: Color(0xFF0F172A),
                fontWeight: FontWeight.w900,
                fontSize: 20,
                fontFamily: 'Figtree',
              ),
            ),
            Text(
              'Panel Kontrol Pengusul KAK',
              style: TextStyle(
                color: Color(0xFF64748B),
                fontSize: 11,
                fontFamily: 'Figtree',
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00BCD4)),
            onPressed: _loadData,
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: GestureDetector(
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ProfilePage()),
              ).then((_) => _loadData()),
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF00BCD4), width: 1.5),
                ),
                child: const CircleAvatar(
                  radius: 18,
                  backgroundColor: Color(0xFFE2E8F0),
                  child: Icon(Icons.person, color: Color(0xFF64748B), size: 20),
                ),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00BCD4)))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF00BCD4),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Selamat Datang,\n${user?.namaLengkap ?? "Pengusul"}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        height: 1.2,
                        color: Color(0xFF0F172A),
                        fontFamily: 'Figtree',
                      ),
                    ),
                    const SizedBox(height: 24),

                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.35,
                      children: [
                        _buildStatCard(
                          title: 'Total KAK',
                          value: _stats['total_kak']?.toString() ?? '0',
                          subtitle: 'Usulan',
                          bg: const Color(0xFF00BCD4),
                          textColor: Colors.white,
                        ),
                        _buildStatCard(
                          title: 'Draft',
                          value: _stats['draft_kak']?.toString() ?? '0',
                          subtitle: 'Belum Diajukan',
                          bg: Colors.white,
                          textColor: const Color(0xFF00BCD4),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        _buildStatCard(
                          title: 'Dalam Review',
                          value: _stats['review_kak']?.toString() ?? '0',
                          subtitle: 'Menunggu',
                          bg: Colors.white,
                          textColor: const Color(0xFF00BCD4),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        _buildStatCard(
                          title: 'Disetujui',
                          value: _stats['approved_kak']?.toString() ?? '0',
                          subtitle: 'KAK',
                          bg: const Color(0xFFE0F7FA),
                          textColor: const Color(0xFF0097A7),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    const Text(
                      'Akses Cepat',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        fontFamily: 'Figtree',
                      ),
                    ),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        _buildQuickAccessBtn(
                          context,
                          icon: Icons.add_box_outlined,
                          label: 'Buat KAK',
                          page: KegiatanFormPage(onSuccess: _loadData),
                        ),
                        const SizedBox(width: 24),
                        _buildQuickAccessBtn(
                          context,
                          icon: Icons.list_alt_outlined,
                          label: 'Daftar KAK',
                          page: const KakListPage(),
                        ),
                        const SizedBox(width: 24),
                        _buildQuickAccessBtn(
                          context,
                          icon: Icons.help_outline,
                          label: 'Panduan',
                          page: const HelpGuidePage(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'KAK Terbaru',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                            fontFamily: 'Figtree',
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const KakListPage()),
                            ).then((_) => _loadData());
                          },
                          child: const Text(
                            'Lihat Semua',
                            style: TextStyle(color: Color(0xFF00BCD4), fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    _recentKaks.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: const Column(
                              children: [
                                Icon(Icons.inbox_outlined, color: Color(0xFFCBD5E1), size: 40),
                                SizedBox(height: 8),
                                Text(
                                  'Belum ada KAK yang dibuat.\nTekan "Buat KAK" untuk memulai.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _recentKaks.length,
                            itemBuilder: (context, idx) {
                              final kak = _recentKaks[idx];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: _buildKakItem(kak),
                              );
                            },
                          ),

                    const SizedBox(height: 40),

                    SizedBox(
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
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    required Color bg,
    required Color textColor,
    BoxBorder? border,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: border,
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            bottom: -20,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w900,
                color: textColor.withOpacity(0.08),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title,
                  style: TextStyle(
                    color: textColor.withOpacity(0.8),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  )),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(value,
                      style: TextStyle(
                        color: textColor,
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'Figtree',
                      )),
                  const SizedBox(width: 4),
                  Text(subtitle,
                      style: TextStyle(
                        color: textColor.withOpacity(0.8),
                        fontSize: 12,
                      )),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAccessBtn(BuildContext context,
      {required IconData icon, required String label, required Widget page}) {
    return Column(
      children: [
        GestureDetector(
          onTap: () => Navigator.of(context)
              .push(MaterialPageRoute(builder: (_) => page))
              .then((_) => _loadData()),
          child: Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: const Color(0xFF00BCD4), size: 26),
          ),
        ),
        const SizedBox(height: 8),
        Text(label,
            style: const TextStyle(
              color: Color(0xFF475569),
              fontSize: 12,
              fontWeight: FontWeight.w600,
              fontFamily: 'Figtree',
            )),
      ],
    );
  }

  Widget _buildKakItem(Map<String, dynamic> kak) {
    final statusId = kak['status_id'] as int? ?? 1;
    final statusNama = kak['status_nama'] ?? 'Draft';

    Color statusColor;
    Color statusBg;
    switch (statusId) {
      case 3:
        statusColor = const Color(0xFF10B981);
        statusBg = const Color(0xFFECFDF5);
        break;
      case 4:
        statusColor = const Color(0xFFEF4444);
        statusBg = const Color(0xFFFEF2F2);
        break;
      case 2:
        statusColor = const Color(0xFFF59E0B);
        statusBg = const Color(0xFFFFFBEB);
        break;
      case 5:
        statusColor = const Color(0xFF8B5CF6);
        statusBg = const Color(0xFFF5F3FF);
        break;
      default:
        statusColor = const Color(0xFF64748B);
        statusBg = const Color(0xFFF1F5F9);
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.description_outlined, color: Color(0xFF64748B), size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  kak['nama_kegiatan'] ?? '-',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                    fontSize: 14,
                    fontFamily: 'Figtree',
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  kak['tipe'] ?? 'Tipe tidak tersedia',
                  style: const TextStyle(color: Color(0xFF475569), fontSize: 12),
                ),
                const SizedBox(height: 4),
                Text(
                  kak['updated_at'] ?? '-',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusBg,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              statusNama,
              style: TextStyle(
                color: statusColor,
                fontWeight: FontWeight.bold,
                fontSize: 10,
                fontFamily: 'Figtree',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
