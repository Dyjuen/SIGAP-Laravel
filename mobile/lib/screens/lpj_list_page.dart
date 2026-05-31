import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'dart:ui';

import '../providers/lpj_provider.dart';
import '../widgets/lpj_status_card_widget.dart';
import '../widgets/lpj_document_item_widget.dart';

class LpjListPage extends StatefulWidget {
  const LpjListPage({super.key});

  @override
  State<LpjListPage> createState() => _LpjListPageState();
}

class _LpjListPageState extends State<LpjListPage> {
  String searchQuery = '';
  String sortBy = 'Terbaru';

  @override
  void initState() {
    super.initState();
    // Fetch LPJ list on page load
    Future.microtask(() {
      context.read<LpjProvider>().fetchLpjList();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () {
            // Navigate to LPJ form page
            Navigator.pushNamed(context, '/lpj-form');
          },
          backgroundColor: Theme.of(context).primaryColor,
          icon: Icon(
            Icons.add_rounded,
            color: Theme.of(context).primaryIconTheme.color,
            size: 24,
          ),
          elevation: 0,
          label: Text(
            'LPJ Baru',
            style: GoogleFonts.figtree(
              color: Theme.of(context).primaryIconTheme.color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        body: SingleChildScrollView(
          primary: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header with blur background
              ClipRRect(
                borderRadius: BorderRadius.zero,
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardColor.withOpacity(0.8),
                      shape: BoxShape.rectangle,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  IconButton(
                                    onPressed: () => Navigator.pop(context),
                                    icon: Icon(
                                      Icons.arrow_back_rounded,
                                      color: Theme.of(context).primaryTextTheme.bodyLarge?.color,
                                      size: 24,
                                    ),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
                                  ),
                                  Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Laporan (LPJ)',
                                        style: GoogleFonts.figtree(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w900,
                                          color: Theme.of(context).primaryTextTheme.bodyLarge?.color,
                                        ),
                                      ),
                                      Text(
                                        'Pertanggungjawaban Kegiatan',
                                        style: GoogleFonts.figtree(
                                          fontSize: 12,
                                          color: Theme.of(context).primaryTextTheme.bodySmall?.color,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Container(
                                decoration: BoxDecoration(
                                  color: Theme.of(context).primaryColor.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(9999),
                                  shape: BoxShape.circle,
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Icon(
                                    Icons.person_rounded,
                                    color: Theme.of(context).primaryColor,
                                    size: 20,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          height: 1,
                          color: Theme.of(context).dividerColor,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Statistics Cards
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Row 1: Total & Pending
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          flex: 1,
                          child: LpjStatusCardWidget(
                            bg: Theme.of(context).cardColor,
                            label: 'TOTAL LPJ',
                            textColor: Theme.of(context).primaryColor,
                            value: '24',
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          flex: 1,
                          child: LpjStatusCardWidget(
                            bg: Theme.of(context).primaryColor,
                            label: 'PENDING',
                            textColor: Colors.white,
                            value: '05',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Row 2: Approved & Revision
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          flex: 1,
                          child: LpjStatusCardWidget(
                            bg: Colors.green.shade100,
                            label: 'DISETUJUI',
                            textColor: Colors.green.shade700,
                            value: '16',
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          flex: 1,
                          child: LpjStatusCardWidget(
                            bg: Colors.orange.shade100,
                            label: 'REVISI',
                            textColor: Colors.orange.shade700,
                            value: '03',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Search & Filter
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      flex: 1,
                      child: TextField(
                        onChanged: (value) {
                          setState(() => searchQuery = value);
                        },
                        decoration: InputDecoration(
                          hintText: 'Cari dokumen LPJ...',
                          prefixIcon: const Icon(Icons.search_rounded),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Container(
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Theme.of(context).dividerColor,
                          width: 1,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Icon(
                          Icons.tune_rounded,
                          color: Theme.of(context).primaryTextTheme.bodyLarge?.color,
                          size: 24,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Documents List
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                child: Consumer<LpjProvider>(
                  builder: (context, lpjProvider, _) {
                    if (lpjProvider.isLoading) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    if (lpjProvider.lpjList.isEmpty) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Text(
                            'Belum ada dokumen LPJ',
                            style: GoogleFonts.figtree(
                              fontSize: 16,
                              color: Theme.of(context).primaryTextTheme.bodySmall?.color,
                            ),
                          ),
                        ),
                      );
                    }

                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                'Daftar Dokumen',
                                style: GoogleFonts.figtree(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Container(
                                height: 34,
                                decoration: BoxDecoration(
                                  color: Theme.of(context).cardColor,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Theme.of(context).dividerColor,
                                    width: 1,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.sort_rounded,
                                        color: Theme.of(context).primaryTextTheme.bodyLarge?.color,
                                        size: 18,
                                      ),
                                      const SizedBox(width: 6),
                                      DropdownButton<String>(
                                        value: sortBy,
                                        underline: const SizedBox(),
                                        items: ['Terbaru', 'Terlama', 'Status'].map((e) {
                                          return DropdownMenuItem(value: e, child: Text(e));
                                        }).toList(),
                                        onChanged: (value) {
                                          if (value != null) {
                                            setState(() => sortBy = value);
                                          }
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        ...lpjProvider.lpjList.map((item) {
                          return LpjDocumentItemWidget(
                            title: item.namaKegiatan,
                            date: item.lpjSubmittedAt?.substring(0, 10) ?? 'N/A',
                            files: '2 Files',
                            statusText: item.lpjStatus ?? 'Draft',
                            statusBg: _getStatusColor(item.lpjStatus).withOpacity(0.2),
                            statusColor: _getStatusColor(item.lpjStatus),
                            actionText: _getActionText(item.lpjStatus),
                            actionIcon: Icon(_getActionIcon(item.lpjStatus), size: 16),
                            actionVariant: _getActionVariant(item.lpjStatus),
                            onTap: () {
                              // Navigate to detail or form page
                              Navigator.pushNamed(
                                context,
                                '/lpj-detail',
                                arguments: item.kegiatanId,
                              );
                            },
                          );
                        }).toList(),
                      ],
                    );
                  },
                ),
              ),

              // Footer
              Container(
                padding: const EdgeInsets.fromLTRB(24, 48, 24, 48),
                alignment: Alignment.center,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'SIGAP PNJ v1.0.4',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: Theme.of(context).primaryTextTheme.bodySmall?.color,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Manajemen Dokumen Digital',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: Theme.of(context).primaryTextTheme.bodySmall?.color,
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

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'DISETUJUI':
        return Colors.green;
      case 'PENDING':
      case 'DRAFT':
        return Colors.blue;
      case 'REVISION REQUESTED':
      case 'REVISI':
        return Colors.orange;
      case 'COMPLETED':
      case 'SELESAI':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  String _getActionText(String? status) {
    switch (status?.toUpperCase()) {
      case 'DRAFT':
        return 'Mulai';
      case 'REVISION REQUESTED':
        return 'Edit';
      case 'APPROVED':
        return 'Lihat';
      default:
        return 'Update';
    }
  }

  IconData _getActionIcon(String? status) {
    switch (status?.toUpperCase()) {
      case 'DRAFT':
        return Icons.edit_rounded;
      case 'REVISION REQUESTED':
        return Icons.edit_rounded;
      case 'APPROVED':
        return Icons.visibility_rounded;
      default:
        return Icons.upload_file_rounded;
    }
  }

  String _getActionVariant(String? status) {
    switch (status?.toUpperCase()) {
      case 'REVISION REQUESTED':
        return 'destructive';
      case 'APPROVED':
        return 'ghost';
      default:
        return 'outline';
    }
  }
}
