import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/lpj_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/lpj_provider.dart';
import 'lpj_form_page.dart';

class LpjDetailPage extends StatefulWidget {
  final String kegiatanId;

  const LpjDetailPage({super.key, required this.kegiatanId});

  @override
  State<LpjDetailPage> createState() => _LpjDetailPageState();
}

class _LpjDetailPageState extends State<LpjDetailPage> {
  final Map<String, String> _itemComments = {};

  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<LpjProvider>().getLpjDetail(widget.kegiatanId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF0F172A),
        title: Text(
          'Detail LPJ',
          style: GoogleFonts.figtree(fontWeight: FontWeight.w800),
        ),
      ),
      body: Consumer2<AuthProvider, LpjProvider>(
        builder: (context, authProvider, lpjProvider, _) {
          if (lpjProvider.isLoading && lpjProvider.selectedLpj == null) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF33C8DA)),
            );
          }

          final detail = lpjProvider.selectedLpj;
          if (detail == null) {
            return _buildEmptyState();
          }

          return RefreshIndicator(
            onRefresh: () => lpjProvider.getLpjDetail(widget.kegiatanId),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildHeader(detail),
                  _buildTableSection(detail, authProvider.user?.roleId),
                  const SizedBox(height: 16),
                  _buildSpkSection(detail),
                  const SizedBox(height: 16),
                  _buildTimeline(detail),
                  const SizedBox(height: 16),
                  _buildApprovalCard(detail),
                  const SizedBox(height: 16),
                  _buildActionArea(
                    context,
                    lpjProvider,
                    detail,
                    authProvider.user?.roleId,
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(LpjDetail detail) {
    return Container(
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  detail.namaKegiatan,
                  style: GoogleFonts.figtree(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ),
              _Badge(
                label: detail.statusDisplay,
                color: _statusColor(detail.lpjStatus),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildCompactStat('Diusulkan', _formatCurrency(detail.totalAnggaranDiusulkan)),
              const SizedBox(width: 16),
              _buildCompactStat('Realisasi', _formatCurrency(detail.totalRealisasi)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompactStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.figtree(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF64748B),
          ),
        ),
        Text(
          value,
          style: GoogleFonts.figtree(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }

  Widget _buildTableSection(LpjDetail detail, int? roleId) {
    final isBendahara = roleId == 6;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(Icons.table_chart_outlined, size: 20, color: Color(0xFF33C8DA)),
              const SizedBox(width: 8),
              Text(
                'Tabel Rincian Realisasi',
                style: GoogleFonts.figtree(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: DataTable(
              columnSpacing: 24,
              horizontalMargin: 20,
              headingRowHeight: 56,
              columns: [
                const DataColumn(label: Text('Uraian')),
                const DataColumn(label: Text('Diusulkan'), numeric: true),
                const DataColumn(label: Text('Realisasi')),
                const DataColumn(label: Text('Persentase'), numeric: true),
                if (isBendahara && detail.isSubmitted) const DataColumn(label: Text('Review')),
              ],
              rows: detail.anggaranItems.map((item) {
                return DataRow(
                  cells: [
                  DataCell(
                    SizedBox(
                      width: 150,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.uraianKegiatan,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                  DataCell(Text(_formatCurrency(item.jumlahDiusulkan))),
                  DataCell(
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_formatCurrency(item.realisasiJumlah), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
                        Text(
                          '${item.realisasiVolume1 ?? '-'} x ${item.realisasiVolume2 ?? '1'} x ${item.realisasiVolume3 ?? '1'}',
                          style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  ),
                  DataCell(
                    Text(
                      '${item.percentageRealized.toStringAsFixed(1)}%',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: item.percentageRealized > 100 ? Colors.red : Colors.blueGrey,
                      ),
                    ),
                  ),
                  if (isBendahara && detail.isSubmitted)
                    DataCell(
                      IconButton(
                        icon: Icon(
                          _itemComments.containsKey(item.anggaranId) ? Icons.comment : Icons.add_comment_outlined,
                          color: _itemComments.containsKey(item.anggaranId) ? Colors.orange : Colors.grey,
                          size: 20,
                        ),
                        onPressed: () => _showItemCommentDialog(item),
                      ),
                    ),
                ]);
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSpkSection(LpjDetail detail) {
    final spkWaktu = (detail.spkKesesuaianWaktu ?? 50).toDouble();
    final spkOutput = (detail.spkKesesuaianOutput ?? 0).toDouble();
    
    // Prediction logic
    final totalBudget = detail.totalAnggaranDiusulkan;
    final totalRealization = detail.totalRealisasi;
    
    int predictedAnggaranScore = 100;
    if (totalBudget > 0) {
        final ratio = totalRealization / totalBudget;
        final diff = (1 - ratio).abs() * 100;
        predictedAnggaranScore = (100 - diff).round().clamp(50, 100);
    }

    final totalScore = ((spkWaktu * 0.25) + (predictedAnggaranScore * 0.25) + (spkOutput * 0.25) + (100 * 0.25));

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.analytics_outlined, color: Color(0xFF33C8DA)),
              const SizedBox(width: 10),
              Text(
                'Evaluasi Kinerja (SPK)',
                style: GoogleFonts.figtree(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildSpkStat('Kesesuaian Waktu', '${spkWaktu.round()}%'),
          const SizedBox(height: 12),
          _buildSpkStat('Kesesuaian Output (IKU)', spkOutput == 100 ? 'Sesuai IKU' : 'Tidak Sesuai IKU'),
          const SizedBox(height: 12),
          _buildSpkStat('Ketepatan Anggaran', '$predictedAnggaranScore/100'),
          const SizedBox(height: 16),
          const Divider(color: Colors.white24),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Skor Akhir (Weighted):', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
              Text(
                totalScore.toStringAsFixed(2),
                style: GoogleFonts.figtree(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF33C8DA),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpkStat(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildTimeline(LpjDetail detail) {
    final items = [
      _TimelineItemData('Draft', detail.isDraft),
      _TimelineItemData('Submitted', detail.lpjSubmittedAt != null),
      _TimelineItemData('Approved', detail.lpjApprovedAt != null),
      _TimelineItemData('Completed', detail.lpjCompletedAt != null),
    ];

    return Container(
      padding: const EdgeInsets.all(18),
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Timeline LPJ',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 14),
          ...items.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            final isLast = index == items.length - 1;
            final timestamp = _timelineTimestamp(detail, item.label);

            return Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        color: item.active
                            ? const Color(0xFF33C8DA)
                            : const Color(0xFFE2E8F0),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        item.active ? Icons.check_rounded : Icons.circle,
                        color: Colors.white,
                        size: 14,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.label,
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          Text(
                            timestamp,
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (!isLast)
                  Padding(
                    padding: const EdgeInsets.only(left: 12, top: 8, bottom: 8),
                    child: Container(
                      width: 2,
                      height: 18,
                      color: item.active
                          ? const Color(0xFF33C8DA)
                          : const Color(0xFFE2E8F0),
                    ),
                  ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildApprovalCard(LpjDetail detail) {
    return Container(
      padding: const EdgeInsets.all(18),
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Status Persetujuan',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Bendahara LPJ',
                style: GoogleFonts.figtree(
                  color: const Color(0xFF64748B),
                  fontWeight: FontWeight.w600,
                ),
              ),
              _Badge(
                label: detail.approvalStatus,
                color: const Color(0xFF8B5CF6),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionArea(
    BuildContext context,
    LpjProvider provider,
    LpjDetail detail,
    int? roleId,
  ) {
    // Pengusul Actions
    if (roleId == 3 && detail.canEditPengusul) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () async {
              final result = await Navigator.push<bool>(
                context,
                MaterialPageRoute(
                  builder: (_) => LpjFormPage(kegiatanId: detail.kegiatanId),
                ),
              );

              if (!mounted) return;
              if (result == true) {
                await provider.getLpjDetail(detail.kegiatanId);
              }
            },
            icon: const Icon(Icons.edit_note_rounded),
            label: Text(
              detail.isRevisionRequested
                  ? 'Submit Ulang LPJ'
                  : 'Edit / Submit LPJ',
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF33C8DA),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              shadowColor: const Color(0xFF33C8DA).withOpacity(0.4),
            ),
          ),
        ),
      );
    }

    // Bendahara Actions (Role 6)
    if (roleId == 6 && detail.isSubmitted) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => LpjFormPage(kegiatanId: detail.kegiatanId),
                    ),
                  );
                },
                icon: const Icon(Icons.rate_review_outlined),
                label: const Text('Buka Form Review'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF64748B),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: provider.isSubmitting
                        ? null
                        : () => _showReviseDialog(context, provider, detail),
                    icon: const Icon(Icons.assignment_return_outlined),
                    label: const Text('Revisi'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.orange,
                      side: const BorderSide(color: Colors.orange),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: provider.isSubmitting
                        ? null
                        : () async {
                            final ok = await _showConfirmDialog(
                              context,
                              'Approve LPJ',
                              'Apakah Anda yakin ingin menyetujui LPJ ini?',
                            );
                            if (ok == true) {
                              final success = await provider.approveLpj(detail.kegiatanId);
                              if (success && mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('LPJ berhasil disetujui')),
                                );
                              }
                            }
                          },
                    icon: const Icon(Icons.check_circle_outline),
                    label: const Text('Approve'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(
        roleId == 3
            ? 'LPJ ini sedang diproses. Tunggu status berubah atau buka kembali setelah ada catatan revisi.'
            : 'Tidak ada aksi yang tersedia untuk status LPJ ini.',
        textAlign: TextAlign.center,
        style: GoogleFonts.figtree(color: const Color(0xFF475569)),
      ),
    );
  }

  Future<bool?> _showConfirmDialog(BuildContext context, String title, String content) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Ya, Lanjutkan'),
          ),
        ],
      ),
    );
  }

  void _showItemCommentDialog(LpjRealization item) {
    final controller = TextEditingController(text: _itemComments[item.anggaranId]);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Catatan Revisi: ${item.uraianKegiatan}',
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Masukkan catatan spesifik untuk item ini...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                if (controller.text.trim().isEmpty) {
                  _itemComments.remove(item.anggaranId);
                } else {
                  _itemComments[item.anggaranId] = controller.text.trim();
                }
              });
              Navigator.pop(context);
            },
            child: const Text('Simpan Catatan'),
          ),
        ],
      ),
    );
  }

  void _showReviseDialog(BuildContext context, LpjProvider provider, LpjDetail detail) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Minta Revisi LPJ'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_itemComments.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(
                  'Anda telah memberikan ${_itemComments.length} catatan pada item anggaran.',
                  style: const TextStyle(fontSize: 12, color: Colors.orange, fontWeight: FontWeight.bold),
                ),
              ),
            TextField(
              controller: controller,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Masukkan catatan umum revisi...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final generalNote = controller.text.trim();
              if (generalNote.isEmpty && _itemComments.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Berikan setidaknya satu catatan (umum atau per item)')),
                );
                return;
              }
              
              Navigator.pop(context);
              
              // Prepare per-item comments for API
              final anggaranComments = _itemComments.entries.map((e) => {
                'id': int.tryParse(e.key),
                'catatan_reviewer': e.value,
              }).where((element) => element['id'] != null).toList();

              final success = await provider.reviseLpj(
                kegiatanId: detail.kegiatanId,
                catatan: generalNote.isNotEmpty ? generalNote : null,
                anggaranComments: anggaranComments.isNotEmpty ? anggaranComments : null,
              );

              if (success && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Catatan revisi telah dikirim')),
                );
                setState(() {
                  _itemComments.clear();
                });
              }
            },
            child: const Text('Kirim Catatan'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.description_outlined,
              size: 64,
              color: Color(0xFF94A3B8),
            ),
            const SizedBox(height: 16),
            Text(
              'Data LPJ tidak ditemukan',
              style: GoogleFonts.figtree(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Silakan tarik untuk memuat ulang data.',
              style: GoogleFonts.figtree(color: const Color(0xFF64748B)),
            ),
          ],
        ),
      ),
    );
  }

  String _timelineTimestamp(LpjDetail detail, String label) {
    final raw = switch (label) {
      'Draft' => detail.lpjSubmittedAt,
      'Submitted' => detail.lpjSubmittedAt,
      'Approved' => detail.lpjApprovedAt,
      'Completed' => detail.lpjCompletedAt,
      _ => null,
    };

    if (raw == null || raw.isEmpty) {
      return 'Belum tercatat';
    }

    final date = DateTime.tryParse(raw);
    if (date == null) return raw;
    return DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(date);
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Draft': return const Color(0xFF3B82F6);
      case 'Submitted': return const Color(0xFFF59E0B);
      case 'Approved': return const Color(0xFF10B981);
      case 'Revision Requested': return const Color(0xFFF97316);
      case 'Completed': return const Color(0xFF8B5CF6);
      default: return const Color(0xFF64748B);
    }
  }

  String _formatCurrency(double value) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(value);
  }
}

class _TimelineItemData {
  final String label;
  final bool active;
  _TimelineItemData(this.label, this.active);
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: color.withOpacity(0.16), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: GoogleFonts.figtree(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}
