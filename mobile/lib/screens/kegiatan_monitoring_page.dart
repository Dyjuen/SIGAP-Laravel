import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../providers/monitoring_provider.dart';
import '../widgets/monitoring_card.dart';
import 'kak_detail_page.dart';

class KegiatanMonitoringPage extends StatefulWidget {
  const KegiatanMonitoringPage({super.key});

  static const String routeName = 'kegiatanMonitoring';
  static const String routePath = '/kegiatan-monitoring';

  @override
  State<KegiatanMonitoringPage> createState() => _KegiatanMonitoringPageState();
}

class _KegiatanMonitoringPageState extends State<KegiatanMonitoringPage> {
  late TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    // Load items when page opens
    Future.microtask(() {
      context.read<MonitoringProvider>().loadItems();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        backgroundColor: colorScheme.surface,
        body: Consumer<MonitoringProvider>(
          builder: (context, monitoringProvider, _) {
            return SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header Section
                  ClipRRect(
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: Container(
                        decoration: BoxDecoration(
                          color: colorScheme.surface.withOpacity(0.8),
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
                                              fontWeight: FontWeight.w900,
                                              fontSize: 24,
                                              color: colorScheme.onSurface,
                                              height: 1.3,
                                            ),
                                          ),
                                          Text(
                                            'PNJ',
                                            style: GoogleFonts.figtree(
                                              fontWeight: FontWeight.w900,
                                              fontSize: 24,
                                              color: colorScheme.primary,
                                              height: 1.3,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Monitoring Kegiatan',
                                        style: GoogleFonts.figtree(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 13,
                                          color: colorScheme.onSurfaceVariant,
                                          height: 1.4,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: colorScheme.primaryContainer,
                                      shape: BoxShape.circle,
                                    ),
                                    child: IconButton(
                                      padding: EdgeInsets.zero,
                                      icon: Icon(
                                        Icons.filter_list_rounded,
                                        color: colorScheme.primary,
                                        size: 24,
                                      ),
                                      onPressed: () {
                                        // Show filter options dialog if needed
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Divider(
                              height: 1,
                              thickness: 1,
                              color: colorScheme.outline,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Search and Filter Section
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Search Field
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                decoration: InputDecoration(
                                  hintText: 'Cari kegiatan...',
                                  filled: true,
                                  fillColor: colorScheme.surfaceVariant
                                      .withOpacity(0.5),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide.none,
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 12,
                                  ),
                                  prefixIcon: Icon(
                                    Icons.search_rounded,
                                    color: colorScheme.onSurface,
                                    size: 16,
                                  ),
                                ),
                                onChanged: (value) {
                                  monitoringProvider.setSearchQuery(value);
                                },
                              ),
                            ),
                            const SizedBox(width: 16),
                            Container(
                              decoration: BoxDecoration(
                                color: colorScheme.surface,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: colorScheme.outline,
                                  width: 1,
                                ),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Icon(
                                  Icons.tune_rounded,
                                  color: colorScheme.onSurfaceVariant,
                                  size: 20,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        // Filter Chips
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _FilterChip(
                                label: 'Semua',
                                isSelected:
                                    monitoringProvider.selectedFilter ==
                                    'Semua',
                                onTap: () {
                                  monitoringProvider.setSelectedFilter('Semua');
                                },
                              ),
                              const SizedBox(width: 8),
                              _FilterChip(
                                label: 'Menunggu',
                                isSelected:
                                    monitoringProvider.selectedFilter ==
                                    'Menunggu',
                                onTap: () {
                                  monitoringProvider.setSelectedFilter(
                                    'Menunggu',
                                  );
                                },
                              ),
                              const SizedBox(width: 8),
                              _FilterChip(
                                label: 'Disetujui',
                                isSelected:
                                    monitoringProvider.selectedFilter ==
                                    'Disetujui',
                                onTap: () {
                                  monitoringProvider.setSelectedFilter(
                                    'Disetujui',
                                  );
                                },
                              ),
                              const SizedBox(width: 8),
                              _FilterChip(
                                label: 'Ditolak',
                                isSelected:
                                    monitoringProvider.selectedFilter ==
                                    'Ditolak',
                                onTap: () {
                                  monitoringProvider.setSelectedFilter(
                                    'Ditolak',
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Content Section
                  if (monitoringProvider.isLoading)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: colorScheme.primary,
                        ),
                      ),
                    )
                  else if (monitoringProvider.isError)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: 40,
                        horizontal: 24,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 48,
                            color: colorScheme.error,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Terjadi Kesalahan',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            monitoringProvider.errorMessage ?? 'Unknown error',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.w400,
                              fontSize: 14,
                              color: colorScheme.onSurfaceVariant,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          FilledButton(
                            onPressed: () => monitoringProvider.retry(),
                            child: Text(
                              'Coba Lagi',
                              style: GoogleFonts.figtree(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  else if (monitoringProvider.items.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: 40,
                        horizontal: 24,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.inbox_outlined,
                            size: 48,
                            color: colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Tidak Ada Data',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Tidak ada kegiatan yang sesuai dengan filter Anda',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.w400,
                              fontSize: 14,
                              color: colorScheme.onSurfaceVariant,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  else
                    // Monitoring Cards List
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          ...monitoringProvider.items.map((item) {
                            // Map status to display status and colors
                            String displayStatus = item.status ?? 'Draft';
                            Color statusBg = _getStatusBgColor(displayStatus);
                            Color statusColor = _getStatusTextColor(
                              displayStatus,
                            );

                            return MonitoringCardWidget(
                              date: item.createdAt ?? '-',
                              idText: item.id,
                              pic: item.pengusulNama ?? 'Unknown',
                              status: displayStatus.toUpperCase(),
                              statusBg: statusBg,
                              statusColor: statusColor,
                              title: item.nama,
                              onDetailTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        KakDetailPage(kakId: item.id),
                                  ),
                                );
                              },
                              onTrackTap: () {
                                // Navigate to tracking page
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Tracking: ${item.nama}'),
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                              },
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                  const SizedBox(height: 40),
                  // Footer
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'SIGAP PNJ v1.0.4',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w400,
                            fontSize: 11,
                            color: colorScheme.onSurfaceVariant,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Politeknik Negeri Jakarta',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w400,
                            fontSize: 11,
                            color: colorScheme.onSurface,
                            height: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  /// Helper method to get status background color
  Color _getStatusBgColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'disetujui':
        return const Color(0xFFE8F5E9);
      case 'review':
      case 'pending':
      case 'menunggu':
      case 'draft':
        return const Color(0xFFFFF3E0);
      case 'rejected':
      case 'ditolak':
        return const Color(0xFFFFEBEE);
      case 'processing':
      case 'proses':
        return const Color(0xFFE3F2FD);
      default:
        return const Color(0xFFF5F5F5);
    }
  }

  /// Helper method to get status text color
  Color _getStatusTextColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'disetujui':
        return const Color(0xFF2E7D32);
      case 'review':
      case 'pending':
      case 'menunggu':
      case 'draft':
        return const Color(0xFFE65100);
      case 'rejected':
      case 'ditolak':
        return const Color(0xFFC62828);
      case 'processing':
      case 'proses':
        return const Color(0xFF1565C0);
      default:
        return const Color(0xFF666666);
    }
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 34,
        decoration: BoxDecoration(
          color: isSelected ? colorScheme.primary : colorScheme.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: colorScheme.outline, width: 1),
        ),
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isSelected)
              Icon(Icons.check_rounded, color: colorScheme.onPrimary, size: 16),
            if (isSelected) const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.figtree(
                fontWeight: FontWeight.w500,
                fontSize: 14,
                color: isSelected
                    ? colorScheme.onPrimary
                    : colorScheme.onSurface,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
