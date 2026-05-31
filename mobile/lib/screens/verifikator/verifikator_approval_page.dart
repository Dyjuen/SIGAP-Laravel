import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../models/kak_model.dart';
import '../../providers/kak_detail_provider.dart';
import '../../services/kak_service.dart';
import '../../services/master_data_service.dart';
import '../kak_detail_page.dart';

class VerifikatorApprovalPage extends StatefulWidget {
  final int kakId;

  const VerifikatorApprovalPage({Key? key, required this.kakId})
    : super(key: key);

  @override
  State<VerifikatorApprovalPage> createState() =>
      _VerifikatorApprovalPageState();
}

class _VerifikatorApprovalPageState extends State<VerifikatorApprovalPage> {
  bool isProcessing = false;
  final TextEditingController catatanController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<KakDetailProvider>().loadKakDetail(widget.kakId.toString());
    });
  }

  void _showApproveDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return _ApproveBottomSheet(
          kakId: widget.kakId,
          onSubmit: (Map<String, dynamic> data) {
            Navigator.pop(context);
            _approveKakWithData(data);
          },
        );
      },
    );
  }

  Future<void> _approveKakWithData(Map<String, dynamic> budgetData) async {
    setState(() => isProcessing = true);

    try {
      final kakService = context.read<KakService>();
      await kakService.approveKak(widget.kakId.toString(), budgetData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('KAK berhasil disetujui'),
            backgroundColor: Color(0xFF2E7D32),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => isProcessing = false);
      }
    }
  }

  void _showRejectDialog() {
    catatanController.clear();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Tolak KAK',
          style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Berikan alasan penolakan (minimal 5 karakter):'),
            const SizedBox(height: 16),
            TextField(
              controller: catatanController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Alasan penolakan...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          FilledButton(
            onPressed: () {
              final note = catatanController.text.trim();
              if (note.length < 5) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Alasan penolakan minimal 5 karakter'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }
              Navigator.pop(context);
              _rejectKak();
            },
            child: const Text('Tolak'),
          ),
        ],
      ),
    );
  }

  Future<void> _rejectKak() async {
    setState(() => isProcessing = true);

    try {
      final kakService = context.read<KakService>();
      await kakService.rejectKak(
        widget.kakId.toString(),
        catatanController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('KAK berhasil ditolak'),
            backgroundColor: Color(0xFFD32F2F),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => isProcessing = false);
      }
    }
  }

  void _showRevisionDialog(KakDetail kak) {
    catatanController.clear();

    final parentNotes = <String, TextEditingController>{
      'nama_kegiatan': TextEditingController(),
      'tipe_kegiatan_id': TextEditingController(),
      'deskripsi_kegiatan': TextEditingController(),
      'metode_pelaksanaan': TextEditingController(),
      'tanggal': TextEditingController(),
      'lokasi': TextEditingController(),
      'sasaran_utama': TextEditingController(),
    };

    final childNotes = <String, List<TextEditingController>>{
      't_kak_manfaat': List.generate(
        kak.manfaat.length,
        (_) => TextEditingController(),
      ),
      't_kak_tahapan': List.generate(
        kak.tahapan.length,
        (_) => TextEditingController(),
      ),
      't_kak_target': List.generate(
        kak.indikatorKinerja.length,
        (_) => TextEditingController(),
      ),
      't_kak_iku': List.generate(
        kak.targetIku.length,
        (_) => TextEditingController(),
      ),
      't_kak_anggaran': List.generate(
        kak.rab.length,
        (_) => TextEditingController(),
      ),
    };
    final expandedNoteKeys = <String>{};

    void disposeAll() {
      catatanController.clear();
      for (final controller in parentNotes.values) {
        controller.dispose();
      }
      for (final controllers in childNotes.values) {
        for (final controller in controllers) {
          controller.dispose();
        }
      }
    }

    showDialog(
      barrierDismissible: false,
      context: context,
      builder: (dialogContext) {
        final height = MediaQuery.of(dialogContext).size.height * 0.86;

        return StatefulBuilder(
          builder: (context, setModalState) {
            void toggleNote(String key) {
              setModalState(() {
                if (expandedNoteKeys.contains(key)) {
                  expandedNoteKeys.remove(key);
                } else {
                  expandedNoteKeys.add(key);
                }
              });
            }

            return Dialog(
              insetPadding: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              child: SizedBox(
                width: double.maxFinite,
                height: height,
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.fromLTRB(24, 20, 16, 16),
                      decoration: const BoxDecoration(
                        color: Color(0xFF2E7D32),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(24),
                          topRight: Radius.circular(24),
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Minta Revisi KAK',
                                  style: GoogleFonts.figtree(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Layout mengikuti form pengusul, catatan muncul lewat tombol per field.',
                                  style: GoogleFonts.figtree(
                                    fontSize: 12,
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () {
                              Navigator.pop(dialogContext);
                              disposeAll();
                            },
                            icon: const Icon(Icons.close, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildRevisionSectionTitle('Informasi Umum KAK'),
                            const SizedBox(height: 12),
                            _buildRevisionFieldCard(
                              label: 'Nama Kegiatan',
                              value: kak.namaKegiatan,
                              noteController: parentNotes['nama_kegiatan']!,
                              hintText: 'Catatan untuk nama kegiatan...',
                              fieldKey: 'nama_kegiatan',
                              isExpanded: expandedNoteKeys.contains(
                                'nama_kegiatan',
                              ),
                              onToggle: () => toggleNote('nama_kegiatan'),
                            ),
                            _buildRevisionFieldCard(
                              label: 'Tipe Kegiatan',
                              value: kak.tipe ?? 'Tidak ada tipe kegiatan',
                              noteController: parentNotes['tipe_kegiatan_id']!,
                              hintText: 'Catatan untuk tipe kegiatan...',
                              fieldKey: 'tipe_kegiatan_id',
                              isExpanded: expandedNoteKeys.contains(
                                'tipe_kegiatan_id',
                              ),
                              onToggle: () => toggleNote('tipe_kegiatan_id'),
                            ),
                            _buildRevisionFieldCard(
                              label: 'Deskripsi Kegiatan',
                              value: kak.deskripsiKegiatan,
                              noteController:
                                  parentNotes['deskripsi_kegiatan']!,
                              hintText: 'Catatan untuk deskripsi kegiatan...',
                              fieldKey: 'deskripsi_kegiatan',
                              isExpanded: expandedNoteKeys.contains(
                                'deskripsi_kegiatan',
                              ),
                              onToggle: () => toggleNote('deskripsi_kegiatan'),
                            ),
                            _buildRevisionFieldCard(
                              label: 'Metode Pelaksanaan',
                              value: kak.metodePelaksanaan,
                              noteController:
                                  parentNotes['metode_pelaksanaan']!,
                              hintText: 'Catatan untuk metode pelaksanaan...',
                              fieldKey: 'metode_pelaksanaan',
                              isExpanded: expandedNoteKeys.contains(
                                'metode_pelaksanaan',
                              ),
                              onToggle: () => toggleNote('metode_pelaksanaan'),
                            ),
                            _buildRevisionFieldCard(
                              label: 'Tanggal',
                              value:
                                  'Mulai: ${kak.tanggalMulai}\nSelesai: ${kak.tanggalSelesai}',
                              noteController: parentNotes['tanggal']!,
                              hintText: 'Catatan untuk tanggal kegiatan...',
                              fieldKey: 'tanggal',
                              isExpanded: expandedNoteKeys.contains('tanggal'),
                              onToggle: () => toggleNote('tanggal'),
                            ),
                            _buildRevisionFieldCard(
                              label: 'Lokasi',
                              value: kak.lokasi,
                              noteController: parentNotes['lokasi']!,
                              hintText: 'Catatan untuk lokasi...',
                              fieldKey: 'lokasi',
                              isExpanded: expandedNoteKeys.contains('lokasi'),
                              onToggle: () => toggleNote('lokasi'),
                            ),
                            _buildRevisionFieldCard(
                              label: 'Sasaran Utama',
                              value: kak.sasaranUtama,
                              noteController: parentNotes['sasaran_utama']!,
                              hintText: 'Catatan untuk sasaran utama...',
                              fieldKey: 'sasaran_utama',
                              isExpanded: expandedNoteKeys.contains(
                                'sasaran_utama',
                              ),
                              onToggle: () => toggleNote('sasaran_utama'),
                            ),
                            Container(
                              width: double.infinity,
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Kurun Waktu Pelaksanaan',
                                    style: GoogleFonts.figtree(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: const Color(0xFF0F172A),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    kak.kurunWaktuPelaksanaan,
                                    style: GoogleFonts.figtree(
                                      fontSize: 13,
                                      color: const Color(0xFF475569),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Field ini dihitung otomatis dari tanggal mulai dan tanggal selesai.',
                                    style: GoogleFonts.figtree(
                                      fontSize: 11,
                                      color: const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            _buildRevisionSectionTitle('Manfaat'),
                            const SizedBox(height: 12),
                            if (kak.manfaat.isEmpty)
                              _buildRevisionEmptyState(
                                'Tidak ada data manfaat.',
                              )
                            else
                              ...kak.manfaat.asMap().entries.map((entry) {
                                final index = entry.key;
                                final item = entry.value;
                                final key = 't_kak_manfaat:$index';
                                return _buildChildRevisionCard(
                                  title: 'Manfaat ${index + 1}',
                                  details: [item.manfaat],
                                  noteController:
                                      childNotes['t_kak_manfaat']![index],
                                  hintText:
                                      'Catatan untuk manfaat ${index + 1}...',
                                  fieldKey: key,
                                  isExpanded: expandedNoteKeys.contains(key),
                                  onToggle: () => toggleNote(key),
                                );
                              }),
                            _buildRevisionSectionTitle('Tahapan Pelaksanaan'),
                            const SizedBox(height: 12),
                            if (kak.tahapan.isEmpty)
                              _buildRevisionEmptyState(
                                'Tidak ada data tahapan.',
                              )
                            else
                              ...kak.tahapan.asMap().entries.map((entry) {
                                final index = entry.key;
                                final item = entry.value;
                                final key = 't_kak_tahapan:$index';
                                return _buildChildRevisionCard(
                                  title: 'Tahapan ${item.urutan}',
                                  details: [item.namaTahapan],
                                  noteController:
                                      childNotes['t_kak_tahapan']![index],
                                  hintText:
                                      'Catatan untuk tahapan ${item.urutan}...',
                                  fieldKey: key,
                                  isExpanded: expandedNoteKeys.contains(key),
                                  onToggle: () => toggleNote(key),
                                );
                              }),
                            _buildRevisionSectionTitle('Indikator Kinerja'),
                            const SizedBox(height: 12),
                            if (kak.indikatorKinerja.isEmpty)
                              _buildRevisionEmptyState(
                                'Tidak ada data indikator kinerja.',
                              )
                            else
                              ...kak.indikatorKinerja.asMap().entries.map((
                                entry,
                              ) {
                                final index = entry.key;
                                final item = entry.value;
                                final key = 't_kak_target:$index';
                                return _buildChildRevisionCard(
                                  title: 'Indikator ${index + 1}',
                                  details: [
                                    'Bulan: ${item.bulanIndikator}',
                                    'Deskripsi: ${item.deskripsiTarget}',
                                    'Persentase: ${item.persentaseTarget.toStringAsFixed(2)}%',
                                  ],
                                  noteController:
                                      childNotes['t_kak_target']![index],
                                  hintText:
                                      'Catatan untuk indikator ${index + 1}...',
                                  fieldKey: key,
                                  isExpanded: expandedNoteKeys.contains(key),
                                  onToggle: () => toggleNote(key),
                                );
                              }),
                            _buildRevisionSectionTitle('Target IKU'),
                            const SizedBox(height: 12),
                            if (kak.targetIku.isEmpty)
                              _buildRevisionEmptyState(
                                'Tidak ada data target IKU.',
                              )
                            else
                              ...kak.targetIku.asMap().entries.map((entry) {
                                final index = entry.key;
                                final item = entry.value;
                                final key = 't_kak_iku:$index';
                                return _buildChildRevisionCard(
                                  title: 'Target IKU ${index + 1}',
                                  details: [
                                    'IKU: ${item.ikuNama}',
                                    'Target: ${item.target}',
                                    'Satuan: ${item.satuanNama ?? '-'}',
                                  ],
                                  noteController:
                                      childNotes['t_kak_iku']![index],
                                  hintText:
                                      'Catatan untuk target IKU ${index + 1}...',
                                  fieldKey: key,
                                  isExpanded: expandedNoteKeys.contains(key),
                                  onToggle: () => toggleNote(key),
                                );
                              }),
                            _buildRevisionSectionTitle('RAB'),
                            const SizedBox(height: 12),
                            if (kak.rab.isEmpty)
                              _buildRevisionEmptyState('Tidak ada data RAB.')
                            else
                              ...kak.rab.asMap().entries.map((entry) {
                                final index = entry.key;
                                final item = entry.value;
                                final key = 't_kak_anggaran:$index';
                                return _buildChildRevisionCard(
                                  title: 'RAB ${index + 1}',
                                  details: [
                                    'Uraian: ${item.uraian}',
                                    'Volume 1: ${_formatNumber(item.volume1)}',
                                    'Volume 2: ${_formatNumber(item.volume2)}',
                                    'Volume 3: ${_formatNumber(item.volume3)}',
                                    'Harga Satuan: ${_formatCurrency(item.hargaSatuan)}',
                                    'Jumlah Diusulkan: ${_formatCurrency(item.jumlahDiusulkan)}',
                                  ],
                                  noteController:
                                      childNotes['t_kak_anggaran']![index],
                                  hintText: 'Catatan untuk RAB ${index + 1}...',
                                  fieldKey: key,
                                  isExpanded: expandedNoteKeys.contains(key),
                                  onToggle: () => toggleNote(key),
                                );
                              }),
                            const SizedBox(height: 8),
                          ],
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border(
                          top: BorderSide(color: Colors.grey.shade200),
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextButton(
                              onPressed: () {
                                Navigator.pop(dialogContext);
                                disposeAll();
                              },
                              child: const Text('Batal'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: FilledButton(
                              onPressed: () async {
                                Navigator.pop(dialogContext);
                                await _requestRevision(parentNotes, childNotes);
                                disposeAll();
                              },
                              child: const Text('Minta Revisi'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildRevisionSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.figtree(
        fontSize: 15,
        fontWeight: FontWeight.w900,
        color: const Color(0xFF0F172A),
      ),
    );
  }

  Widget _buildRevisionFieldCard({
    required String label,
    required String value,
    required TextEditingController noteController,
    required String hintText,
    required String fieldKey,
    required bool isExpanded,
    required VoidCallback onToggle,
  }) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.figtree(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.figtree(
              fontSize: 13,
              color: const Color(0xFF475569),
            ),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: onToggle,
            icon: Icon(
              isExpanded ? Icons.keyboard_arrow_up : Icons.add_comment_outlined,
            ),
            label: Text(isExpanded ? 'Sembunyikan Catatan' : 'Tambah Catatan'),
          ),
          if (isExpanded) ...[
            const SizedBox(height: 10),
            TextField(
              controller: noteController,
              maxLines: 2,
              decoration: InputDecoration(
                labelText: 'Catatan revisi',
                hintText: hintText,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildChildRevisionCard({
    required String title,
    required List<String> details,
    required TextEditingController noteController,
    required String hintText,
    required String fieldKey,
    required bool isExpanded,
    required VoidCallback onToggle,
  }) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.figtree(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),
          ...details.map(
            (detail) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                detail,
                style: GoogleFonts.figtree(
                  fontSize: 12,
                  color: const Color(0xFF475569),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: onToggle,
            icon: Icon(
              isExpanded ? Icons.keyboard_arrow_up : Icons.add_comment_outlined,
            ),
            label: Text(isExpanded ? 'Sembunyikan Catatan' : 'Tambah Catatan'),
          ),
          if (isExpanded) ...[
            const SizedBox(height: 10),
            TextField(
              controller: noteController,
              maxLines: 2,
              decoration: InputDecoration(
                labelText: 'Catatan revisi item',
                hintText: hintText,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatCurrency(num? value) {
    if (value == null) return '-';
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(value);
  }

  String _formatNumber(num? value) {
    if (value == null) return '-';
    return value.toString();
  }

  Widget _buildRevisionEmptyState(String message) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(
        message,
        style: GoogleFonts.figtree(
          fontSize: 12,
          color: const Color(0xFF64748B),
          fontStyle: FontStyle.italic,
        ),
      ),
    );
  }

  Future<void> _requestRevision(
    Map<String, TextEditingController> parentNotes,
    Map<String, List<TextEditingController>> childNotes,
  ) async {
    setState(() => isProcessing = true);

    try {
      final kakService = context.read<KakService>();
      final catatanFields = <String, String>{};

      parentNotes.forEach((key, controller) {
        final value = controller.text.trim();
        if (value.isNotEmpty) {
          catatanFields[key] = value;
        }
      });

      final anak = <String, List<Map<String, String>>>{};
      final provider = context.read<KakDetailProvider>();
      final kak = provider.kakDetail;

      if (kak != null) {
        if (kak.manfaat.isNotEmpty) {
          anak['t_kak_manfaat'] = kak.manfaat
              .asMap()
              .entries
              .map((entry) {
                final index = entry.key;
                return {
                  'id': entry.value.manfaatId,
                  'catatan_manfaat': childNotes['t_kak_manfaat']![index].text
                      .trim(),
                };
              })
              .where(
                (item) =>
                    item['catatan_manfaat'] != null &&
                    item['catatan_manfaat']!.isNotEmpty,
              )
              .toList();
        }

        if (kak.tahapan.isNotEmpty) {
          anak['t_kak_tahapan'] = kak.tahapan
              .asMap()
              .entries
              .map((entry) {
                final index = entry.key;
                return {
                  'id': entry.value.tahapanId,
                  'catatan_verifikator': childNotes['t_kak_tahapan']![index]
                      .text
                      .trim(),
                };
              })
              .where(
                (item) =>
                    item['catatan_verifikator'] != null &&
                    item['catatan_verifikator']!.isNotEmpty,
              )
              .toList();
        }

        if (kak.indikatorKinerja.isNotEmpty) {
          anak['t_kak_target'] = kak.indikatorKinerja
              .asMap()
              .entries
              .map((entry) {
                final index = entry.key;
                return {
                  'id': entry.value.targetId,
                  'catatan_verifikator': childNotes['t_kak_target']![index].text
                      .trim(),
                };
              })
              .where(
                (item) =>
                    item['catatan_verifikator'] != null &&
                    item['catatan_verifikator']!.isNotEmpty,
              )
              .toList();
        }

        if (kak.targetIku.isNotEmpty) {
          anak['t_kak_iku'] = kak.targetIku
              .asMap()
              .entries
              .map((entry) {
                final index = entry.key;
                return {
                  'id': entry.value.ikuId,
                  'catatan_verifikator': childNotes['t_kak_iku']![index].text
                      .trim(),
                };
              })
              .where(
                (item) =>
                    item['catatan_verifikator'] != null &&
                    item['catatan_verifikator']!.isNotEmpty,
              )
              .toList();
        }

        if (kak.rab.isNotEmpty) {
          anak['t_kak_anggaran'] = kak.rab
              .asMap()
              .entries
              .map((entry) {
                final index = entry.key;
                return {
                  'id': entry.value.anggaranId,
                  'catatan_verifikator': childNotes['t_kak_anggaran']![index]
                      .text
                      .trim(),
                };
              })
              .where(
                (item) =>
                    item['catatan_verifikator'] != null &&
                    item['catatan_verifikator']!.isNotEmpty,
              )
              .toList();
        }
      }

      final childPayload = anak.entries.fold<Map<String, dynamic>>({}, (
        acc,
        entry,
      ) {
        acc[entry.key] = entry.value;
        return acc;
      });

      await kakService.reviseKak(
        widget.kakId.toString(),
        catatanController.text.trim().isNotEmpty
            ? catatanController.text.trim()
            : null,
        catatanFields.isNotEmpty ? catatanFields : null,
        childPayload.isNotEmpty ? childPayload : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pengusul diminta melakukan revisi'),
            backgroundColor: Color(0xFF1976D2),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final provider = context.watch<KakDetailProvider>();

    if (provider.isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(
            'Review KAK',
            style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
          ),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (provider.isError) {
      return Scaffold(
        appBar: AppBar(
          title: Text(
            'Review KAK',
            style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(provider.errorMessage ?? 'Gagal memuat detail KAK'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => provider.retry(widget.kakId.toString()),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Review KAK',
          style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          // Scrollable KAK details (embedMode = true avoids internal Scaffold)
          Expanded(
            child: KakDetailPage(
              kakId: widget.kakId.toString(),
              embedMode: true,
            ),
          ),

          // Pinned action card at the bottom
          if (provider.hasData && provider.kakDetail != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(
                  top: BorderSide(color: Colors.grey.shade200, width: 1),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    offset: const Offset(0, -4),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Full width "Setujui" button
                  FilledButton(
                    onPressed: isProcessing ? null : _showApproveDialog,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF2E7D32),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: isProcessing
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : Text(
                            'Setujui KAK',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: Colors.white,
                            ),
                          ),
                  ),
                  const SizedBox(height: 12),

                  // Side-by-side Revision and Reject buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: isProcessing
                              ? null
                              : () {
                                  final kak = provider.kakDetail;
                                  if (kak != null) {
                                    _showRevisionDialog(kak);
                                  }
                                },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            side: BorderSide(color: colorScheme.primary),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Text(
                            'Minta Revisi',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              color: colorScheme.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: isProcessing ? null : _showRejectDialog,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            side: const BorderSide(color: Colors.red),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Text(
                            'Tolak KAK',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              color: Colors.red,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    catatanController.dispose();
    super.dispose();
  }
}

class _ApproveBottomSheet extends StatefulWidget {
  final int kakId;
  final Function(Map<String, dynamic> data) onSubmit;

  const _ApproveBottomSheet({
    Key? key,
    required this.kakId,
    required this.onSubmit,
  }) : super(key: key);

  @override
  State<_ApproveBottomSheet> createState() => _ApproveBottomSheetState();
}

class _ApproveBottomSheetState extends State<_ApproveBottomSheet> {
  String _mode = 'daftar'; // 'daftar' or 'manual'
  int? _selectedMataAnggaranId;
  List<dynamic> _mataAnggaranList = [];
  bool _isLoadingMataAnggaran = true;
  String? _loadError;

  final _formKey = GlobalKey<FormState>();
  final _kodeAnggaranController = TextEditingController();
  final _sumberDanaController = TextEditingController();
  final _tahunAnggaranController = TextEditingController();
  final _totalPaguController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadMataAnggaran();
  }

  Future<void> _loadMataAnggaran() async {
    try {
      final masterService = context.read<MasterDataService>();
      final list = await masterService.getMataAnggaran();
      setState(() {
        _mataAnggaranList = list;
        _isLoadingMataAnggaran = false;
      });
    } catch (e) {
      setState(() {
        _loadError = e.toString();
        _isLoadingMataAnggaran = false;
      });
    }
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final data = <String, dynamic>{};
      if (_mode == 'daftar') {
        data['mata_anggaran_id'] = _selectedMataAnggaranId;
      } else {
        data['kode_anggaran'] = _kodeAnggaranController.text.trim();
        data['nama_sumber_dana'] = _sumberDanaController.text.trim();
        data['tahun_anggaran'] = int.parse(
          _tahunAnggaranController.text.trim(),
        );
        data['total_pagu'] = double.parse(_totalPaguController.text.trim());
      }
      widget.onSubmit(data);
    }
  }

  @override
  void dispose() {
    _kodeAnggaranController.dispose();
    _sumberDanaController.dispose();
    _tahunAnggaranController.dispose();
    _totalPaguController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: 24 + MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handlebar indicator
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            Text(
              'Setujui KAK - Anggaran',
              style: GoogleFonts.figtree(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),

            // Segmented mode switcher using ChoiceChips
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: Container(
                      alignment: Alignment.center,
                      child: Text(
                        'Pilih dari Daftar',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w600,
                          color: _mode == 'daftar'
                              ? Colors.white
                              : Colors.black87,
                        ),
                      ),
                    ),
                    selected: _mode == 'daftar',
                    selectedColor: theme.colorScheme.primary,
                    backgroundColor: Colors.grey.shade100,
                    onSelected: (val) {
                      if (val) setState(() => _mode = 'daftar');
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ChoiceChip(
                    label: Container(
                      alignment: Alignment.center,
                      child: Text(
                        'Masukkan Manual',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w600,
                          color: _mode == 'manual'
                              ? Colors.white
                              : Colors.black87,
                        ),
                      ),
                    ),
                    selected: _mode == 'manual',
                    selectedColor: theme.colorScheme.primary,
                    backgroundColor: Colors.grey.shade100,
                    onSelected: (val) {
                      if (val) setState(() => _mode = 'manual');
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Form inputs based on mode
            if (_mode == 'daftar') ...[
              if (_isLoadingMataAnggaran)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (_loadError != null)
                Column(
                  children: [
                    Text(
                      'Gagal memuat mata anggaran: $_loadError',
                      style: const TextStyle(color: Colors.red),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _isLoadingMataAnggaran = true;
                          _loadError = null;
                        });
                        _loadMataAnggaran();
                      },
                      child: const Text('Coba Lagi'),
                    ),
                  ],
                )
              else
                DropdownButtonFormField<int>(
                  decoration: InputDecoration(
                    labelText: 'Pilih Mata Anggaran',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                  value: _selectedMataAnggaranId,
                  items: _mataAnggaranList.map((item) {
                    return DropdownMenuItem<int>(
                      value: item['mata_anggaran_id'] as int,
                      child: Text(
                        '${item['kode_anggaran']} - ${item['nama_sumber_dana']} (${item['tahun_anggaran']})',
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.figtree(fontSize: 13),
                      ),
                    );
                  }).toList(),
                  validator: (value) {
                    if (_mode == 'daftar' && value == null) {
                      return 'Mata anggaran wajib dipilih';
                    }
                    return null;
                  },
                  onChanged: (value) {
                    setState(() => _selectedMataAnggaranId = value);
                  },
                ),
            ] else ...[
              TextFormField(
                controller: _kodeAnggaranController,
                decoration: InputDecoration(
                  labelText: 'Kode Anggaran',
                  hintText: 'e.g. APBN-2026',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                validator: (val) {
                  if (_mode == 'manual' &&
                      (val == null || val.trim().isEmpty)) {
                    return 'Kode anggaran wajib diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _sumberDanaController,
                decoration: InputDecoration(
                  labelText: 'Nama Sumber Dana',
                  hintText: 'e.g. APBN 2026',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                validator: (val) {
                  if (_mode == 'manual' &&
                      (val == null || val.trim().isEmpty)) {
                    return 'Nama sumber dana wajib diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _tahunAnggaranController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Tahun Anggaran',
                        hintText: '2026',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      validator: (val) {
                        if (_mode == 'manual') {
                          if (val == null || val.trim().isEmpty) {
                            return 'Tahun wajib diisi';
                          }
                          if (val.trim().length != 4 ||
                              int.tryParse(val.trim()) == null) {
                            return 'Harus 4 digit angka';
                          }
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _totalPaguController,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: InputDecoration(
                        labelText: 'Total Pagu',
                        hintText: '500000000',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      validator: (val) {
                        if (_mode == 'manual') {
                          if (val == null || val.trim().isEmpty) {
                            return 'Total pagu wajib diisi';
                          }
                          final parsed = double.tryParse(val.trim());
                          if (parsed == null || parsed < 0) {
                            return 'Harus angka positif';
                          }
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 28),

            // Confirm & Cancel Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Batal',
                    style: GoogleFonts.figtree(
                      fontWeight: FontWeight.w600,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                FilledButton(
                  onPressed: _submit,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    'Setujui KAK',
                    style: GoogleFonts.figtree(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
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
