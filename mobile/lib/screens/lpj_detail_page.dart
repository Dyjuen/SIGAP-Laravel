import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'dart:ui';

import '../providers/lpj_provider.dart';
import '../models/lpj_model.dart';

class LpjDetailPage extends StatefulWidget {
  final int kegiatanId;

  const LpjDetailPage({super.key, required this.kegiatanId});

  @override
  State<LpjDetailPage> createState() => _LpjDetailPageState();
}

class _LpjDetailPageState extends State<LpjDetailPage> {
  @override
  void initState() {
    super.initState();
    // Fetch LPJ detail
    Future.microtask(() {
      context.read<LpjProvider>().getLpjDetail(widget.kegiatanId.toString());
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Consumer<LpjProvider>(
        builder: (context, lpjProvider, _) {
          if (lpjProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final lpj = lpjProvider.selectedLpj;
          if (lpj == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.description_outlined, size: 64),
                  const SizedBox(height: 16),
                  Text(
                    'Data LPJ tidak ditemukan',
                    style: GoogleFonts.figtree(fontSize: 16),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Kembali'),
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
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
                                        color: Theme.of(
                                          context,
                                        ).primaryTextTheme.bodyLarge?.color,
                                        size: 24,
                                      ),
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(
                                        minWidth: 40,
                                        minHeight: 40,
                                      ),
                                    ),
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Detail LPJ',
                                          style: GoogleFonts.figtree(
                                            fontSize: 20,
                                            fontWeight: FontWeight.w900,
                                            color: Theme.of(
                                              context,
                                            ).primaryTextTheme.bodyLarge?.color,
                                          ),
                                        ),
                                        Text(
                                          lpj.namaKegiatan ?? 'N/A',
                                          style: GoogleFonts.figtree(
                                            fontSize: 12,
                                            color: Theme.of(
                                              context,
                                            ).primaryTextTheme.bodySmall?.color,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                _buildStatusBadge(lpj.lpjStatus),
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

                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Status Timeline
                      _buildStatusTimeline(lpj),
                      const SizedBox(height: 32),

                      // Kegiatan Info
                      _buildSectionHeader('Informasi Kegiatan'),
                      const SizedBox(height: 12),
                      _buildInfoRow('Nama Kegiatan', lpj.namaKegiatan ?? 'N/A'),
                      _buildInfoRow(
                        'Anggaran Diusulkan',
                        'Rp ${_formatCurrency(lpj.totalAnggaranDiusulkan)}',
                      ),
                      _buildInfoRow(
                        'Total Realisasi',
                        'Rp ${_formatCurrency(lpj.totalRealisasi)}',
                      ),
                      _buildInfoRow(
                        'Persentase Realisasi',
                        '${lpj.averageRealizationPercent.toStringAsFixed(1)}%',
                      ),
                      const SizedBox(height: 32),

                      // Realisasi Table
                      _buildSectionHeader('Detail Realisasi'),
                      const SizedBox(height: 12),
                      _buildRealizationTable(lpj),
                      const SizedBox(height: 32),

                      // SPK Evaluation
                      _buildSectionHeader('Evaluasi Kinerja SPK'),
                      const SizedBox(height: 12),
                      _buildSpkSection(lpj),
                      const SizedBox(height: 32),

                      // Approval Status
                      _buildSectionHeader('Status Persetujuan'),
                      const SizedBox(height: 12),
                      _buildApprovalStatus(lpj),
                      const SizedBox(height: 32),

                      // Action Buttons
                      _buildActionButtons(context, lpj),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusBadge(String? status) {
    Color bgColor;
    Color textColor;

    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'DISETUJUI':
        bgColor = Colors.green.shade100;
        textColor = Colors.green.shade700;
        break;
      case 'DRAFT':
        bgColor = Colors.blue.shade100;
        textColor = Colors.blue.shade700;
        break;
      case 'REVISION REQUESTED':
      case 'REVISI':
        bgColor = Colors.orange.shade100;
        textColor = Colors.orange.shade700;
        break;
      case 'COMPLETED':
      case 'SELESAI':
        bgColor = Colors.purple.shade100;
        textColor = Colors.purple.shade700;
        break;
      default:
        bgColor = Colors.grey.shade100;
        textColor = Colors.grey.shade700;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status ?? 'UNKNOWN',
        style: GoogleFonts.figtree(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }

  Widget _buildStatusTimeline(LpjDetail lpj) {
    final statuses = [
      {'label': 'Diterima', 'date': null, 'active': true},
      {
        'label': 'Disubmit',
        'date': lpj.lpjSubmittedAt,
        'active': lpj.lpjSubmittedAt != null,
      },
      {
        'label': 'Disetujui',
        'date': lpj.lpjApprovedAt,
        'active': lpj.lpjApprovedAt != null,
      },
      {
        'label': 'Selesai',
        'date': lpj.lpjCompletedAt,
        'active': lpj.lpjCompletedAt != null,
      },
    ];

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...statuses.asMap().entries.map((entry) {
          final idx = entry.key;
          final status = entry.value;
          final isActive = status['active'] as bool;
          final isLast = idx == statuses.length - 1;

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Timeline circle
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive
                          ? Theme.of(context).primaryColor
                          : Colors.grey.shade300,
                    ),
                    child: Icon(
                      isActive ? Icons.check_rounded : Icons.circle,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Timeline label and date
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        status['label'] as String,
                        style: GoogleFonts.figtree(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Theme.of(
                            context,
                          ).primaryTextTheme.bodyLarge?.color,
                        ),
                      ),
                      if (status['date'] != null)
                        Text(
                          status['date'].toString().substring(0, 10),
                          style: GoogleFonts.figtree(
                            fontSize: 12,
                            color: Theme.of(
                              context,
                            ).primaryTextTheme.bodySmall?.color,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
              if (!isLast)
                Padding(
                  padding: const EdgeInsets.only(left: 15, top: 8, bottom: 8),
                  child: Container(
                    width: 2,
                    height: 24,
                    color: isActive
                        ? Theme.of(context).primaryColor
                        : Colors.grey.shade300,
                  ),
                ),
            ],
          );
        }),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.figtree(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: Theme.of(context).primaryTextTheme.bodyLarge?.color,
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.figtree(
              fontSize: 14,
              color: Theme.of(context).primaryTextTheme.bodySmall?.color,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.figtree(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).primaryTextTheme.bodyLarge?.color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpkSection(LpjDetail lpj) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          _buildSpkRow(
            'Kesesuaian Waktu',
            lpj.spkKesesuaianWaktu?.toString() ?? '-',
          ),
          const Divider(),
          _buildSpkRow(
            'Kesesuaian Output (IKU)',
            lpj.spkKesesuaianOutput == 100
                ? 'Sesuai'
                : (lpj.spkKesesuaianOutput == 0 ? 'Tidak Sesuai' : '-'),
          ),
          const Divider(),
          _buildSpkRow(
            'Ketepatan Anggaran',
            lpj.spkKetepatanAnggaran?.toString() ?? '-',
          ),
          const Divider(),
          _buildSpkRow(
            'Ketepatan Waktu LPJ',
            lpj.spkKetepatanWaktuLpj?.toString() ?? '-',
          ),
        ],
      ),
    );
  }

  Widget _buildSpkRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.figtree(
              fontSize: 13,
              color: Theme.of(context).primaryTextTheme.bodySmall?.color,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.figtree(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryTextTheme.bodyLarge?.color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRealizationTable(LpjDetail lpj) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(12),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: [
            DataColumn(
              label: Text(
                'Item',
                style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
              ),
            ),
            DataColumn(
              label: Text(
                'Diusulkan',
                style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
              ),
            ),
            DataColumn(
              label: Text(
                'Realisasi',
                style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
              ),
            ),
            DataColumn(
              label: Text(
                '%',
                style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
              ),
            ),
          ],
          rows: (lpj.anggaranItems).map((item) {
            return DataRow(
              cells: [
                DataCell(
                  SizedBox(
                    width: 150,
                    child: Text(
                      item.uraian.isEmpty ? '-' : item.uraian,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.figtree(fontSize: 12),
                    ),
                  ),
                ),
                DataCell(
                  Text(
                    'Rp ${_formatCurrency(item.jumlahDiusulkan)}',
                    style: GoogleFonts.figtree(fontSize: 12),
                  ),
                ),
                DataCell(
                  Text(
                    'Rp ${_formatCurrency(item.realisasiJumlah)}',
                    style: GoogleFonts.figtree(fontSize: 12),
                  ),
                ),
                DataCell(
                  Text(
                    '${item.percentageRealized.toStringAsFixed(1)}%',
                    style: GoogleFonts.figtree(fontSize: 12),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildApprovalStatus(LpjDetail lpj) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Status: ',
                style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
              ),
              _buildStatusBadge(lpj.approvalStatus),
            ],
          ),
          const SizedBox(height: 12),
          if (lpj.approvalNotes != null) ...[
            Text(
              'Catatan:',
              style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              lpj.approvalNotes ?? '',
              style: GoogleFonts.figtree(fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, LpjDetail lpj) {
    final provider = context.read<LpjProvider>();

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (lpj.lpjStatus == 'Draft')
          ElevatedButton(
            onPressed: () {
              // Navigate to form to edit
              Navigator.pop(context);
            },
            child: const Text('Edit'),
          ),
        if (lpj.lpjStatus == 'Revision Requested')
          ElevatedButton(
            onPressed: () {
              // Navigate to form to resubmit
              Navigator.pop(context);
            },
            child: const Text('Resubmit'),
          ),
        if (lpj.lpjStatus == 'Submitted')
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ElevatedButton(
                onPressed: () async {
                  final success = await provider.approveLpj(lpj.kegiatanId);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          success ? 'LPJ disetujui' : 'Gagal menyetujui LPJ',
                        ),
                      ),
                    );
                    if (success) Navigator.pop(context);
                  }
                },
                child: const Text('Approve'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                onPressed: () {
                  // Show revision dialog
                  _showRevisionDialog(context, provider, lpj);
                },
                child: const Text('Request Revision'),
              ),
            ],
          ),
        if (lpj.lpjStatus == 'Approved')
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
            onPressed: () async {
              final success = await provider.completeLpj(lpj.kegiatanId);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      success ? 'LPJ diselesaikan' : 'Gagal menyelesaikan LPJ',
                    ),
                  ),
                );
                if (success) Navigator.pop(context);
              }
            },
            child: const Text('Complete'),
          ),
      ],
    );
  }

  void _showRevisionDialog(
    BuildContext context,
    LpjProvider provider,
    LpjDetail lpj,
  ) {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Request Revision'),
          content: TextField(
            controller: controller,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Masukkan catatan revisi...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (controller.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Catatan tidak boleh kosong')),
                  );
                  return;
                }

                final success = await provider.reviseLpj(
                  kegiatanId: lpj.kegiatanId,
                  catatan: controller.text,
                );

                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        success ? 'Revisi dikirim' : 'Gagal mengirim revisi',
                      ),
                    ),
                  );
                  if (success) Navigator.pop(context);
                }
              },
              child: const Text('Kirim'),
            ),
          ],
        );
      },
    );
  }

  String _formatCurrency(double? value) {
    if (value == null) return '0';
    return value
        .toStringAsFixed(0)
        .replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        );
  }
}
