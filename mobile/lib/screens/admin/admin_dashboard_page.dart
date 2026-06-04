import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/sigap_app_bar.dart';
import '../../widgets/status_badge.dart';
import 'user_management_page.dart';
import '../help_guide_page.dart';
import '../profile_page.dart';
import '../bendahara/pencairan_page.dart';
import 'spk_page.dart';

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
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    try {
      final statsRes = await ApiService.get('/admin/stats');
      final logsRes = await ApiService.get('/admin/logs');

      if (!mounted) return;
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
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
    }
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

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: const SigapAppBar(roleLabel: 'ADMINISTRATOR'),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primary),
            )
          : RefreshIndicator(
              onRefresh: _loadData,
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
                            'Panel Kontrol,',
                            style: AppTheme.caption.copyWith(
                              color: AppTheme.textSecondary,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            user?.namaLengkap ?? 'Admin',
                            style: AppTheme.displayLg,
                          ),
                        ],
                      ),
                    ),

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
                          subtitle: 'DOKUMEN KAK',
                          label: 'Total KAK',
                          value: _stats['total_kak'] ?? 0,
                          isCyan: true,
                        ),
                        StatCard(
                          subtitle: 'KEGIATAN',
                          label: 'Total Kegiatan',
                          value: _stats['total_kegiatan'] ?? 0,
                          isCyan: false,
                        ),
                        StatCard(
                          subtitle: 'PERSETUJUAN',
                          label: 'Pending',
                          value: _stats['pending_approvals'] ?? 0,
                          isCyan: false,
                        ),
                        StatCard(
                          subtitle: 'PENGGUNA',
                          label: 'Terdaftar',
                          value: _stats['total_users'] ?? 0,
                          isCyan: false,
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

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
                                icon: Icons.payments_outlined,
                                label: 'Pencairan',
                                iconColor: const Color(0xFF10B981),
                                tintColor: const Color(0xFFD1FAE5),
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => const PencairanPage()),
                                  ).then((_) => _loadData());
                                },
                              ),
                              _buildQuickActionItem(
                                icon: Icons.bar_chart_rounded,
                                label: 'SPK',
                                iconColor: const Color(0xFF6366F1),
                                tintColor: const Color(0xFFEEF2FF),
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => const SpkPage()),
                                  );
                                },
                              ),
                              _buildQuickActionItem(
                                icon: Icons.menu_book_rounded,
                                label: 'Panduan',
                                iconColor: const Color(0xFFF59E0B),
                                tintColor: const Color(0xFFFEF3C7),
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => const HelpGuidePage()),
                                  );
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Activity Logs
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Log Aktivitas Sistem',
                            style: AppTheme.subheading,
                          ),
                          const SizedBox(height: 16),
                          if (_logs.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: AppTheme.cardDecoration,
                              child: Center(
                                child: Text(
                                  'Belum ada log aktivitas terdeteksi.',
                                  style: AppTheme.body.copyWith(color: AppTheme.textSecondary),
                                ),
                              ),
                            )
                          else
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _logs.length > 10 ? 10 : _logs.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final log = _logs[index];
                                String timeText = 'Baru saja';
                                if (log['created_at'] != null) {
                                  try {
                                    final dt = DateTime.parse(log['created_at']);
                                    timeText =
                                        '${dt.day}/${dt.month} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
                                  } catch (_) {}
                                }

                                return _ActivityRow(
                                  title: log['context_title'] ?? 'Aktivitas Sistem',
                                  desc: log['description'] ?? 'Melakukan perubahan status',
                                  time: '$timeText • ${log['user_name']}',
                                  status: log['log_type'] ?? 'INFO',
                                );
                              },
                            ),
                        ],
                      ),
                    ),

                    // Footer / Version Info
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
                      child: Column(
                        children: [
                          Text(
                            'SIGAP PNJ v1.0.4',
                            style: AppTheme.caption.copyWith(
                              color: AppTheme.textTertiary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Politeknik Negeri Jakarta',
                            style: AppTheme.caption.copyWith(
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w600,
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
}

class _ActivityRow extends StatelessWidget {
  final String title;
  final String desc;
  final String time;
  final String status;

  const _ActivityRow({
    required this.title,
    required this.desc,
    required this.time,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.cardDecoration,
      padding: const EdgeInsets.all(16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.flash_on_outlined,
              color: AppTheme.textSecondary,
              size: 20,
            ),
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
                  style: AppTheme.subheading.copyWith(
                    fontSize: 14,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppTheme.body.copyWith(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  time,
                  style: AppTheme.caption.copyWith(
                    color: AppTheme.textTertiary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          StatusBadge(status: status.toUpperCase()),
        ],
      ),
    );
  }
}
