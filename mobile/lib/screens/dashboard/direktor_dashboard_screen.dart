import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/dashboard_provider.dart';

class DirektorDashboardScreen extends StatefulWidget {
  const DirektorDashboardScreen({super.key});

  @override
  State<DirektorDashboardScreen> createState() =>
      _DirektorDashboardScreenState();
}

class _DirektorDashboardScreenState extends State<DirektorDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<DirektorDashboardProvider>().loadDashboard(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'SIGAP PNJ',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: CircleAvatar(
            backgroundColor: Colors.red.shade100,
            child: Icon(Icons.admin_panel_settings, color: Colors.red.shade700),
          ),
        ),
      ),
      body: Consumer<DirektorDashboardProvider>(
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
                          'Dashboard Eksekutif',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Ringkasan Kinerja Tahun Ini',
                          style: Theme.of(
                            context,
                          ).textTheme.headlineMedium?.copyWith(fontSize: 18),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Overview Cards
                    if (stats != null) ...[
                      GridView.count(
                        crossAxisCount: 2,
                        childAspectRatio: 2.8,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 16,
                        children: [
                          _OverviewCard(
                            label: 'TOTAL KAK',
                            value: stats.totalKak.toString(),
                            bgColor: const Color(0xFF33C8DA),
                            icon: Icons.folder_open_rounded,
                            textColor: Colors.white,
                          ),
                          _OverviewCard(
                            label: 'KAK DISETUJUI',
                            value: stats.approvedKak.toString(),
                            bgColor: Colors.green.shade100,
                            icon: Icons.done_all_rounded,
                            textColor: Colors.green.shade700,
                          ),
                          _OverviewCard(
                            label: 'TOTAL KEGIATAN',
                            value: stats.reviewKak.toString(),
                            bgColor: Colors.orange.shade100,
                            icon: Icons.assignment_rounded,
                            textColor: Colors.orange.shade700,
                          ),
                          _OverviewCard(
                            label: 'SELESAI',
                            value: stats.draftKak.toString(),
                            bgColor: Colors.blue.shade100,
                            icon: Icons.check_circle_rounded,
                            textColor: Colors.blue.shade700,
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // KPI Section
                      Text(
                        'Indikator Kinerja',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      _KpiCard(
                        label: 'Tingkat Kelulusan KAK',
                        value:
                            '${((stats.approvedKak / (stats.totalKak > 0 ? stats.totalKak : 1)) * 100).toStringAsFixed(1)}%',
                        targetValue: '80%',
                        isGood:
                            (stats.approvedKak /
                                (stats.totalKak > 0 ? stats.totalKak : 1)) >=
                            0.8,
                      ),
                      const SizedBox(height: 12),
                      _KpiCard(
                        label: 'Tingkat Penyelesaian Kegiatan',
                        value:
                            '${((stats.draftKak / (stats.reviewKak > 0 ? stats.reviewKak : 1)) * 100).toStringAsFixed(1)}%',
                        targetValue: '75%',
                        isGood:
                            (stats.draftKak /
                                (stats.reviewKak > 0 ? stats.reviewKak : 1)) >=
                            0.75,
                      ),
                      const SizedBox(height: 24),

                      // Performance by Unit Section
                      Text(
                        'Performa per Unit/Jurusan',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      _UnitPerformanceList(),
                      const SizedBox(height: 24),

                      // Key Insights
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.cyan.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.cyan.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.lightbulb_circle_rounded,
                                  color: Colors.cyan.shade700,
                                  size: 24,
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  'Insight Cepat',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.cyan.shade700,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              stats.totalKak > 0
                                  ? 'Total KAK tahun ini: ${stats.totalKak} dengan tingkat approval ${((stats.approvedKak / stats.totalKak) * 100).toStringAsFixed(0)}%'
                                  : 'Belum ada data KAK untuk tahun ini',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.cyan.shade900,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
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

class _OverviewCard extends StatelessWidget {
  final String label;
  final String value;
  final Color bgColor;
  final IconData icon;
  final Color textColor;

  const _OverviewCard({
    required this.label,
    required this.value,
    required this.bgColor,
    required this.icon,
    required this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
        child: Row(
          children: [
            Icon(icon, color: textColor, size: 22),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: textColor.withOpacity(0.7),
                      letterSpacing: 0.5,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 1),
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final String targetValue;
  final bool isGood;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.targetValue,
    required this.isGood,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: isGood ? Colors.green.shade100 : Colors.red.shade100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    isGood ? 'MENCAPAI TARGET' : 'BELUM TARGET',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isGood
                          ? Colors.green.shade700
                          : Colors.red.shade700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Realisasi',
                      style: Theme.of(
                        context,
                      ).textTheme.labelSmall?.copyWith(color: Colors.grey),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Target',
                      style: Theme.of(
                        context,
                      ).textTheme.labelSmall?.copyWith(color: Colors.grey),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      targetValue,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.black54,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: double.parse(value.replaceAll('%', '')) / 100,
                minHeight: 6,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(
                  isGood ? Colors.green : Colors.orange,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UnitPerformanceList extends StatelessWidget {
  const _UnitPerformanceList();

  @override
  Widget build(BuildContext context) {
    // Dummy data - in real app, this would come from provider
    final units = [
      {
        'nama': 'Teknik Informatika Komputer',
        'kak_count': 12,
        'kak_approved': 10,
        'performance': 0.85,
      },
      {
        'nama': 'Teknik Sipil',
        'kak_count': 8,
        'kak_approved': 6,
        'performance': 0.75,
      },
      {
        'nama': 'Akuntansi',
        'kak_count': 6,
        'kak_approved': 5,
        'performance': 0.83,
      },
    ];

    return Column(
      children: units
          .map(
            (unit) => Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              unit['nama'] as String,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.cyan.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${((unit['performance'] as double) * 100).toStringAsFixed(0)}%',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.cyan.shade700,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: unit['performance'] as double,
                          minHeight: 4,
                          backgroundColor: Colors.grey.shade200,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            Color(0xFF33C8DA),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${unit['kak_approved']} dari ${unit['kak_count']} KAK disetujui',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}
