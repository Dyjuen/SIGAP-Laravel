import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../models/dashboard_model.dart';

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
      () => context.read<PpkDashboardProvider>().loadDashboard(),
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
            backgroundColor: Colors.purple.shade100,
            child: Icon(Icons.assignment_ind, color: Colors.purple.shade700),
          ),
        ),
      ),
      body: Consumer<PpkDashboardProvider>(
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
                          'PPK (Pengampu Kegiatan)',
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
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 16,
                        children: [
                          _StatCard(
                            label: 'PENDING',
                            value: stats.pendingCount?.toString() ?? '0',
                            bgColor: Colors.orange.shade100,
                            textColor: Colors.orange.shade700,
                            icon: Icons.schedule_rounded,
                          ),
                          _StatCard(
                            label: 'APPROVED',
                            value: stats.approvedCount?.toString() ?? '0',
                            bgColor: Colors.green.shade100,
                            textColor: Colors.green.shade700,
                            icon: Icons.done_all_rounded,
                          ),
                          _StatCard(
                            label: 'REJECTED',
                            value: stats.rejectedCount?.toString() ?? '0',
                            bgColor: Colors.red.shade100,
                            textColor: Colors.red.shade700,
                            icon: Icons.close_rounded,
                          ),
                          _StatCard(
                            label: 'TOTAL',
                            value: stats.totalKegiatan?.toString() ?? '0',
                            bgColor: Colors.cyan.shade100,
                            textColor: Colors.cyan.shade700,
                            icon: Icons.folder_open_rounded,
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Section Header
                    Text(
                      'Kegiatan Menunggu Approval',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Pending Kegiatan List
                    if (items.isNotEmpty)
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: items.length,
                        itemBuilder: (context, index) {
                          final item = items[index];
                          return _ApprovalItemCard(item: item);
                        },
                      )
                    else
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24.0),
                          child: Column(
                            children: [
                              Icon(
                                Icons.done_all,
                                size: 48,
                                color: Colors.green.shade200,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Semua kegiatan sudah diapprove',
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
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: textColor, size: 28),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: textColor.withOpacity(0.7),
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ApprovalItemCard extends StatelessWidget {
  final DashboardItem item;

  const _ApprovalItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Navigate to approval detail
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
                            'Pengusul: ${item.pengusulNama}',
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
              if (item.tipe != null || item.createdAt != null)
                Row(
                  children: [
                    if (item.tipe != null) ...[
                      Icon(Icons.category, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        item.tipe!,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    if (item.tanggalMulai != null) ...[
                      Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        item.tanggalMulai!,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ],
                ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Approve action
                  },
                  icon: const Icon(Icons.check, size: 16),
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
}
