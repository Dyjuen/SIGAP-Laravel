import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../models/dashboard_model.dart';
import '../../widgets/dashboard_drawer.dart';
import '../../widgets/blue_stat_card.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../screens/pengusul/lpj_detail_page.dart';
import '../../screens/pengusul/lpj_form_page.dart';
import '../../screens/pengusul/lpj_list_page.dart';
import '../../screens/pengusul/kak_list_page.dart';
import '../../screens/bendahara/pencairan_page.dart';
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
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: const DashboardAppBar(),
      body: Consumer<BendaharaDashboardProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
              ),
            );
          }

          if (provider.isError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    'Terjadi Kesalahan',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(provider.errorMessage),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.loadDashboard(),
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          final stats = provider.stats;
          final items = provider.items;

          return RefreshIndicator(
            onRefresh: () => provider.loadDashboard(),
            color: const Color(0xFF33C8DA),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Greeting
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Selamat Datang,',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Bendahara',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Stat Cards
                    if (stats != null) ...[
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.85,
                        children: [
                          BlueStatCard(
                            label: 'LPJ PENDING',
                            value: stats.lpjPending?.toString() ?? '0',
                          ),
                          BlueStatCard(
                            label: 'LPJ APPROVED',
                            value: stats.lpjApproved?.toString() ?? '0',
                          ),
                          BlueStatCard(
                            label: 'DANA DIUSULKAN',
                            value: _formatCurrency(stats.totalDanaDisusulkan),
                          ),
                          BlueStatCard(
                            label: 'DANA DICAIRKAN',
                            value: _formatCurrency(stats.totalDanaDicairkan),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                    ],

                    Text(
                      'Akses Cepat',
                      style: GoogleFonts.figtree(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF0F172A),
                      ),
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
                          icon: Icons.payments_outlined,
                          label: 'Pencairan',
                          iconColor: const Color(0xFF6366F1),
                          tintColor: const Color(0xFF6366F1).withOpacity(0.08),
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              '/bendahara/pencairan',
                            ).then((_) {
                              if (context.mounted) {
                                provider.loadDashboard();
                              }
                            });
                          },
                        ),
                        _buildQuickActionItem(
                          icon: Icons.file_copy_rounded,
                          label: 'Daftar KAK',
                          iconColor: const Color(0xFFF59E0B),
                          tintColor: const Color(0xFFF59E0B).withOpacity(0.08),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const KakListPage(),
                              ),
                            ).then((_) => provider.loadDashboard());
                          },
                        ),
                        _buildQuickActionItem(
                          icon: Icons.receipt_long_rounded,
                          label: 'Kelola LPJ',
                          iconColor: const Color(0xFF10B981),
                          tintColor: const Color(0xFF10B981).withOpacity(0.08),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const LpjListPage(),
                              ),
                            ).then((_) => provider.loadDashboard());
                          },
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

                    // Section Header
                    Text(
                      'LPJ Menunggu Approval',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Pending LPJ List
                    if (items.isNotEmpty)
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: items.length,
                        itemBuilder: (context, index) {
                          final item = items[index];
                          return _LpjItemCard(item: item);
                        },
                      )
                    else
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24.0),
                          child: Column(
                            children: [
                              Icon(
                                Icons.check_circle_outline,
                                size: 48,
                                color: Colors.green.shade200,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Tidak ada LPJ menunggu approval',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: Colors.grey),
                              ),
                            ],
                          ),
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

  String _formatCurrency(double? value) {
    if (value == null) return 'Rp 0';
    if (value >= 1000000) {
      return 'Rp ${(value / 1000000).toStringAsFixed(1)}M';
    } else if (value >= 1000) {
      return 'Rp ${(value / 1000).toStringAsFixed(1)}K';
    }
    return 'Rp ${value.toStringAsFixed(0)}';
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color bgColor;
  final Color textColor;
  final IconData icon;

  const _StatCard({
    required this.label,
    required this.value,
    required this.bgColor,
    required this.textColor,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF33C8DA).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: const Color(0xFF33C8DA), size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: Color(0xFF1F2937),
              fontFamily: 'Figtree',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Color(0xFF6B7280),
              fontFamily: 'Figtree',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _LpjItemCard extends StatelessWidget {
  final DashboardItem item;

  const _LpjItemCard({required this.item});

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
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
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
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        if (item.pengusulNama != null)
                          Text(
                            'Dari: ${item.pengusulNama}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade100,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'PENDING',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.orange,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Dana Diusulkan',
                          style: TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _formatCurrency(item.danaDisusulkan),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Dana Dicairkan',
                          style: TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _formatCurrency(item.danaDicairkan),
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: (item.danaDicairkan ?? 0) > 0
                                ? Colors.green
                                : Colors.black87,
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
                    // Navigate to process (usually details for bendahara review)
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
                  icon: const Icon(Icons.done, size: 16),
                  label: const Text('Proses'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    backgroundColor: const Color(0xFF33C8DA),
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatCurrency(double? value) {
    if (value == null) return 'Rp 0';
    if (value >= 1000000) {
      return 'Rp ${(value / 1000000).toStringAsFixed(1)}M';
    } else if (value >= 1000) {
      return 'Rp ${(value / 1000).toStringAsFixed(1)}K';
    }
    return 'Rp ${value.toStringAsFixed(0)}';
  }
}
