import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/monitoring_provider.dart';
import '../../models/dashboard_model.dart';
import '../profile_page.dart';
import '../ppk/ppk_kegiatan_list_page.dart';
import '../ppk/ppk_kegiatan_detail_page.dart';
import '../kegiatan_monitoring_page.dart';

class PpkDashboardScreen extends StatefulWidget {
  const PpkDashboardScreen({super.key});

  @override
  State<PpkDashboardScreen> createState() => _PpkDashboardScreenState();
}

class _PpkDashboardScreenState extends State<PpkDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<BaseDashboardProvider>().loadDashboard(),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final String displayName = user?.namaLengkap.split(' ').first ?? 'User';
    final String roleLabel = user?.roleId == 4 ? 'PPK (Pengampu Kegiatan)' : 'Wakil Direktur II';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'SIGAP PNJ',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: Color(0xFF0F172A),
            fontFamily: 'Figtree',
            letterSpacing: -0.5,
          ),
        ),
        leading: Padding(
          padding: const EdgeInsets.only(left: 16.0, top: 8.0, bottom: 8.0),
          child: CircleAvatar(
            backgroundColor: const Color(0xFFE0F7FA),
            child: const Icon(Icons.assignment_ind, color: Color(0xFF00BCD4), size: 20),
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Monitoring Kegiatan',
            icon: const Icon(Icons.analytics_outlined, color: Color(0xFF00BCD4)),
            onPressed: () {
              context.read<MonitoringProvider>().setSelectedFilter('Semua');
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const KegiatanMonitoringPage(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined, color: Color(0xFF475569)),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ProfilePage()),
                );
              },
              child: CircleAvatar(
                backgroundColor: const Color(0xFFF1F5F9),
                child: Text(
                  displayName.substring(0, 1).toUpperCase(),
                  style: const TextStyle(
                    color: Color(0xFF475569),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Consumer<BaseDashboardProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF00BCD4)),
              ),
            );
          }

          if (provider.isError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 64, color: Color(0xFFE57373)),
                    const SizedBox(height: 16),
                    const Text(
                      'Terjadi Kesalahan',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                        fontFamily: 'Figtree',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      provider.errorMessage,
                      style: const TextStyle(color: Color(0xFF64748B)),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => provider.loadDashboard(),
                      icon: const Icon(Icons.refresh),
                      label: const Text('Coba Lagi'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00BCD4),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
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
            color: const Color(0xFF00BCD4),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Greeting Section
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${_getGreeting()}, $displayName!',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                            fontFamily: 'Figtree',
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Dashboard $roleLabel — SIGAP PNJ',
                          style: const TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 14,
                            fontFamily: 'Figtree',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Stat Cards Row
                    if (stats != null) ...[
                      Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const PpkKegiatanListPage(),
                                  ),
                                ).then((_) => provider.loadDashboard());
                              },
                              child: _StatCard(
                                label: 'MENUNGGU',
                                value: stats.pendingCount?.toString() ?? '0',
                                isCyan: true,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                context.read<MonitoringProvider>().setSelectedFilter('Disetujui');
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const KegiatanMonitoringPage(),
                                  ),
                                ).then((_) => provider.loadDashboard());
                              },
                              child: _StatCard(
                                label: 'DISETUJUI',
                                value: stats.approvedCount?.toString() ?? '0',
                                isCyan: false,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                context.read<MonitoringProvider>().setSelectedFilter('Semua');
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const KegiatanMonitoringPage(),
                                  ),
                                ).then((_) => provider.loadDashboard());
                              },
                              child: _StatCard(
                                label: 'TOTAL',
                                value: stats.totalKegiatan?.toString() ?? '0',
                                isCyan: false,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                    ],

                    // Section Title Table
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0F172A).withOpacity(0.03),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header block
                          Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Menunggu Persetujuan Anda',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF0F172A),
                                          fontFamily: 'Figtree',
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      const Text(
                                        'Daftar kegiatan yang memerlukan verifikasi segera',
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF94A3B8),
                                          fontFamily: 'Figtree',
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => const PpkKegiatanListPage(),
                                      ),
                                    ).then((_) => provider.loadDashboard());
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF00BCD4),
                                    foregroundColor: Colors.white,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 10,
                                    ),
                                  ),
                                  child: const Text(
                                    'Semua →',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const Divider(height: 1, color: Color(0xFFF1F5F9)),

                          // Items List
                          if (items.isNotEmpty)
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: items.length > 5 ? 5 : items.length,
                              separatorBuilder: (_, __) =>
                                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                              itemBuilder: (context, index) {
                                final item = items[index];
                                return _ApprovalRow(item: item);
                              },
                            )
                          else
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 48.0),
                              child: Center(
                                child: Column(
                                  children: [
                                    const Icon(
                                      Icons.done_all_rounded,
                                      size: 64,
                                      color: Color(0xFFE2E8F0),
                                    ),
                                    const SizedBox(height: 16),
                                    const Text(
                                      'Tidak ada kegiatan yang menunggu.',
                                      style: TextStyle(
                                        color: Color(0xFF94A3B8),
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        fontFamily: 'Figtree',
                                      ),
                                    ),
                                  ],
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
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final bool isCyan;

  const _StatCard({
    required this.label,
    required this.value,
    required this.isCyan,
  });

  @override
  Widget build(BuildContext context) {
    IconData statIcon;
    if (isCyan) {
      statIcon = Icons.pending_actions_rounded;
    } else if (label == 'DISETUJUI') {
      statIcon = Icons.check_circle_rounded;
    } else {
      statIcon = Icons.assignment_rounded;
    }

    return Container(
      decoration: BoxDecoration(
        color: isCyan ? const Color(0xFF00BCD4) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: isCyan ? null : Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: isCyan 
                ? const Color(0xFF00BCD4).withOpacity(0.15)
                : const Color(0xFF0F172A).withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              color: isCyan ? Colors.white.withOpacity(0.8) : const Color(0xFF00BCD4),
              letterSpacing: 0.5,
              fontFamily: 'Figtree',
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  color: isCyan ? Colors.white : const Color(0xFF0F172A),
                  fontFamily: 'Figtree',
                ),
              ),
              Icon(
                statIcon,
                size: 18,
                color: isCyan ? Colors.white.withOpacity(0.6) : const Color(0xFF94A3B8),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ApprovalRow extends StatelessWidget {
  final DashboardItem item;

  const _ApprovalRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.nama,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                        fontFamily: 'Figtree',
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Pengusul: ${item.pengusulNama ?? '-'}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                        fontFamily: 'Figtree',
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF7ED),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFFFEDD5)),
                ),
                child: const Text(
                  'PENDING',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFC2410C),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    if (item.tipe != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          item.tipe!.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF475569),
                          ),
                        ),
                      ),
                    if (item.createdAt != null)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.calendar_today_outlined, size: 12, color: Color(0xFF94A3B8)),
                          const SizedBox(width: 4),
                          Text(
                            item.createdAt!,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF94A3B8),
                              fontFamily: 'Figtree',
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: () {
                  final int parsedId = int.tryParse(item.id) ?? 0;
                  if (parsedId > 0) {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => PpkKegiatanDetailPage(kegiatanId: parsedId),
                      ),
                    ).then((value) {
                      if (value == true) {
                        context.read<BaseDashboardProvider>().loadDashboard();
                      }
                    });
                  }
                },
                icon: const Text(
                  'Detail',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                label: const Icon(Icons.arrow_forward_rounded, size: 14),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE0F7FA),
                  foregroundColor: const Color(0xFF0E7490),
                  elevation: 0,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
