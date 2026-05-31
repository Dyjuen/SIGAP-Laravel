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
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildHeader(detail),
                  const SizedBox(height: 16),
                  _buildSummary(detail),
                  const SizedBox(height: 16),
                  _buildTimeline(detail),
                  const SizedBox(height: 16),
                  _buildRealizationList(detail),
                  const SizedBox(height: 16),
                  _buildApprovalCard(detail),
                  const SizedBox(height: 16),
                  _buildActionArea(
                    context,
                    lpjProvider,
                    detail,
                    authProvider.user?.roleId,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(LpjDetail detail) {
    final statusColor = _statusColor(detail.lpjStatus);
    final deadlineText = detail.tglBatasLpj != null
        ? _deadlineLabel(detail.tglBatasLpj!)
        : 'Batas LPJ belum ditentukan';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            detail.namaKegiatan,
            style: GoogleFonts.figtree(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Badge(label: detail.statusDisplay, color: statusColor),
              _Badge(
                label: detail.approvalStatus,
                color: const Color(0xFF38BDF8),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            deadlineText,
            style: GoogleFonts.figtree(
              color: Colors.white.withOpacity(0.86),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummary(LpjDetail detail) {
    return Row(
      children: [
        Expanded(
          child: _SummaryCard(
            label: 'Diusulkan',
            value: _formatCurrency(detail.totalAnggaranDiusulkan),
            icon: Icons.account_balance_wallet_outlined,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _SummaryCard(
            label: 'Realisasi',
            value: _formatCurrency(detail.totalRealisasi),
            icon: Icons.receipt_long_outlined,
          ),
        ),
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

  Widget _buildRealizationList(LpjDetail detail) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Detail Realisasi',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 12),
          ...detail.anggaranItems.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.mataAnggaranNama,
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 8),
                    _DetailRow(
                      label: 'Diusulkan',
                      value: _formatCurrency(item.jumlahDiusulkan),
                    ),
                    _DetailRow(
                      label: 'Realisasi',
                      value: _formatCurrency(item.realisasiJumlah),
                    ),
                    _DetailRow(
                      label: 'Persentase',
                      value: '${item.percentageRealized.toStringAsFixed(1)}%',
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildApprovalCard(LpjDetail detail) {
    return Container(
      padding: const EdgeInsets.all(18),
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
          if (detail.approvalNotes != null &&
              detail.approvalNotes!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'Catatan',
              style: GoogleFonts.figtree(
                color: const Color(0xFF64748B),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              detail.approvalNotes!,
              style: GoogleFonts.figtree(color: const Color(0xFF0F172A)),
            ),
          ],
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
    if (detail.canEditPengusul) {
      return SizedBox(
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
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(
        roleId == 3
            ? 'LPJ ini sedang diproses. Tunggu status berubah atau buka kembali setelah ada catatan revisi.'
            : 'Tidak ada aksi yang tersedia untuk status LPJ ini.',
        style: GoogleFonts.figtree(color: const Color(0xFF475569)),
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

  String _deadlineLabel(String rawValue) {
    final deadline = DateTime.tryParse(rawValue);
    if (deadline == null) return 'Batas LPJ: $rawValue';

    final remaining = deadline.difference(DateTime.now()).inDays;
    if (remaining > 0) {
      return 'Batas LPJ: ${DateFormat('dd MMM yyyy', 'id_ID').format(deadline)} • sisa $remaining hari';
    }
    if (remaining == 0) {
      return 'Batas LPJ: ${DateFormat('dd MMM yyyy', 'id_ID').format(deadline)} • jatuh tempo hari ini';
    }
    return 'Batas LPJ: ${DateFormat('dd MMM yyyy', 'id_ID').format(deadline)} • terlambat ${remaining.abs()} hari';
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Draft':
        return const Color(0xFF3B82F6);
      case 'Submitted':
        return const Color(0xFFF59E0B);
      case 'Approved':
        return const Color(0xFF10B981);
      case 'Revision Requested':
        return const Color(0xFFF97316);
      case 'Completed':
        return const Color(0xFF8B5CF6);
      default:
        return const Color(0xFF64748B);
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

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _SummaryCard({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF33C8DA)),
          const SizedBox(height: 12),
          Text(
            label,
            style: GoogleFonts.figtree(
              color: const Color(0xFF64748B),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.figtree(
              color: const Color(0xFF0F172A),
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: GoogleFonts.figtree(
              color: const Color(0xFF64748B),
              fontWeight: FontWeight.w600,
            ),
          ),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: GoogleFonts.figtree(
                color: const Color(0xFF0F172A),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;

  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.16),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: GoogleFonts.figtree(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
