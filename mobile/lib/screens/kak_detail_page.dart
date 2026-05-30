import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../models/kak_model.dart';
import '../providers/kak_detail_provider.dart';
import 'pengusul/kak_edit_page.dart';

class KakDetailPage extends StatefulWidget {
  final String kakId;
  final bool embedMode;

  const KakDetailPage({super.key, required this.kakId, this.embedMode = false});

  static const String routeName = 'kakDetail';
  static const String routePath = '/kak-detail/:kakId';

  @override
  State<KakDetailPage> createState() => _KakDetailPageState();
}

class _KakDetailPageState extends State<KakDetailPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<KakDetailProvider>().loadKakDetail(widget.kakId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    final bodyContent = Consumer<KakDetailProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return Center(
            child: CircularProgressIndicator(color: colorScheme.primary),
          );
        }

        if (provider.isError) {
          return Center(
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
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Text(
                    provider.errorMessage ?? 'Unknown error',
                    style: GoogleFonts.figtree(
                      fontSize: 14,
                      color: colorScheme.onSurfaceVariant,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () => provider.retry(widget.kakId),
                  child: Text(
                    'Coba Lagi',
                    style: GoogleFonts.figtree(fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
          );
        }

        if (!provider.hasData || provider.kakDetail == null) {
          return Center(
            child: Text(
              'Data KAK tidak ditemukan',
              style: GoogleFonts.figtree(
                fontSize: 14,
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          );
        }

        final kak = provider.kakDetail!;

        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header dengan Status
              _HeaderSection(kak: kak, colorScheme: colorScheme),

              // Informasi Umum
              _InfoUmumSection(kak: kak, colorScheme: colorScheme),

              // Sasaran & Target
              _SasaranTargetSection(kak: kak, colorScheme: colorScheme),

              // Manfaat
              if (kak.manfaat.isNotEmpty)
                _ManfaatSection(kak: kak, colorScheme: colorScheme),

              // Tahapan
              if (kak.tahapan.isNotEmpty)
                _TahapanSection(kak: kak, colorScheme: colorScheme),

              // Indikator Kinerja
              if (kak.indikatorKinerja.isNotEmpty)
                _IndikatorKinerjaSection(
                  kak: kak,
                  colorScheme: colorScheme,
                ),

              // RAB (Rencana Anggaran Biaya)
              if (kak.rab.isNotEmpty)
                _RabSection(kak: kak, colorScheme: colorScheme),

              // Approvals
              if (kak.approvals.isNotEmpty)
                _ApprovalsSection(kak: kak, colorScheme: colorScheme),

              // Action Buttons
              if (!widget.embedMode)
                _ActionsSection(
                  kak: kak,
                  provider: provider,
                  colorScheme: colorScheme,
                ),

              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );

    if (widget.embedMode) {
      return bodyContent;
    }

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        backgroundColor: colorScheme.surface,
        appBar: AppBar(
          backgroundColor: colorScheme.surface,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: colorScheme.onSurface),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            'Detail KAK',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.bold,
              fontSize: 18,
              color: colorScheme.onSurface,
            ),
          ),
        ),
        body: bodyContent,
      ),
    );
  }
}

// Header Section
class _HeaderSection extends StatelessWidget {
  final KakDetail kak;
  final ColorScheme colorScheme;

  const _HeaderSection({required this.kak, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          bottom: BorderSide(color: colorScheme.outline, width: 1),
        ),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // KAK ID & Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      kak.namaKegiatan,
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: colorScheme.onSurface,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'KAK ${kak.kakId}',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: colorScheme.onSurfaceVariant,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Container(
                decoration: BoxDecoration(
                  color: _getStatusColor(kak.statusId, colorScheme),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                child: Text(
                  kak.statusNama,
                  style: GoogleFonts.figtree(
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                    color: _getStatusTextColor(kak.statusId, colorScheme),
                    height: 1.2,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Meta Info Row
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tipe Kegiatan',
                      style: GoogleFonts.figtree(
                        fontSize: 11,
                        color: colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      kak.tipe ?? 'N/A',
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Pengusul',
                      style: GoogleFonts.figtree(
                        fontSize: 11,
                        color: colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      kak.pengusulNama ?? 'Unknown',
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Diperbarui',
                      style: GoogleFonts.figtree(
                        fontSize: 11,
                        color: colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      kak.updatedAt,
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(int statusId, ColorScheme colorScheme) {
    switch (statusId) {
      case 1:
        return Color(0xFFFFF3E0); // Draft - Orange
      case 2:
        return Color(0xFFE3F2FD); // Review - Blue
      case 3:
        return Color(0xFFE8F5E9); // Approved - Green
      case 4:
      case 5:
        return Color(0xFFFFEBEE); // Rejected - Red
      default:
        return colorScheme.surfaceVariant;
    }
  }

  Color _getStatusTextColor(int statusId, ColorScheme colorScheme) {
    switch (statusId) {
      case 1:
        return Color(0xFFE65100); // Draft - Orange
      case 2:
        return Color(0xFF1565C0); // Review - Blue
      case 3:
        return Color(0xFF2E7D32); // Approved - Green
      case 4:
      case 5:
        return Color(0xFFC62828); // Rejected - Red
      default:
        return colorScheme.onSurface;
    }
  }
}

// Informasi Umum Section
class _InfoUmumSection extends StatelessWidget {
  final KakDetail kak;
  final ColorScheme colorScheme;

  const _InfoUmumSection({required this.kak, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Informasi Umum',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          _InfoField(
            label: 'Deskripsi Kegiatan',
            value: kak.deskripsiKegiatan,
            colorScheme: colorScheme,
          ),
          const SizedBox(height: 16),
          _InfoField(
            label: 'Metode Pelaksanaan',
            value: kak.metodePelaksanaan,
            colorScheme: colorScheme,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _CompactInfoField(
                  label: 'Tanggal Mulai',
                  value: kak.tanggalMulai,
                  colorScheme: colorScheme,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _CompactInfoField(
                  label: 'Tanggal Selesai',
                  value: kak.tanggalSelesai,
                  colorScheme: colorScheme,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _InfoField(
            label: 'Lokasi',
            value: kak.lokasi,
            colorScheme: colorScheme,
          ),
          const SizedBox(height: 16),
          _CompactInfoField(
            label: 'Kurun Waktu Pelaksanaan',
            value: kak.kurunWaktuPelaksanaan,
            colorScheme: colorScheme,
          ),
        ],
      ),
    );
  }
}

// Sasaran & Target Section
class _SasaranTargetSection extends StatelessWidget {
  final KakDetail kak;
  final ColorScheme colorScheme;

  const _SasaranTargetSection({required this.kak, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Sasaran & Target',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          _InfoField(
            label: 'Sasaran Utama',
            value: kak.sasaranUtama,
            colorScheme: colorScheme,
          ),
        ],
      ),
    );
  }
}

// Manfaat Section
class _ManfaatSection extends StatelessWidget {
  final KakDetail kak;
  final ColorScheme colorScheme;

  const _ManfaatSection({required this.kak, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Manfaat',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 12),
          ...kak.manfaat.asMap().entries.map((e) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: colorScheme.primary,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${e.key + 1}',
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: colorScheme.onPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      e.value.manfaat,
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        color: colorScheme.onSurface,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}

// Tahapan Section
class _TahapanSection extends StatelessWidget {
  final KakDetail kak;
  final ColorScheme colorScheme;

  const _TahapanSection({required this.kak, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tahapan Kegiatan',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 12),
          ...kak.tahapan.map((tahap) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(color: colorScheme.outline, width: 1),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: colorScheme.primary,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${tahap.urutan}',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: colorScheme.onPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        tahap.namaTahapan,
                        style: GoogleFonts.figtree(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: colorScheme.onSurface,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}

// Indikator Kinerja Section
class _IndikatorKinerjaSection extends StatelessWidget {
  final KakDetail kak;
  final ColorScheme colorScheme;

  const _IndikatorKinerjaSection({
    required this.kak,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Indikator Kinerja',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowColor: WidgetStatePropertyAll(
                colorScheme.primary.withOpacity(0.1),
              ),
              columns: [
                DataColumn(
                  label: Text(
                    'Bulan',
                    style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
                  ),
                ),
                DataColumn(
                  label: Text(
                    'Deskripsi',
                    style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
                  ),
                ),
                DataColumn(
                  label: Text(
                    '%',
                    style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
                  ),
                  numeric: true,
                ),
              ],
              rows: kak.indikatorKinerja
                  .map(
                    (ind) => DataRow(
                      cells: [
                        DataCell(
                          Text(
                            ind.bulanIndikator,
                            style: GoogleFonts.figtree(fontSize: 12),
                          ),
                        ),
                        DataCell(
                          Text(
                            ind.deskripsiTarget,
                            style: GoogleFonts.figtree(fontSize: 12),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        DataCell(
                          Text(
                            '${ind.persentaseTarget.toStringAsFixed(1)}%',
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}

// RAB Section
class _RabSection extends StatelessWidget {
  final KakDetail kak;
  final ColorScheme colorScheme;

  const _RabSection({required this.kak, required this.colorScheme});

  String _formatCurrency(double value) {
    final formatter = NumberFormatHelper();
    return formatter.format(value.toInt());
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Rencana Anggaran Biaya (RAB)',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 12),
          ...kak.rab.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(color: colorScheme.outline, width: 1),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.uraian,
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (item.volume1 != null)
                      _RabDetailRow('Volume 1', '${item.volume1}', colorScheme),
                    if (item.volume2 != null)
                      _RabDetailRow('Volume 2', '${item.volume2}', colorScheme),
                    if (item.volume3 != null)
                      _RabDetailRow('Volume 3', '${item.volume3}', colorScheme),
                    if (item.hargaSatuan != null)
                      _RabDetailRow(
                        'Harga Satuan',
                        _formatCurrency(item.hargaSatuan!),
                        colorScheme,
                      ),
                    if (item.jumlahDiusulkan != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: colorScheme.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Jumlah Diusulkan',
                                style: GoogleFonts.figtree(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                  color: colorScheme.onSurface,
                                ),
                              ),
                              Text(
                                _formatCurrency(item.jumlahDiusulkan!),
                                style: GoogleFonts.figtree(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: colorScheme.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          }).toList(),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colorScheme.primary, width: 2),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Anggaran',
                  style: GoogleFonts.figtree(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: colorScheme.onSurface,
                  ),
                ),
                Text(
                  _formatCurrency(kak.getTotalBudget()),
                  style: GoogleFonts.figtree(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: colorScheme.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _RabDetailRow(String label, String value, ColorScheme colorScheme) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.figtree(
              fontSize: 12,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.figtree(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }
}

// Approvals Section
class _ApprovalsSection extends StatelessWidget {
  final KakDetail kak;
  final ColorScheme colorScheme;

  const _ApprovalsSection({required this.kak, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Alur Persetujuan',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 12),
          ...kak.approvals.asMap().entries.map((e) {
            final approval = e.value;
            final isLast = e.key == kak.approvals.length - 1;
            final isApproved = approval.status.toLowerCase() == 'approved';

            return Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Timeline Circle
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: isApproved
                            ? Color(0xFF2E7D32)
                            : colorScheme.surfaceVariant,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        isApproved ? Icons.check_rounded : Icons.schedule,
                        color: isApproved
                            ? Colors.white
                            : colorScheme.onSurfaceVariant,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Content
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            approval.approverNama,
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            approval.status,
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              color: isApproved
                                  ? Color(0xFF2E7D32)
                                  : colorScheme.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (approval.tanggal != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                approval.tanggal ?? '',
                                style: GoogleFonts.figtree(
                                  fontSize: 11,
                                  color: colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ),
                          if (approval.catatan != null &&
                              approval.catatan!.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: colorScheme.surfaceVariant.withOpacity(
                                    0.5,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  approval.catatan ?? '',
                                  style: GoogleFonts.figtree(
                                    fontSize: 12,
                                    color: colorScheme.onSurfaceVariant,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (!isLast)
                  Padding(
                    padding: const EdgeInsets.only(left: 20, top: 8, bottom: 8),
                    child: Container(
                      width: 2,
                      height: 24,
                      color: colorScheme.outline,
                    ),
                  ),
              ],
            );
          }).toList(),
        ],
      ),
    );
  }
}

// Actions Section
class _ActionsSection extends StatelessWidget {
  final KakDetail kak;
  final KakDetailProvider provider;
  final ColorScheme colorScheme;

  const _ActionsSection({
    required this.kak,
    required this.provider,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: [
          if (kak.isEditable())
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          KakEditPage(kakId: int.parse(kak.kakId ?? '0')),
                    ),
                  ).then((result) {
                    if (result == true) {
                      // Reload KAK detail after edit
                      provider.loadKakDetail(kak.kakId!);
                    }
                  });
                },
                child: Text(
                  'Edit',
                  style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          if (kak.isEditable()) const SizedBox(width: 12),
          if (kak.isEditable())
            Expanded(
              child: FilledButton(
                onPressed: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: Text(
                        'Submit KAK',
                        style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
                      ),
                      content: Text(
                        'Apakah Anda yakin ingin mengirimkan KAK ini untuk review?',
                        style: GoogleFonts.figtree(),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: Text('Batal', style: GoogleFonts.figtree()),
                        ),
                        FilledButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: Text(
                            'Submit',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );

                  if (confirmed == true) {
                    final success = await provider.submitKak();
                    if (success) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('KAK berhasil dikirim untuk review'),
                            backgroundColor: Color(0xFF2E7D32),
                          ),
                        );
                      }
                    }
                  }
                },
                child: Text(
                  'Submit',
                  style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          if (!kak.isEditable()) const SizedBox(width: 12),
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Tutup',
                style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Reusable Info Field Widget
class _InfoField extends StatelessWidget {
  final String label;
  final String value;
  final ColorScheme colorScheme;

  const _InfoField({
    required this.label,
    required this.value,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.figtree(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: colorScheme.surfaceVariant.withOpacity(0.3),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: colorScheme.outline, width: 0.5),
          ),
          child: Text(
            value,
            style: GoogleFonts.figtree(
              fontSize: 13,
              color: colorScheme.onSurface,
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }
}

// Compact Info Field Widget
class _CompactInfoField extends StatelessWidget {
  final String label;
  final String value;
  final ColorScheme colorScheme;

  const _CompactInfoField({
    required this.label,
    required this.value,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.figtree(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: colorScheme.surfaceVariant.withOpacity(0.3),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: colorScheme.outline, width: 0.5),
          ),
          child: Text(
            value,
            style: GoogleFonts.figtree(
              fontSize: 12,
              color: colorScheme.onSurface,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

// Currency Formatter Helper
class NumberFormatHelper {
  String format(int value) {
    final parts = <String>[];
    var num = value;

    if (num < 0) {
      return '-${format(-num)}';
    }

    while (num > 0) {
      final part = (num % 1000).toString().padLeft(num >= 1000 ? 3 : 0, '0');
      parts.insert(0, part);
      num ~/= 1000;
    }

    final formatted = parts.join('.');
    return 'Rp $formatted';
  }
}
