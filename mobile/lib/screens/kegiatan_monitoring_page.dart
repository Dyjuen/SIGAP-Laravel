import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../providers/monitoring_provider.dart';
import '../models/monitoring_model.dart';
import '../widgets/monitoring_card.dart';
import '../widgets/sigap_logo.dart';
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
  Timer? _searchDebounce;

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
    _searchDebounce?.cancel();
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
                                        onPressed: () =>
                                            Navigator.of(context).pop(),
                                      ),
                                      const SizedBox(width: 8),
                                      Column(
                                        mainAxisSize: MainAxisSize.min,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const SigapLogo(
                                            width: 96,
                                            height: 24,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'Monitoring Kegiatan',
                                            style: GoogleFonts.figtree(
                                              fontWeight: FontWeight.w400,
                                              fontSize: 13,
                                              color:
                                                  colorScheme.onSurfaceVariant,
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
                                  fillColor: colorScheme.surfaceContainerHighest
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
                                  _searchDebounce?.cancel();
                                  _searchDebounce = Timer(
                                    const Duration(milliseconds: 300),
                                    () {
                                      monitoringProvider.setSearchQuery(value);
                                    },
                                  );
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
                                label: 'Sedang Berjalan',
                                isSelected:
                                    monitoringProvider.selectedFilter ==
                                    'Sedang Berjalan',
                                onTap: () {
                                  monitoringProvider.setSelectedFilter(
                                    'Sedang Berjalan',
                                  );
                                },
                              ),
                              const SizedBox(width: 8),
                              _FilterChip(
                                label: 'Telah Selesai',
                                isSelected:
                                    monitoringProvider.selectedFilter ==
                                    'Telah Selesai',
                                onTap: () {
                                  monitoringProvider.setSelectedFilter(
                                    'Telah Selesai',
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
                            final displayStatus = _statusLabel(item.status);
                            Color statusBg = _getStatusBgColor(displayStatus);
                            Color statusColor = _getStatusTextColor(
                              displayStatus,
                            );

                            return MonitoringCardWidget(
                              date: item.dates['accPPK'] ?? '-',
                              idText: 'KAK #${item.kakId}',
                              pic: _statusDetail(item.status),
                              status: displayStatus.toUpperCase(),
                              statusBg: statusBg,
                              statusColor: statusColor,
                              title: item.namaKegiatan,
                              onDetailTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        KakDetailPage(kakId: item.kakId),
                                  ),
                                );
                              },
                              onTrackTap: () {
                                _showTrackingStepperBottomSheet(context, item);
                              },
                            );
                          }),
                        ],
                      ),
                    ),
                  const SizedBox(height: 40),
                  const SizedBox(height: 40),
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
      case 'selesai':
        return const Color(0xFFE8F5E9);
      case 'proses':
        return const Color(0xFFFFF3E0);
      default:
        return const Color(0xFFF5F5F5);
    }
  }

  /// Helper method to get status text color
  Color _getStatusTextColor(String status) {
    switch (status.toLowerCase()) {
      case 'selesai':
        return const Color(0xFF2E7D32);
      case 'proses':
        return const Color(0xFFE65100);
      default:
        return const Color(0xFF666666);
    }
  }

  String _statusLabel(int status) {
    return status >= 6 ? 'Selesai' : 'Proses';
  }

  String _statusDetail(int status) {
    if (status >= 6) {
      return 'Semua Tahap Selesai';
    }

    const labels = {
      1: 'Tahap PPK',
      2: 'Tahap Wadir 2',
      3: 'Tahap Pencairan',
      4: 'Tahap LPJ',
      5: 'Tahap Setor Fisik',
    };

    return labels[status] ?? 'Tahap Berjalan';
  }

  void _showTrackingStepperBottomSheet(
    BuildContext context,
    MonitoringItem item,
  ) {
    final colorScheme = Theme.of(context).colorScheme;

    final definitions = const [
      _StepDefinition(
        id: 1,
        title: 'Verifikasi PPK',
        description:
            'Pemeriksaan kelengkapan dokumen dan keselarasan anggaran oleh Pejabat Pembuat Komitmen.',
        dateKey: 'accPPK',
      ),
      _StepDefinition(
        id: 2,
        title: 'Persetujuan Wadir II',
        description:
            'Validasi dan persetujuan akhir oleh Wakil Direktur II Bidang Administrasi Umum.',
        dateKey: 'accWD2',
      ),
      _StepDefinition(
        id: 3,
        title: 'Pencairan Dana',
        description:
            'Proses pencairan dana belanja oleh Bendahara Pengeluaran.',
        dateKey: 'uangMuka',
      ),
      _StepDefinition(
        id: 4,
        title: 'Pelaporan LPJ',
        description:
            'Penyusunan dan penyerahan Laporan Pertanggungjawaban (LPJ) kegiatan.',
        dateKey: 'lpj',
      ),
      _StepDefinition(
        id: 5,
        title: 'Selesai',
        description:
            'Seluruh tahapan kegiatan telah selesai dan berkas diarsipkan.',
        dateKey: 'setorFisik',
      ),
    ];

    final steps = definitions.map((definition) {
      final isCompleted = definition.id < item.status;
      final isActive = definition.id == item.status;

      return _StepItem(
        title: definition.title,
        description: definition.description,
        status: isCompleted ? 'completed' : (isActive ? 'active' : 'pending'),
        date: item.dates[definition.dateKey],
      );
    }).toList();

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
                            item.namaKegiatan,
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
    Widget iconWidget;

    if (step.status == 'completed') {
      iconBg = const Color(0xFFE8F5E9);
      iconWidget = const Icon(
        Icons.check_rounded,
        size: 16,
        color: Color(0xFF2E7D32),
      );
    } else if (step.status == 'active') {
      iconBg = const Color(0xFFE0F7FA);
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
      iconWidget = const Icon(
        Icons.close_rounded,
        size: 16,
        color: Color(0xFFC62828),
      );
    } else if (step.status == 'revise') {
      iconBg = const Color(0xFFFFF3E0);
      iconWidget = const Icon(
        Icons.warning_rounded,
        size: 16,
        color: Color(0xFFE65100),
      );
    } else {
      // Pending
      iconBg = colorScheme.outline.withOpacity(0.08);
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

class _StepDefinition {
  final int id;
  final String title;
  final String description;
  final String dateKey;

  const _StepDefinition({
    required this.id,
    required this.title,
    required this.description,
    required this.dateKey,
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
