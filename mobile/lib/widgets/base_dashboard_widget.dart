import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/dashboard_model.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/blue_stat_card.dart';
import '../widgets/activity_item.dart';

class BaseDashboardWidget extends StatefulWidget {
  final String title;
  final BaseDashboardProvider dashboardProvider;
  final List<StatCardConfig> statCards;
  final String greetingText;

  const BaseDashboardWidget({
    super.key,
    required this.title,
    required this.dashboardProvider,
    required this.statCards,
    required this.greetingText,
  });

  @override
  State<BaseDashboardWidget> createState() => _BaseDashboardWidgetState();
}

class _BaseDashboardWidgetState extends State<BaseDashboardWidget> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<BaseDashboardProvider>().loadDashboard(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
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
                    onPressed: () {
                      provider.loadDashboard();
                    },
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          return SafeArea(
            child: RefreshIndicator(
              onRefresh: () => provider.loadDashboard(),
              color: const Color(0xFF00BCD4),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(24),
                          bottomRight: Radius.circular(24),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          'SIGAP',
                                          style: GoogleFonts.figtree(
                                            fontSize: 24,
                                            fontWeight: FontWeight.w900,
                                            color: const Color(0xFF0F172A),
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'PNJ',
                                          style: GoogleFonts.figtree(
                                            fontSize: 24,
                                            fontWeight: FontWeight.w900,
                                            color: const Color(0xFF00BCD4),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Sistem Informasi Gerbang Administrasi',
                                      style: GoogleFonts.figtree(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: const Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE0F7FA),
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: const Icon(
                                    Icons.person,
                                    color: Color(0xFF00BCD4),
                                    size: 24,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 32),
                            Text(
                              'Selamat Datang,',
                              style: GoogleFonts.figtree(
                                fontSize: 16,
                                fontWeight: FontWeight.w400,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              widget.greetingText,
                              style: GoogleFonts.figtree(
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Stat Cards
                          if (provider.stats != null &&
                              widget.statCards.isNotEmpty)
                            _buildStatCards(provider.stats!)
                          else
                            const SizedBox.shrink(),
                          if (provider.items.isNotEmpty)
                            Column(
                              children: [
                                const SizedBox(height: 32),
                                Align(
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    'Aktivitas Terbaru',
                                    style: GoogleFonts.figtree(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF0F172A),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: provider.items.length,
                                  separatorBuilder: (context, index) =>
                                      const SizedBox(height: 12),
                                  itemBuilder: (context, index) {
                                    final item = provider.items[index];
                                    return ActivityItem(
                                      title: item.nama,
                                      status: item.status ?? 'PENDING',
                                      time: item.createdAt ?? '',
                                      icon: Icon(
                                        Icons.assignment,
                                        color: Colors.cyan[700],
                                      ),
                                    );
                                  },
                                ),
                              ],
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
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatCards(DashboardStats stats) {
    return Column(
      children: [
        if (widget.statCards.length >= 2)
          Row(
            children: [
              Expanded(
                child: BlueStatCard(
                  bg: widget.statCards[0].bgColor,
                  label: widget.statCards[0].label,
                  textColor: widget.statCards[0].textColor,
                  value: widget.statCards[0].getValue(stats),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: BlueStatCard(
                  bg: widget.statCards[1].bgColor,
                  label: widget.statCards[1].label,
                  textColor: widget.statCards[1].textColor,
                  value: widget.statCards[1].getValue(stats),
                ),
              ),
            ],
          ),
        if (widget.statCards.length >= 4) ...[
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: BlueStatCard(
                  bg: widget.statCards[2].bgColor,
                  label: widget.statCards[2].label,
                  textColor: widget.statCards[2].textColor,
                  value: widget.statCards[2].getValue(stats),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: BlueStatCard(
                  bg: widget.statCards[3].bgColor,
                  label: widget.statCards[3].label,
                  textColor: widget.statCards[3].textColor,
                  value: widget.statCards[3].getValue(stats),
                ),
              ),
            ],
          ),
        ],
        const SizedBox(height: 32),
      ],
    );
  }
}

class StatCardConfig {
  final String label;
  final Color bgColor;
  final Color textColor;
  final String Function(DashboardStats) getValue;

  StatCardConfig({
    required this.label,
    required this.bgColor,
    required this.textColor,
    required this.getValue,
  });
}
