import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';

import '../providers/monitoring_provider.dart';
import '../models/dashboard_model.dart';
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
                                12,
                                24,
                                24,
                                16,
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: Icon(
                                          Icons.arrow_back_rounded,
                                          color: colorScheme.onSurface,
                                          size: 24,
                                        ),
                                        onPressed: () => Navigator.of(context).pop(),
                                      ),
                                      const SizedBox(width: 8),
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
                                _showTrackingStepperBottomSheet(context, item);
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

  void _showTrackingStepperBottomSheet(BuildContext context, DashboardItem item) {
    final colorScheme = Theme.of(context).colorScheme;

    // Define steps based on item.status
    final status = item.status?.toLowerCase() ?? 'draft';
    
    // Determine state of each step: 'completed', 'active', 'pending', 'rejected', 'revise'
    String step1Status = 'pending';
    String step2Status = 'pending';
    String step3Status = 'pending';
    String step4Status = 'pending';
    String step5Status = 'pending';

    String? step1Date;
    String? step2Date;
    String? step3Date;
    String? step4Date;
    String? step5Date;

    if (status == 'disetujui' || status == 'approved') {
      step1Status = 'completed';
      step2Status = 'completed';
      step3Status = 'completed';
      step4Status = 'completed';
      step5Status = 'completed';
      step1Date = item.createdAt;
      step2Date = item.createdAt;
      step3Date = item.createdAt;
      step4Date = item.createdAt;
      step5Date = item.createdAt;
    } else if (status == 'processing' || status == 'proses' || status == 'review' || status == 'menunggu' || status == 'pending') {
      step1Status = 'active';
      step2Status = 'pending';
      step3Status = 'pending';
      step4Status = 'pending';
      step5Status = 'pending';
      step1Date = item.createdAt;
    } else if (status == 'ditolak' || status == 'rejected') {
      step1Status = 'rejected';
      step2Status = 'pending';
      step3Status = 'pending';
      step4Status = 'pending';
      step5Status = 'pending';
      step1Date = item.createdAt;
    } else if (status == 'revisi' || status == 'revise') {
      step1Status = 'revise';
      step2Status = 'pending';
      step3Status = 'pending';
      step4Status = 'pending';
      step5Status = 'pending';
      step1Date = item.createdAt;
    } else {
      // Draft
      step1Status = 'pending';
      step2Status = 'pending';
      step3Status = 'pending';
      step4Status = 'pending';
      step5Status = 'pending';
    }

    final steps = [
      _StepItem(
        title: 'Verifikasi PPK',
        description: 'Pemeriksaan kelengkapan dokumen dan keselarasan anggaran oleh Pejabat Pembuat Komitmen.',
        status: step1Status,
        date: step1Date,
      ),
      _StepItem(
        title: 'Persetujuan Wadir II',
        description: 'Validasi dan persetujuan akhir oleh Wakil Direktur II Bidang Administrasi Umum.',
        status: step2Status,
        date: step2Date,
      ),
      _StepItem(
        title: 'Pencairan Dana',
        description: 'Proses pencairan dana belanja oleh Bendahara Pengeluaran.',
        status: step3Status,
        date: step3Date,
      ),
      _StepItem(
        title: 'Pelaporan LPJ',
        description: 'Penyusunan dan penyerahan Laporan Pertanggungjawaban (LPJ) kegiatan.',
        status: step4Status,
        date: step4Date,
      ),
      _StepItem(
        title: 'Selesai',
        description: 'Seluruh tahapan kegiatan telah selesai dan berkas diarsipkan.',
        status: step5Status,
        date: step5Date,
      ),
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.15),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: colorScheme.onSurfaceVariant.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF33C8DA).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.timeline_rounded,
                        color: Color(0xFF33C8DA),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Lacak Alur Kerja',
                            style: GoogleFonts.figtree(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item.nama,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.figtree(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const Divider(height: 1, thickness: 1),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(steps.length, (index) {
                    final step = steps[index];
                    final isLast = index == steps.length - 1;

                    return _buildVerticalStepRow(
                      context,
                      step: step,
                      isLast: isLast,
                    );
                  }),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildVerticalStepRow(
    BuildContext context, {
    required _StepItem step,
    required bool isLast,
  }) {
    final colorScheme = Theme.of(context).colorScheme;

    // Get color & icon based on status
    Color iconBg;
    Color iconColor;
    Widget iconWidget;

    if (step.status == 'completed') {
      iconBg = const Color(0xFFE8F5E9);
      iconColor = const Color(0xFF2E7D32);
      iconWidget = const Icon(Icons.check_rounded, size: 16, color: Color(0xFF2E7D32));
    } else if (step.status == 'active') {
      iconBg = const Color(0xFFE0F7FA);
      iconColor = const Color(0xFF33C8DA);
      iconWidget = const SizedBox(
        width: 14,
        height: 14,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
        ),
      );
    } else if (step.status == 'rejected') {
      iconBg = const Color(0xFFFFEBEE);
      iconColor = const Color(0xFFC62828);
      iconWidget = const Icon(Icons.close_rounded, size: 16, color: Color(0xFFC62828));
    } else if (step.status == 'revise') {
      iconBg = const Color(0xFFFFF3E0);
      iconColor = const Color(0xFFE65100);
      iconWidget = const Icon(Icons.warning_rounded, size: 16, color: Color(0xFFE65100));
    } else {
      // Pending
      iconBg = colorScheme.outline.withOpacity(0.08);
      iconColor = colorScheme.outline;
      iconWidget = Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: colorScheme.outline.withOpacity(0.4),
          shape: BoxShape.circle,
        ),
      );
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Indicator column
          Column(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: iconBg,
                  shape: BoxShape.circle,
                  border: step.status == 'active'
                      ? Border.all(color: const Color(0xFF33C8DA), width: 1.5)
                      : null,
                ),
                alignment: Alignment.center,
                child: iconWidget,
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: step.status == 'completed'
                        ? const Color(0xFF2E7D32)
                        : colorScheme.outline.withOpacity(0.2),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          // Content column
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        step.title,
                        style: GoogleFonts.figtree(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: step.status == 'pending'
                              ? colorScheme.onSurfaceVariant.withOpacity(0.6)
                              : colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (step.date != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF33C8DA).withOpacity(0.08),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: const Color(0xFF33C8DA).withOpacity(0.2),
                            ),
                          ),
                          child: Text(
                            step.date!,
                            style: GoogleFonts.figtree(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF33C8DA),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    step.description,
                    style: GoogleFonts.figtree(
                      fontSize: 12,
                      height: 1.4,
                      color: colorScheme.onSurfaceVariant.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StepItem {
  final String title;
  final String description;
  final String status;
  final String? date;

  _StepItem({
    required this.title,
    required this.description,
    required this.status,
    this.date,
  });
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
