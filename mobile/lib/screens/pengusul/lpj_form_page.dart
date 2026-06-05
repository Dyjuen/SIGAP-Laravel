import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/lpj_model.dart';
import '../../providers/lpj_provider.dart';
import '../../services/master_data_service.dart';

import '../../providers/auth_provider.dart';

class LpjFormPage extends StatefulWidget {
  final String kegiatanId;

  const LpjFormPage({super.key, required this.kegiatanId});

  @override
  State<LpjFormPage> createState() => _LpjFormPageState();
}

class _LpjFormPageState extends State<LpjFormPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final List<_RealisasiRowControllers> _rows = [];
  final Map<String, List<PlatformFile>> _selectedFilesMap =
      {}; // anggaran_id -> files
  final Map<String, String> _itemComments = {}; // anggaran_id -> comment
  final List<_SatuanOption> _satuanOptions = [];

  // SPK fields
  late TextEditingController _waktuController;
  int? _selectedOutput;

  bool _initialized = false;
  bool _loadingSatuan = true;

  @override
  void initState() {
    super.initState();
    _waktuController = TextEditingController();
    Future.microtask(() async {
      if (widget.kegiatanId.isNotEmpty) {
        await context.read<LpjProvider>().getLpjDetail(widget.kegiatanId);
      }
      await _loadSatuan();
    });
  }

  void _showItemCommentDialog(LpjRealization item) {
    final controller = TextEditingController(
      text: _itemComments[item.anggaranId],
    );
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

  @override
  void dispose() {
    _waktuController.dispose();
    for (final row in _rows) {
      row.dispose();
    }
    super.dispose();
  }

  Future<void> _loadSatuan() async {
    if (!mounted) return;
    setState(() => _loadingSatuan = true);

    try {
      final masterDataService = context.read<MasterDataService>();
      final items = await masterDataService.getSatuan();
      _satuanOptions
        ..clear()
        ..addAll(
          items.map(
            (item) => _SatuanOption(
              id: item['satuan_id']?.toString() ?? '',
              name: item['nama_satuan']?.toString() ?? '',
            ),
          ),
        );
    } catch (_) {
      _satuanOptions.clear();
    } finally {
      if (mounted) {
        setState(() => _loadingSatuan = false);
      }
    }
  }

  void _initializeRows(LpjDetail detail) {
    if (_initialized) return;

    for (final item in detail.anggaranItems) {
      _rows.add(_RealisasiRowControllers.fromItem(item));
    }

    // Initialize SPK fields
    _waktuController.text = detail.spkKesesuaianWaktu?.toString() ?? '';
    _selectedOutput = detail.spkKesesuaianOutput;

    _initialized = true;
  }

  Future<void> _pickFiles(String anggaranId) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
      );

      if (result != null && result.files.isNotEmpty) {
        setState(() {
          final existing = _selectedFilesMap[anggaranId] ?? [];
          _selectedFilesMap[anggaranId] = [...existing, ...result.files];
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal memilih file: $e')));
    }
  }

  Future<void> _submit(LpjDetail detail, LpjProvider provider) async {
    try {
      debugPrint('LpjFormPage: _submit called');

      if (_formKey.currentState == null) {
        debugPrint('LpjFormPage: _formKey.currentState is null');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Form tidak ditemukan. Silakan refresh.'),
          ),
        );
        return;
      }

      if (!_formKey.currentState!.validate()) {
        debugPrint('LpjFormPage: Validation failed');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Mohon lengkapi semua field yang wajib diisi.'),
          ),
        );
        return;
      }

      if (_rows.length != detail.anggaranItems.length) {
        debugPrint(
          'LpjFormPage: Row count mismatch! _rows: ${_rows.length}, detail: ${detail.anggaranItems.length}',
        );
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Terjadi kesalahan sinkronisasi data. Silakan refresh halaman.',
            ),
          ),
        );
        return;
      }

      final realizasiData = <Map<String, dynamic>>[];
      final buktiFilesMap = <String, List<String>>{};

      for (var index = 0; index < _rows.length; index++) {
        final row = _rows[index];
        final item = detail.anggaranItems[index];

        final vol1 = _parseDouble(row.volume1Controller.text);
        final harga = _parseDouble(row.hargaSatuanController.text);

        realizasiData.add({
          'anggaran_id': item.anggaranId,
          'volume1': vol1,
          'satuan1_id': _parseIntSafe(row.satuan1Id),
          'volume2': _isBlank(row.volume2Controller.text)
              ? null
              : _parseDouble(row.volume2Controller.text),
          'satuan2_id': _parseIntSafe(row.satuan2Id),
          'volume3': _isBlank(row.volume3Controller.text)
              ? null
              : _parseDouble(row.volume3Controller.text),
          'satuan3_id': _parseIntSafe(row.satuan3Id),
          'harga_satuan': harga,
        });

        final files = _selectedFilesMap[item.anggaranId];
        if (files != null && files.isNotEmpty) {
          buktiFilesMap[item.anggaranId] = files
              .map((f) => f.path)
              .whereType<String>()
              .toList();
        }
      }

      if (realizasiData.isEmpty) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Data realisasi kosong.')));
        return;
      }

      debugPrint(
        'LpjFormPage: Submitting data for kegiatan ${detail.kegiatanId}...',
      );

      final success = detail.isRevisionRequested
          ? await provider.resubmitLpj(
              kegiatanId: detail.kegiatanId,
              realizasiData: realizasiData,
              spkKesesuaianWaktu: int.tryParse(_waktuController.text),
              spkKesesuaianOutput: _selectedOutput,
              buktiFiles: buktiFilesMap.isEmpty ? null : buktiFilesMap,
            )
          : await provider.submitLpj(
              kegiatanId: detail.kegiatanId,
              realizasiData: realizasiData,
              spkKesesuaianWaktu: int.tryParse(_waktuController.text),
              spkKesesuaianOutput: _selectedOutput,
              buktiFiles: buktiFilesMap.isEmpty ? null : buktiFilesMap,
            );

      debugPrint('LpjFormPage: Submission success = $success');

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              detail.isRevisionRequested
                  ? 'LPJ berhasil disubmit ulang'
                  : 'LPJ berhasil disubmit',
            ),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.errorMessage ?? 'Gagal submit LPJ'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } catch (e, stack) {
      debugPrint('LpjFormPage: Error in _submit: $e');
      debugPrint(stack.toString());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Terjadi kesalahan sistem: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  double _calculateCurrentTotalRealization() {
    double total = 0;
    for (final row in _rows) {
      final v1 = _parseDouble(row.volume1Controller.text);
      final v2 = _parseDouble(row.volume2Controller.text);
      final v3 = _parseDouble(row.volume3Controller.text);
      final h = _parseDouble(row.hargaSatuanController.text);

      final vv2 = v2 == 0 ? 1.0 : v2;
      final vv3 = v3 == 0 ? 1.0 : v3;

      total += (v1 * vv2 * vv3 * h);
    }
    return total;
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
          'Formulir LPJ',
          style: GoogleFonts.figtree(fontWeight: FontWeight.w800),
        ),
      ),
      body: Consumer2<AuthProvider, LpjProvider>(
        builder: (context, authProvider, provider, _) {
          if (provider.isLoading && provider.selectedLpj == null) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF33C8DA)),
            );
          }

          final detail = provider.selectedLpj;
          if (detail == null) {
            return _buildEmptyState();
          }

          _initializeRows(detail);
          final roleId = authProvider.user?.roleId;
          final isEditable = detail.canEditPengusul && roleId == 3;
          final isBendahara = roleId == 6;

          return Scaffold(
            backgroundColor: Colors.transparent,
            body: RefreshIndicator(
              onRefresh: () => provider.getLpjDetail(detail.kegiatanId),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildHeader(detail),
                      const SizedBox(height: 16),
                      _buildTableAlternative(detail, isEditable, roleId),
                      const SizedBox(height: 24),
                      _buildSpkSection(detail, isEditable),
                      const SizedBox(height: 32),
                      if (isEditable)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: _buildSubmitButton(detail, provider),
                        ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
            bottomNavigationBar: (isBendahara && detail.isSubmitted)
                ? _buildBendaharaActionBar(detail, provider)
                : null,
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
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
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
              _buildCompactStat(
                'Diusulkan',
                _formatCurrency(detail.totalAnggaranDiusulkan),
              ),
              const SizedBox(width: 16),
              _buildCompactStat(
                'Realisasi (Live)',
                _formatCurrency(_calculateCurrentTotalRealization()),
              ),
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

  Widget _buildTableSection(LpjDetail detail, bool isEditable) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(
                Icons.table_chart_outlined,
                size: 20,
                color: Color(0xFF33C8DA),
              ),
              const SizedBox(width: 8),
              Text(
                'Tabel Realisasi Anggaran',
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
              dataRowMinHeight: 120, // Enough for multi-volume inputs
              dataRowMaxHeight:
                  280, // Expandable for Evidence row? No, DataTable rows are fixed height.
              // Let's use a custom approach instead of DataTable for better flexibility
              columns: const [
                DataColumn(label: Text('Uraian')),
                DataColumn(label: Text('Diusulkan'), numeric: true),
                DataColumn(label: Text('Realisasi Volume & Satuan')),
                DataColumn(label: Text('Harga Satuan (Real)'), numeric: true),
                DataColumn(label: Text('Total (Real)'), numeric: true),
              ],
              rows: List.generate(detail.anggaranItems.length, (index) {
                final item = detail.anggaranItems[index];
                final row = _rows[index];

                return DataRow(
                  cells: [
                    DataCell(
                      SizedBox(
                        width: 150,
                        child: Text(
                          item.uraianKegiatan,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    DataCell(Text(_formatCurrency(item.jumlahDiusulkan))),
                    DataCell(_buildVolumeInputs(row, isEditable)),
                    DataCell(_buildHargaInput(row, isEditable)),
                    DataCell(
                      Text(
                        _formatCurrency(_calculateRowTotal(row)),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ),
                  ],
                );
              }),
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            '* Geser tabel ke samping untuk melihat detail realisasi.',
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey,
              fontStyle: FontStyle.italic,
            ),
          ),
        ),
      ],
    );
  }

  // Since DataTable is restrictive with dynamic row content like "Bukti Dokumen" sub-rows,
  // let's build a custom table-like structure using Rows and Columns.

  Widget _buildTableAlternative(
    LpjDetail detail,
    bool isEditable,
    int? roleId,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(
                Icons.table_chart_outlined,
                size: 20,
                color: Color(0xFF33C8DA),
              ),
              const SizedBox(width: 8),
              Text(
                'Rincian Realisasi & Bukti',
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
        ...detail.anggaranItems.asMap().entries.map((entry) {
          final idx = entry.key;
          final item = entry.value;
          final row = _rows[idx];

          return _buildEnhancedRowItem(
            idx,
            item,
            row,
            isEditable,
            roleId,
            detail,
          );
        }),
      ],
    );
  }

  Widget _buildEnhancedRowItem(
    int idx,
    LpjRealization item,
    _RealisasiRowControllers row,
    bool isEditable,
    int? roleId,
    LpjDetail detail,
  ) {
    debugPrint(
      'Item ${item.uraianKegiatan} catatanReviewer: ${item.catatanReviewer}',
    );
    final hasRevision =
        item.catatanReviewer != null && item.catatanReviewer!.trim().isNotEmpty;
    final isBendahara = roleId == 6;
    final hasLocalComment = _itemComments.containsKey(item.anggaranId);

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: hasRevision
              ? const Color(0xFFEF4444)
              : (hasLocalComment ? Colors.orange : const Color(0xFFE2E8F0)),
          width: (hasRevision || hasLocalComment) ? 2.5 : 1,
        ),
        boxShadow: hasRevision
            ? [
                BoxShadow(
                  color: const Color(0xFFEF4444).withOpacity(0.1),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ]
            : (hasLocalComment
                  ? [
                      BoxShadow(
                        color: Colors.orange.withOpacity(0.1),
                        blurRadius: 12,
                        spreadRadius: 2,
                      ),
                    ]
                  : [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ]),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Row Header: Uraian & Diusulkan
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: hasRevision
                  ? const Color(0xFFFEF2F2)
                  : (hasLocalComment
                        ? Colors.orange.shade50
                        : const Color(0xFFF8FAFC)),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: hasRevision
                            ? const Color(0xFFEF4444)
                            : (hasLocalComment
                                  ? Colors.orange
                                  : const Color(0xFF33C8DA).withOpacity(0.1)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${idx + 1}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: (hasRevision || hasLocalComment)
                              ? Colors.white
                              : const Color(0xFF33C8DA),
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.uraianKegiatan,
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: hasRevision
                                  ? const Color(0xFF991B1B)
                                  : const Color(0xFF0F172A),
                            ),
                          ),
                          Text(
                            'Usulan: ${_formatCurrency(item.jumlahDiusulkan)}',
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isBendahara && detail.isSubmitted)
                      IconButton(
                        icon: Icon(
                          hasLocalComment
                              ? Icons.comment
                              : Icons.add_comment_outlined,
                          color: hasLocalComment ? Colors.orange : Colors.grey,
                        ),
                        onPressed: () => _showItemCommentDialog(item),
                        visualDensity: VisualDensity.compact,
                      ),
                  ],
                ),
                if (hasRevision) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.warning_amber_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'CATATAN REVISI BENDAHARA:',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                item.catatanReviewer!,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Horizontal Form Row (The "Web Table" feeling)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _buildColumnInput(
                  'Volume 1',
                  row.volume1Controller,
                  60,
                  required: true,
                ),
                _buildColumnSatuan('Satuan 1', row, 1, isEditable),
                const _Divider(),
                _buildColumnInput('Volume 2', row.volume2Controller, 60),
                _buildColumnSatuan('Satuan 2', row, 2, isEditable),
                const _Divider(),
                _buildColumnInput('Volume 3', row.volume3Controller, 60),
                _buildColumnSatuan('Satuan 3', row, 3, isEditable),
                const _Divider(),
                _buildColumnInput(
                  'Harga Satuan',
                  row.hargaSatuanController,
                  120,
                  prefix: 'Rp',
                  required: true,
                ),
                const _Divider(),
                _buildColumnDisplay(
                  'Total Realisasi',
                  _formatCurrency(_calculateRowTotal(row)),
                  isBold: true,
                  color: const Color(0xFF10B981),
                ),
              ],
            ),
          ),

          // Evidence Sub-row
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9).withOpacity(0.5),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Bukti Dokumen',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: Color(0xFF475569),
                      ),
                    ),
                    if (isEditable)
                      TextButton.icon(
                        onPressed: () => _pickFiles(item.anggaranId),
                        icon: const Icon(Icons.add, size: 14),
                        label: const Text(
                          'Tambah Bukti',
                          style: TextStyle(fontSize: 11),
                        ),
                        style: TextButton.styleFrom(
                          visualDensity: VisualDensity.compact,
                          foregroundColor: const Color(0xFF33C8DA),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                _buildEvidenceList(item.anggaranId, isEditable),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildColumnInput(
    String label,
    TextEditingController controller,
    double width, {
    String? prefix,
    bool required = false,
  }) {
    return Container(
      width: width,
      margin: const EdgeInsets.only(right: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: Colors.grey,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          SizedBox(
            height: 50, // Increased height to accommodate error text if needed
            child: TextFormField(
              controller: controller,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                prefixText: prefix,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 8,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFF33C8DA)),
                ),
                errorStyle: const TextStyle(
                  fontSize: 0,
                  height: 0,
                ), // Hide error text but keep red border
              ),
              validator: required
                  ? (val) {
                      if (val == null || val.isEmpty) return '';
                      if (double.tryParse(val.replaceAll(',', '.')) == null)
                        return '';
                      return null;
                    }
                  : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildColumnSatuan(
    String label,
    _RealisasiRowControllers row,
    int volIdx,
    bool enabled,
  ) {
    String? currentVal;
    if (volIdx == 1) currentVal = row.satuan1Id;
    if (volIdx == 2) currentVal = row.satuan2Id;
    if (volIdx == 3) currentVal = row.satuan3Id;

    return Container(
      width: 100,
      margin: const EdgeInsets.only(right: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: Colors.grey,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          SizedBox(
            height: 50,
            child: DropdownButtonFormField<String>(
              value: _satuanOptions.any((s) => s.id == currentVal)
                  ? currentVal
                  : null,
              onChanged: enabled
                  ? (val) {
                      setState(() {
                        if (volIdx == 1) row.satuan1Id = val;
                        if (volIdx == 2) row.satuan2Id = val;
                        if (volIdx == 3) row.satuan3Id = val;
                      });
                    }
                  : null,
              style: const TextStyle(
                fontSize: 11,
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 8,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                errorStyle: const TextStyle(fontSize: 0, height: 0),
              ),
              items: _satuanOptions
                  .map(
                    (s) => DropdownMenuItem(
                      value: s.id,
                      child: Text(s.name, overflow: TextOverflow.ellipsis),
                    ),
                  )
                  .toList(),
              validator: (val) {
                if (volIdx == 1 && (val == null || val.isEmpty)) return '';
                return null;
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildColumnDisplay(
    String label,
    String value, {
    bool isBold = false,
    Color? color,
  }) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: Colors.grey,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: color ?? Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEvidenceList(String anggaranId, bool isEditable) {
    final files = _selectedFilesMap[anggaranId] ?? [];
    if (files.isEmpty) {
      return const Text(
        'Belum ada file dipilih.',
        style: TextStyle(
          fontSize: 11,
          color: Colors.grey,
          fontStyle: FontStyle.italic,
        ),
      );
    }

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: files.map((file) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.file_present,
                size: 14,
                color: Color(0xFF33C8DA),
              ),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  file.name,
                  style: const TextStyle(fontSize: 11),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isEditable) ...[
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () => setState(
                    () => _selectedFilesMap[anggaranId]!.remove(file),
                  ),
                  child: const Icon(Icons.close, size: 14, color: Colors.red),
                ),
              ],
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSpkSection(LpjDetail detail, bool isEditable) {
    return Container(
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9).withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF33C8DA).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.analytics_outlined,
                  color: Color(0xFF33C8DA),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Evaluasi Kinerja SPK Pimpinan',
                      style: GoogleFonts.figtree(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      'Decision Support System (Variabel Kualitatif)',
                      style: GoogleFonts.figtree(
                        fontSize: 11,
                        color: const Color(0xFF64748B),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Kesesuaian Waktu
          Text(
            'KESESUAIAN WAKTU (PELAKSANAAN KEGIATAN)',
            style: GoogleFonts.figtree(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF475569),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _waktuController,
            enabled: isEditable,
            keyboardType: TextInputType.number,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: 'Nilai (50 - 100)',
              filled: true,
              fillColor: isEditable ? Colors.white : Colors.grey.shade50,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Kesesuaian waktu harus diisi';
              }
              final val = int.tryParse(value);
              if (val == null || val < 50 || val > 100) {
                return 'Nilai harus antara 50 - 100';
              }
              return null;
            },
          ),
          const SizedBox(height: 6),
          const Text(
            'Konstrain 50-100. Nilai kesesuaian waktu acara dibanding jadwal original.',
            style: TextStyle(fontSize: 10, color: Colors.grey, height: 1.4),
          ),

          const SizedBox(height: 20),

          // Kesesuaian Output
          Text(
            'KESESUAIAN OUTPUT (IKU)',
            style: GoogleFonts.figtree(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF475569),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<int>(
            value: _selectedOutput,
            onChanged: isEditable
                ? (val) {
                    setState(() => _selectedOutput = val);
                  }
                : null,
            decoration: InputDecoration(
              filled: true,
              fillColor: isEditable ? Colors.white : Colors.grey.shade50,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
            ),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
            hint: const Text('Pilih Kesesuaian IKU'),
            items: const [
              DropdownMenuItem(value: 0, child: Text('0 - Output TIDAK Sesuai')),
              DropdownMenuItem(value: 100, child: Text('100 - Output SESUAI')),
            ],
            validator: (value) {
              if (value == null) return 'Pilih kesesuaian output';
              return null;
            },
          ),
          const SizedBox(height: 6),
          const Text(
            'Hanya boleh 0 (tidak sesuai) atau 100 (sesuai indikator IKU KAK).',
            style: TextStyle(fontSize: 10, color: Colors.grey, height: 1.4),
          ),
        ],
      ),
    );
  }

  // --- Helpers & UI Components ---

  Widget _buildSubmitButton(LpjDetail detail, LpjProvider provider) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF33C8DA).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: provider.isSubmitting
            ? null
            : () => _submit(detail, provider),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF33C8DA),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 0,
        ),
        child: provider.isSubmitting
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              )
            : Text(
                detail.isRevisionRequested ? 'Submit Ulang LPJ' : 'Submit LPJ',
                style: GoogleFonts.figtree(
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                ),
              ),
      ),
    );
  }

  double _calculateRowTotal(_RealisasiRowControllers row) {
    final v1 = _parseDouble(row.volume1Controller.text);
    final v2 = _parseDouble(row.volume2Controller.text);
    final v3 = _parseDouble(row.volume3Controller.text);
    final h = _parseDouble(row.hargaSatuanController.text);

    final vv2 = v2 == 0 ? 1.0 : v2;
    final vv3 = v3 == 0 ? 1.0 : v3;

    return v1 * vv2 * vv3 * h;
  }

  // Reuse existing buildVolumeInputs, buildHargaInput etc but integrated into the horizontal view
  Widget _buildVolumeInputs(_RealisasiRowControllers row, bool isEditable) {
    return Column(
      children: [
        TextField(
          controller: row.volume1Controller,
          enabled: isEditable,
          decoration: const InputDecoration(labelText: 'Vol 1'),
        ),
        TextField(
          controller: row.volume2Controller,
          enabled: isEditable,
          decoration: const InputDecoration(labelText: 'Vol 2'),
        ),
        TextField(
          controller: row.volume3Controller,
          enabled: isEditable,
          decoration: const InputDecoration(labelText: 'Vol 3'),
        ),
      ],
    );
  }

  Widget _buildHargaInput(_RealisasiRowControllers row, bool isEditable) {
    return TextField(
      controller: row.hargaSatuanController,
      enabled: isEditable,
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: CircularProgressIndicator(color: Color(0xFF33C8DA)),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Draft':
        return Colors.blue;
      case 'Submitted':
        return Colors.orange;
      case 'Approved':
        return Colors.green;
      case 'Revision Requested':
        return Colors.red;
      case 'Completed':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  String _formatCurrency(double value) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(value);
  }

  double _parseDouble(String value) {
    return double.tryParse(value.replaceAll(',', '.')) ?? 0;
  }

  int? _parseIntSafe(String? value) {
    if (value == null || value.isEmpty) return null;
    return int.tryParse(value);
  }

  Widget _buildBendaharaActionBar(LpjDetail detail, LpjProvider provider) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: provider.isSubmitting
                  ? null
                  : () => _showReviseDialog(detail, provider),
              icon: const Icon(Icons.assignment_return_outlined),
              label: const Text('Minta Revisi'),
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
                        'Approve LPJ',
                        'Apakah Anda yakin ingin menyetujui LPJ ini?',
                      );
                      if (ok == true) {
                        final success = await provider.approveLpj(
                          detail.kegiatanId,
                        );
                        if (success && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('LPJ berhasil disetujui'),
                            ),
                          );
                          Navigator.pop(context, true);
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
    );
  }

  Future<bool?> _showConfirmDialog(String title, String content) {
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

  void _showReviseDialog(LpjDetail detail, LpjProvider provider) {
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
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.orange,
                    fontWeight: FontWeight.bold,
                  ),
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
                  const SnackBar(
                    content: Text('Berikan setidaknya satu catatan'),
                  ),
                );
                return;
              }
              Navigator.pop(context);

              final anggaranComments = _itemComments.entries
                  .map(
                    (e) => {
                      'id': int.tryParse(e.key),
                      'catatan_reviewer': e.value,
                    },
                  )
                  .where((element) => element['id'] != null)
                  .toList();

              final success = await provider.reviseLpj(
                kegiatanId: detail.kegiatanId,
                catatan: generalNote.isNotEmpty ? generalNote : null,
                anggaranComments: anggaranComments.isNotEmpty
                    ? anggaranComments
                    : null,
              );

              if (success && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Catatan revisi telah dikirim')),
                );
                Navigator.pop(context, true);
              }
            },
            child: const Text('Kirim Catatan'),
          ),
        ],
      ),
    );
  }

  bool _isBlank(String? value) => value == null || value.trim().isEmpty;
}

class _RealisasiRowControllers {
  final TextEditingController volume1Controller;
  final TextEditingController volume2Controller;
  final TextEditingController volume3Controller;
  final TextEditingController hargaSatuanController;
  String? satuan1Id;
  String? satuan2Id;
  String? satuan3Id;

  _RealisasiRowControllers({
    required this.volume1Controller,
    required this.volume2Controller,
    required this.volume3Controller,
    required this.hargaSatuanController,
    this.satuan1Id,
    this.satuan2Id,
    this.satuan3Id,
  });

  factory _RealisasiRowControllers.fromItem(LpjRealization item) {
    return _RealisasiRowControllers(
      volume1Controller: TextEditingController(
        text: item.realisasiVolume1?.toString() ?? item.volume.toString(),
      ),
      volume2Controller: TextEditingController(
        text: item.realisasiVolume2?.toString() ?? '',
      ),
      volume3Controller: TextEditingController(
        text: item.realisasiVolume3?.toString() ?? '',
      ),
      hargaSatuanController: TextEditingController(
        text:
            item.realisasiHargaSatuan?.toString() ??
            item.hargaSatuan.toString(),
      ),
      satuan1Id: item.realisasiSatuan1Id ?? item.satuanId,
      satuan2Id: item.realisasiSatuan2Id,
      satuan3Id: item.realisasiSatuan3Id,
    );
  }

  void dispose() {
    volume1Controller.dispose();
    volume2Controller.dispose();
    volume3Controller.dispose();
    hargaSatuanController.dispose();
  }
}

class _SatuanOption {
  final String id;
  final String name;
  _SatuanOption({required this.id, required this.name});
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      width: 1,
      color: Colors.grey.withOpacity(0.2),
      margin: const EdgeInsets.symmetric(horizontal: 12),
    );
  }
}
