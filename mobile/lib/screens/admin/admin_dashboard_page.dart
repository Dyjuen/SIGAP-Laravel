import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../landing_page.dart';
import '../help_guide_page.dart';
import 'user_management_page.dart';
import '../profile_page.dart';

class AdminDashboardPage extends StatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  State<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends State<AdminDashboardPage> {
  bool _isLoading = true;
  Map<String, dynamic> _stats = {
    'total_kak': 0,
    'total_kegiatan': 0,
    'pending_approvals': 0,
    'total_users': 0,
    'active_users': 0,
  };
  List<dynamic> _logs = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final statsRes = await ApiService.get('/admin/stats');
      final logsRes = await ApiService.get('/admin/logs');

      if (statsRes.statusCode == 200 && logsRes.statusCode == 200) {
        setState(() {
          _stats = jsonDecode(statsRes.body);
          _logs = jsonDecode(logsRes.body);
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
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
              'Panel Kontrol Super Admin',
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
            icon: const Icon(Icons.refresh, color: Color(0xFF33C8DA)),
            onPressed: _loadData,
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ProfilePage()),
                ).then((_) => _loadData());
              },
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF33C8DA), width: 1.5),
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
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF33C8DA),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF33C8DA),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Selamat Datang,\n${user?.namaLengkap ?? "Super Admin"}',
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
                          subtitle: 'Dokumen',
                          bg: const Color(0xFF33C8DA),
                          textColor: Colors.white,
                        ),
                        _buildStatCard(
                          title: 'Total Kegiatan',
                          value: _stats['total_kegiatan']?.toString() ?? '0',
                          subtitle: 'Aktif',
                          bg: Colors.white,
                          textColor: const Color(0xFF33C8DA),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        _buildStatCard(
                          title: 'Persetujuan',
                          value: _stats['pending_approvals']?.toString() ?? '0',
                          subtitle: 'Menunggu',
                          bg: Colors.white,
                          textColor: const Color(0xFF33C8DA),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        _buildStatCard(
                          title: 'Pengguna',
                          value: _stats['total_users']?.toString() ?? '0',
                          subtitle: 'Terdaftar',
                          bg: const Color(0xFFE0F7FA),
                          textColor: const Color(0xFF0097A7),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text(
                          'Akses Cepat',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                            fontFamily: 'Figtree',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        _buildQuickAccessBtn(
                          context,
                          icon: Icons.people_outline,
                          label: 'Pengguna',
                          page: const UserManagementPage(),
                        ),
                        const SizedBox(width: 24),
                        _buildQuickAccessBtn(
                          context,
                          icon: Icons.help_outline,
                          label: 'Panduan',
                          page: const HelpGuidePage(),
                        ),
                        const SizedBox(width: 24),
                        _buildQuickAccessBtn(
                          context,
                          icon: Icons.person_outline,
                          label: 'Profil Saya',
                          page: const ProfilePage(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    const Text(
                      'Log Aktivitas Sistem',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        fontFamily: 'Figtree',
                      ),
                    ),
                    const SizedBox(height: 16),

                    _logs.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: const Text(
                              'Belum ada log aktivitas terdeteksi.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Color(0xFF64748B)),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _logs.length,
                            itemBuilder: (context, index) {
                              final log = _logs[index];
                              String timeText = 'Baru saja';
                              if (log['created_at'] != null) {
                                try {
                                  final dt = DateTime.parse(log['created_at']);
                                  timeText = '${dt.day}/${dt.month} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
                                } catch (_) {}
                              }

                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: _buildActivityItem(
                                  title: log['context_title'] ?? 'Aktivitas Sistem',
                                  desc: log['description'] ?? 'Melakukan perubahan status',
                                  time: '$timeText • ${log['user_name']}',
                                  status: log['log_type'] ?? 'INFO',
                                ),
                              );
                            },
                          ),
                    const SizedBox(height: 40),

                    const Text(
                      'SIGAP PNJ v2.0.0\nPoliteknik Negeri Jakarta',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),

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
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
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
              Text(
                title,
                style: TextStyle(
                  color: textColor.withOpacity(0.8),
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    value,
                    style: TextStyle(
                      color: textColor,
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'Figtree',
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: textColor.withOpacity(0.8),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAccessBtn(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Widget page,
  }) {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => page),
            ).then((_) => _loadData());
          },
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
            child: Icon(icon, color: const Color(0xFF33C8DA), size: 26),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF475569),
            fontSize: 12,
            fontWeight: FontWeight.w600,
            fontFamily: 'Figtree',
          ),
        ),
      ],
    );
  }

  Widget _buildActivityItem({
    required String title,
    required String desc,
    required String time,
    required String status,
  }) {
    Color statusColor = const Color(0xFF3B82F6);
    Color statusBg = const Color(0xFFEFF6FF);

    if (status.toUpperCase() == 'ERROR' || status.toUpperCase() == 'DITOLAK') {
      statusColor = const Color(0xFFEF4444);
      statusBg = const Color(0xFFFEF2F2);
    } else if (status.toUpperCase() == 'SUCCESS' || status.toUpperCase() == 'DISETUJUI') {
      statusColor = const Color(0xFF10B981);
      statusBg = const Color(0xFFECFDF5);
    } else if (status.toUpperCase() == 'WARNING') {
      statusColor = const Color(0xFFF59E0B);
      statusBg = const Color(0xFFFFFBEB);
    }

    return Container(
      padding: const EdgeInsets.all(16.0),
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
            child: const Icon(Icons.flash_on_outlined, color: Color(0xFF64748B), size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
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
                  desc,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Color(0xFF475569),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  time,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11,
                  ),
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
              status,
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
