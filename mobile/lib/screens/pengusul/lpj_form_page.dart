import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/lpj_model.dart';
import '../../providers/lpj_provider.dart';
import '../../services/master_data_service.dart';

import '../../providers/auth_provider.dart';
import '../../services/chatbot_service.dart';

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
  DateTime? _tglMulai;
  DateTime? _tglSelesai;
  int? _selectedOutput;

  bool _initialized = false;
  bool _loadingSatuan = true;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      if (widget.kegiatanId.isNotEmpty) {
        await context.read<LpjProvider>().getLpjDetail(widget.kegiatanId);
      }
      await _loadSatuan();
    });
    // Hide chatbot when filling LPJ
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatbotService>().setVisible(false);
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
          'Catatan Revisi: ${item.uraian}',
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
    // Show chatbot again when leaving
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ChatbotService>().setVisible(true);
      }
    });
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
    _tglMulai = detail.realisasiTglMulai != null
        ? DateTime.tryParse(detail.realisasiTglMulai!)
        : null;
    _tglSelesai = detail.realisasiTglSelesai != null
        ? DateTime.tryParse(detail.realisasiTglSelesai!)
        : null;
    _selectedOutput = detail.spkKesesuaianOutput;

    _initialized = true;
  }

  Future<void> _selectDate(BuildContext context, bool isMulai) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: (isMulai ? _tglMulai : _tglSelesai) ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2101),
      locale: const Locale('id', 'ID'),
      confirmText: 'Oke',
    );
    if (picked != null) {
      setState(() {
        if (isMulai) {
          _tglMulai = picked;
        } else {
          _tglSelesai = picked;
        }
      });
    }
  }

  Widget _buildDateField({
    required String label,
    required DateTime? value,
    required VoidCallback onTap,
    bool enabled = true,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.figtree(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            color: const Color(0xFF475569),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: enabled ? onTap : null,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: enabled ? Colors.white : Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  value != null
                      ? DateFormat('dd MMMM yyyy', 'id_ID').format(value)
                      : 'Pilih Tanggal',
                  style: GoogleFonts.figtree(
                    fontSize: 14,
                    fontWeight:
                        value != null ? FontWeight.bold : FontWeight.normal,
                    color: value != null ? Colors.black : Colors.grey,
                  ),
                ),
                Icon(
                  Icons.calendar_today,
                  size: 18,
                  color: enabled ? const Color(0xFF33C8DA) : Colors.grey,
                ),
              ],
            ),
          ),
        ),
      ],
    );
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

      // Add validation for dates
      final detailModel = provider.selectedLpj;
      final roleId = context.read<AuthProvider>().user?.roleId;
      final isEditable = detailModel?.canEditPengusul == true && roleId == 3;

      if (isEditable && (_tglMulai == null || _tglSelesai == null)) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Mohon pilih tanggal mulai dan selesai realisasi.'),
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
      final buktiFilesMap = <String, List<PlatformFile>>{};

      for (var index = 0; index < _rows.length; index++) {
        final row = _rows[index];
        final item = detail.anggaranItems[index];

        final newFiles = _selectedFilesMap[item.anggaranId] ?? [];
        final existing = item.lampiran ?? [];
        if (newFiles.isEmpty && existing.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Item "${item.uraian}" wajib melampirkan minimal 1 dokumen bukti.'),
              backgroundColor: Colors.red,
            ),
          );
          return;
        }

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
          buktiFilesMap[item.anggaranId] = files;
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
              realisasiTglMulai: _tglMulai != null
                  ? DateFormat('yyyy-MM-dd').format(_tglMulai!)
                  : null,
              realisasiTglSelesai: _tglSelesai != null
                  ? DateFormat('yyyy-MM-dd').format(_tglSelesai!)
                  : null,
              spkKesesuaianOutput: _selectedOutput,
              buktiFiles: buktiFilesMap.isEmpty ? null : buktiFilesMap,
            )
          : await provider.submitLpj(
              kegiatanId: detail.kegiatanId,
              realizasiData: realizasiData,
              realisasiTglMulai: _tglMulai != null
                  ? DateFormat('yyyy-MM-dd').format(_tglMulai!)
                  : null,
              realisasiTglSelesai: _tglSelesai != null
                  ? DateFormat('yyyy-MM-dd').format(_tglSelesai!)
                  : null,
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
        automaticallyImplyLeading: false,
        centerTitle: false,
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF0F172A),
        title: Text(
          'Formulir LPJ',
          style: GoogleFonts.figtree(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
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
            appBar: null,
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

  // Since DataTable is restrictive with dynamic row content like "Bukti Dokumen" sub-rows,
  // let's build a custom table-like structure using Rows and Columns.

  Widget _buildTableAlternative(
    LpjDetail detail,
    bool isEditable,
    int? roleId,
  ) {
    // Group items by category
    final groupedItems = <int, List<LpjRealization>>{};
    final kategoriNames = <int, String>{};

    for (var item in detail.anggaranItems) {
      groupedItems.putIfAbsent(item.kategoriBelanjaId, () => []).add(item);
      if (item.kategoriNama != null) {
        kategoriNames[item.kategoriBelanjaId] = item.kategoriNama!;
      }
    }

    final sortedKategoriIds = groupedItems.keys.toList()..sort();

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
        ...sortedKategoriIds.map((katId) {
          final items = groupedItems[katId]!;
          final katNama = kategoriNames[katId] ?? (katId == 1 ? 'Belanja Barang' : katId == 2 ? 'Belanja Jasa' : katId == 3 ? 'Belanja Perjalanan' : 'Lainnya');
          
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 16, 8),
                child: Text(
                  katNama,
                  style: GoogleFonts.figtree(
                    fontWeight: FontWeight.w900,
                    fontSize: 13,
                    color: const Color(0xFF33C8DA),
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              ...items.map((item) {
                final mainIdx = detail.anggaranItems.indexOf(item);
                final row = _rows[mainIdx];
                return _buildEnhancedRowItem(
                  mainIdx,
                  item,
                  row,
                  isEditable,
                  roleId,
                  detail,
                );
              }),
              const SizedBox(height: 8),
            ],
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
      'Item ${item.uraian} catatanReviewer: ${item.catatanReviewer}',
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
                            item.uraian.isEmpty ? 'KOSONG' : item.uraian,
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: hasRevision
                                  ? const Color(0xFF991B1B)
                                  : const Color(0xFF0F172A),
                            ),
                          ),
                          if (item.mataAnggaranNama.isNotEmpty && item.mataAnggaranNama != '-')
                            Text(
                              item.mataAnggaranNama,
                              style: GoogleFonts.figtree(
                                fontSize: 11,
                                color: Colors.grey.shade500,
                                fontStyle: FontStyle.italic,
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

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: row.volume1Controller,
                        decoration: InputDecoration(
                          labelText: 'Vol 1',
                          hintText: '0',
                          filled: true,
                          fillColor: Colors.white,
                          helperText: 'KAK: ${_formatDouble(item.volume)}',
                          helperStyle: const TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                        ),
                        keyboardType: TextInputType.number,
                        readOnly: !isEditable,
                        onChanged: (_) => setState(() {}),
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Wajib isi';
                          if (double.tryParse(v.replaceAll(',', '.')) == null) return 'Harus angka';
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildSatuanDropdown(
                        label: 'Satuan 1',
                        value: row.satuan1Id,
                        onChanged: isEditable
                            ? (v) => setState(() => row.satuan1Id = v)
                            : null,
                        validator: (v) => (v == null || v.isEmpty) ? 'Wajib isi' : null,
                        kakValue: item.satuan1Nama ?? '-',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: row.volume2Controller,
                        decoration: InputDecoration(
                          labelText: 'Vol 2 (opsional)',
                          hintText: '0',
                          filled: true,
                          fillColor: Colors.white,
                          helperText: 'KAK: ${item.volume2 != null ? _formatDouble(item.volume2!) : "-"}',
                          helperStyle: const TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                        ),
                        keyboardType: TextInputType.number,
                        readOnly: !isEditable,
                        onChanged: (_) => setState(() {}),
                        validator: (v) {
                          if (v != null && v.isNotEmpty && double.tryParse(v.replaceAll(',', '.')) == null) {
                            return 'Harus angka';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildSatuanDropdown(
                        label: 'Satuan 2',
                        value: row.satuan2Id,
                        onChanged: isEditable
                            ? (v) => setState(() => row.satuan2Id = v)
                            : null,
                        validator: (v) {
                          final vol2Text = row.volume2Controller.text;
                          final vol2Val = double.tryParse(vol2Text.replaceAll(',', '.')) ?? 0;
                          if (vol2Val > 0 && (v == null || v.isEmpty)) {
                            return 'Wajib isi';
                          }
                          return null;
                        },
                        kakValue: item.satuan2Nama ?? '-',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: row.volume3Controller,
                        decoration: InputDecoration(
                          labelText: 'Vol 3 (opsional)',
                          hintText: '0',
                          filled: true,
                          fillColor: Colors.white,
                          helperText: 'KAK: ${item.volume3 != null ? _formatDouble(item.volume3!) : "-"}',
                          helperStyle: const TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                        ),
                        keyboardType: TextInputType.number,
                        readOnly: !isEditable,
                        onChanged: (_) => setState(() {}),
                        validator: (v) {
                          if (v != null && v.isNotEmpty && double.tryParse(v.replaceAll(',', '.')) == null) {
                            return 'Harus angka';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildSatuanDropdown(
                        label: 'Satuan 3',
                        value: row.satuan3Id,
                        onChanged: isEditable
                            ? (v) => setState(() => row.satuan3Id = v)
                            : null,
                        validator: (v) {
                          final vol3Text = row.volume3Controller.text;
                          final vol3Val = double.tryParse(vol3Text.replaceAll(',', '.')) ?? 0;
                          if (vol3Val > 0 && (v == null || v.isEmpty)) {
                            return 'Wajib isi';
                          }
                          return null;
                        },
                        kakValue: item.satuan3Nama ?? '-',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: row.hargaSatuanController,
                  decoration: InputDecoration(
                    labelText: 'Harga Satuan (Rp)',
                    hintText: '0',
                    prefixIcon: const Icon(Icons.paid_outlined, size: 18),
                    filled: true,
                    fillColor: Colors.white,
                    helperText: 'KAK: ${_formatCurrency(item.hargaSatuan)}',
                    helperStyle: const TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                  ),
                  keyboardType: TextInputType.number,
                  readOnly: !isEditable,
                  onChanged: (_) => setState(() {}),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Wajib isi';
                    if (double.tryParse(v.replaceAll(',', '.')) == null) return 'Harus angka';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF33C8DA),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF33C8DA).withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total Realisasi',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                      Text(
                        _formatCurrency(_calculateRowTotal(row)),
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
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
                _buildEvidenceList(item.anggaranId, isEditable, item.lampiran),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSatuanDropdown({
    required String label,
    required String? value,
    required ValueChanged<String?>? onChanged,
    String? Function(String?)? validator,
    required String kakValue,
  }) {
    return DropdownButtonFormField<String>(
      isExpanded: true,
      value: _satuanOptions.any((s) => s.id == value) ? value : null,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        helperText: 'KAK: $kakValue',
        helperStyle: const TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1), width: 1.2),
        ),
      ),
      items: [
        const DropdownMenuItem<String>(
          value: null,
          child: Text('Satuan'),
        ),
        ..._satuanOptions.map((s) => DropdownMenuItem<String>(
              value: s.id,
              child: Text(s.name, overflow: TextOverflow.ellipsis),
            )),
      ],
      onChanged: onChanged,
      validator: validator,
    );
  }

  Widget _buildEvidenceList(
    String anggaranId,
    bool isEditable,
    List<LpjLampiran>? existingLampiran,
  ) {
    final List<dynamic> allFiles = [];

    // Add newly selected files
    final selected = _selectedFilesMap[anggaranId];
    if (selected != null) {
      allFiles.addAll(selected);
    }

    // Add existing uploaded files from backend
    if (existingLampiran != null) {
      allFiles.addAll(existingLampiran);
    }

    if (allFiles.isEmpty) {
      return const Text(
        'Belum ada dokumen bukti.',
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
      children: allFiles.map((file) {
        String fileName;
        String? fileUrl;
        if (file is PlatformFile) {
          fileName = file.name;
          // For newly selected files, there's no URL yet, they are just local files
          fileUrl = null;
        } else if (file is LpjLampiran) {
          fileName = file.namaFileAsli;
          fileUrl = file.url;
        } else {
          fileName = 'Unknown File';
        }

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: fileUrl != null
                  ? const Color(0xFF10B981)
                  : const Color(0xFFE2E8F0), // Green border for uploaded files
              width: fileUrl != null ? 1.5 : 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                fileUrl != null
                    ? Icons.check_circle_outline
                    : Icons.file_present,
                size: 14,
                color: fileUrl != null
                    ? const Color(0xFF10B981)
                    : const Color(0xFF33C8DA),
              ),
              const SizedBox(width: 6),
              Flexible(
                child: GestureDetector(
                  onTap: fileUrl != null
                      ? () => _launchURL(fileUrl!)
                      : null,
                  child: Text(
                    fileName,
                    style: TextStyle(
                      fontSize: 11,
                      decoration: fileUrl != null
                          ? TextDecoration.underline
                          : TextDecoration.none,
                      color: fileUrl != null
                          ? const Color(0xFF33C8DA)
                          : Colors.black,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
              if (isEditable && file is PlatformFile) ...[
                // Only allow deleting newly selected files
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () => setState(
                    () => _selectedFilesMap[anggaranId]!.remove(file),
                  ),
                  child: const Icon(Icons.close, size: 14, color: Colors.red),
                ),
              ],
              if (isEditable && file is LpjLampiran) ...[
                // Add a delete icon for existing uploaded files
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () {
                    // TODO: Implement logic to mark existing file for deletion
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:
                            Text('Delete existing file not yet implemented'),
                      ),
                    );
                  },
                  child:
                      const Icon(Icons.delete_outline, size: 14, color: Colors.red),
                ),
              ],
            ],
          ),
        );
      }).toList(),
    );
  }

  Future<void> _launchURL(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Tidak bisa membuka $url')),
      );
    }
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

          // Tanggal Realisasi
          if (detail.kakTanggalMulai != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                'RENCANA KAK: ${DateFormat('dd MMMM yyyy', 'id_ID').format(DateTime.parse(detail.kakTanggalMulai!))} s/d ${detail.kakTanggalSelesai != null ? DateFormat('dd MMMM yyyy', 'id_ID').format(DateTime.parse(detail.kakTanggalSelesai!)) : "-"}',
                style: GoogleFonts.figtree(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0891B2),
                ),
              ),
            ),
          _buildDateField(
            label: 'TANGGAL MULAI REALISASI',
            value: _tglMulai,
            onTap: () => _selectDate(context, true),
            enabled: isEditable,
          ),
          const SizedBox(height: 16),
          _buildDateField(
            label: 'TANGGAL SELESAI REALISASI',
            value: _tglSelesai,
            onTap: () => _selectDate(context, false),
            enabled: isEditable,
          ),
          const SizedBox(height: 6),
          const Text(
            'Pilih tanggal mulai dan selesai realisasi pelaksanaan kegiatan.',
            style: TextStyle(fontSize: 10, color: Colors.grey, height: 1.4),
          ),

          const SizedBox(height: 20),

          // IKU Targets display
          if (detail.ikus != null && detail.ikus!.isNotEmpty) ...[
            Text(
              'TARGET IKU (REFERENSI KAK)',
              style: GoogleFonts.figtree(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                color: const Color(0xFF475569),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),
            ...detail.ikus!.map((iku) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle,
                          size: 12, color: Color(0xFF0891B2)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${iku.namaIku ?? "IKU"}: Target ${_formatDouble(iku.target)} ${iku.satuanNama ?? ""}',
                          style: GoogleFonts.figtree(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF0891B2),
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
            const SizedBox(height: 16),
          ],

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

  String _formatDouble(double val) {
    if (val == val.toInt()) {
      return val.toInt().toString();
    }
    return val.toString();
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

  static String _formatVal(double val) {
    if (val == val.toInt()) {
      return val.toInt().toString();
    }
    return val.toString();
  }

  factory _RealisasiRowControllers.fromItem(LpjRealization item) {
    return _RealisasiRowControllers(
      volume1Controller: TextEditingController(
        text: (() {
          final val = item.realisasiVolume1 ?? item.volume;
          return val == 0 ? '' : _formatVal(val);
        })(),
      ),
      volume2Controller: TextEditingController(
        text: (item.realisasiVolume2 == null || item.realisasiVolume2 == 0) ? '' : _formatVal(item.realisasiVolume2!),
      ),
      volume3Controller: TextEditingController(
        text: (item.realisasiVolume3 == null || item.realisasiVolume3 == 0) ? '' : _formatVal(item.realisasiVolume3!),
      ),
      hargaSatuanController: TextEditingController(
        text: (() {
          final val = item.realisasiHargaSatuan ?? item.hargaSatuan;
          return val == 0 ? '' : val.toStringAsFixed(0);
        })(),
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
