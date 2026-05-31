import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/lpj_model.dart';
import '../../providers/lpj_provider.dart';
import '../../services/master_data_service.dart';

class LpjFormPage extends StatefulWidget {
  final String kegiatanId;

  const LpjFormPage({super.key, required this.kegiatanId});

  @override
  State<LpjFormPage> createState() => _LpjFormPageState();
}

class _LpjFormPageState extends State<LpjFormPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final List<_RealisasiRowControllers> _rows = [];
  final List<PlatformFile> _selectedFiles = [];
  final List<_SatuanOption> _satuanOptions = [];

  bool _initialized = false;
  bool _loadingSatuan = true;
  double _spkWaktu = 50;
  double _spkOutput = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      if (widget.kegiatanId.isNotEmpty) {
        await context.read<LpjProvider>().getLpjDetail(widget.kegiatanId);
      }
      await _loadSatuan();
    });
  }

  @override
  void dispose() {
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

    _spkWaktu = (detail.spkKesesuaianWaktu ?? 50).toDouble();
    _spkOutput = (detail.spkKesesuaianOutput ?? 0).toDouble();
    _initialized = true;
  }

  Future<void> _pickFiles() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
      );

      if (result != null && result.files.isNotEmpty) {
        setState(() => _selectedFiles.addAll(result.files));
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal memilih file: $e')));
    }
  }

  Future<void> _submit(LpjDetail detail, LpjProvider provider) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final realizasiData = <Map<String, dynamic>>[];
    for (var index = 0; index < _rows.length; index++) {
      final row = _rows[index];
      final item = detail.anggaranItems[index];

      realizasiData.add({
        'anggaran_id': item.anggaranId,
        'volume1': _parseDouble(row.volume1Controller.text),
        'satuan1_id': _parseIntSafe(row.satuan1Id),
        'volume2': _isBlank(row.volume2Controller.text)
            ? null
            : _parseDouble(row.volume2Controller.text),
        'satuan2_id': _parseIntSafe(row.satuan2Id),
        'volume3': _isBlank(row.volume3Controller.text)
            ? null
            : _parseDouble(row.volume3Controller.text),
        'satuan3_id': _parseIntSafe(row.satuan3Id),
        'harga_satuan': _parseDouble(row.hargaSatuanController.text),
      });
    }

    final filePaths = _selectedFiles
        .map((file) => file.path)
        .whereType<String>()
        .toList();

    final success = detail.isRevisionRequested
        ? await provider.resubmitLpj(
            kegiatanId: detail.kegiatanId,
            realizasiData: realizasiData,
            buktiFilePaths: filePaths.isEmpty ? null : filePaths,
          )
        : await provider.submitLpj(
            kegiatanId: detail.kegiatanId,
            realizasiData: realizasiData,
            buktiFilePaths: filePaths.isEmpty ? null : filePaths,
          );

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
          'Form LPJ',
          style: GoogleFonts.figtree(fontWeight: FontWeight.w800),
        ),
      ),
      body: Consumer<LpjProvider>(
        builder: (context, provider, _) {
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

          final isEditable = detail.canEditPengusul;

          return RefreshIndicator(
            onRefresh: () => provider.getLpjDetail(detail.kegiatanId),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildHeader(detail),
                    const SizedBox(height: 16),
                    _buildDeadlineCard(detail),
                    const SizedBox(height: 16),
                    _buildSummaryCard(detail),
                    const SizedBox(height: 16),
                    _buildSectionTitle('Realisasi Anggaran'),
                    const SizedBox(height: 12),
                    ...detail.anggaranItems.asMap().entries.map(
                      (entry) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildRowCard(
                          entry.key,
                          entry.value,
                          _rows[entry.key],
                          isEditable,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildSectionTitle('Bukti Dokumen'),
                    const SizedBox(height: 12),
                    _buildEvidencePicker(isEditable),
                    const SizedBox(height: 16),
                    _buildSectionTitle('SPK LPJ'),
                    const SizedBox(height: 12),
                    _buildSpkCard(isEditable),
                    const SizedBox(height: 16),
                    if (!isEditable)
                      _buildReadOnlyNotice(detail)
                    else
                      _buildSubmitButton(detail, provider),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(LpjDetail detail) {
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
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Badge(
                label: detail.statusDisplay,
                color: _statusColor(detail.lpjStatus),
              ),
              _Badge(
                label: detail.approvalStatus,
                color: const Color(0xFF38BDF8),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            detail.canEditPengusul
                ? 'Isi realisasi sesuai web, lampirkan bukti, lalu submit.'
                : 'LPJ ini sudah tidak dapat diedit.',
            style: GoogleFonts.figtree(
              color: Colors.white.withOpacity(0.86),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeadlineCard(LpjDetail detail) {
    final deadline = detail.tglBatasLpj;
    if (deadline == null || deadline.isEmpty) {
      return _InfoCard(
        icon: Icons.schedule_rounded,
        title: 'Batas LPJ',
        subtitle: 'Belum tersedia',
      );
    }

    final parsed = DateTime.tryParse(deadline);
    final formatted = parsed == null
        ? deadline
        : DateFormat('dd MMM yyyy', 'id_ID').format(parsed);

    return _InfoCard(
      icon: Icons.schedule_rounded,
      title: 'Batas LPJ',
      subtitle: formatted,
      trailing: _deadlineText(deadline),
    );
  }

  Widget _buildSummaryCard(LpjDetail detail) {
    return Row(
      children: [
        Expanded(
          child: _SmallSummaryCard(
            label: 'Diusulkan',
            value: _formatCurrency(detail.totalAnggaranDiusulkan),
            color: const Color(0xFF33C8DA),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _SmallSummaryCard(
            label: 'Realisasi',
            value: _formatCurrency(detail.totalRealisasi),
            color: const Color(0xFF10B981),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.figtree(
        fontSize: 16,
        fontWeight: FontWeight.w800,
        color: const Color(0xFF0F172A),
      ),
    );
  }

  Widget _buildRowCard(
    int index,
    LpjRealization item,
    _RealisasiRowControllers row,
    bool isEditable,
  ) {
    final title = item.mataAnggaranNama.isNotEmpty
        ? item.mataAnggaranNama
        : 'Item ${index + 1}';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.figtree(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            item.uraianKegiatan,
            style: GoogleFonts.figtree(color: const Color(0xFF64748B)),
          ),
          const SizedBox(height: 12),
          _buildNumberField(
            controller: row.volume1Controller,
            label: 'Volume 1',
            enabled: isEditable,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
              if (_isBlank(value)) {
                return 'Volume 1 wajib diisi';
              }
              if (double.tryParse(value) == null) {
                return 'Volume 1 harus angka';
              }
              return null;
            },
          ),
          const SizedBox(height: 10),
          _buildSatuanDropdown(
            label: 'Satuan 1',
            value: row.satuan1Id,
            enabled: isEditable,
            requiredField: true,
            onChanged: (value) => setState(() => row.satuan1Id = value),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildNumberField(
                  controller: row.volume2Controller,
                  label: 'Volume 2',
                  enabled: isEditable,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                    if (_isBlank(value)) {
                      return null;
                    }
                    if (double.tryParse(value) == null) {
                      return 'Harus angka';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildSatuanDropdown(
                  label: 'Satuan 2',
                  value: row.satuan2Id,
                  enabled: isEditable,
                  requiredField: false,
                  onChanged: (value) => setState(() => row.satuan2Id = value),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildNumberField(
                  controller: row.volume3Controller,
                  label: 'Volume 3',
                  enabled: isEditable,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                    if (_isBlank(value)) {
                      return null;
                    }
                    if (double.tryParse(value) == null) {
                      return 'Harus angka';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildSatuanDropdown(
                  label: 'Satuan 3',
                  value: row.satuan3Id,
                  enabled: isEditable,
                  requiredField: false,
                  onChanged: (value) => setState(() => row.satuan3Id = value),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildNumberField(
            controller: row.hargaSatuanController,
            label: 'Harga Satuan',
            enabled: isEditable,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
              if (_isBlank(value)) {
                return 'Harga satuan wajib diisi';
              }
              if (double.tryParse(value) == null) {
                return 'Harga satuan harus angka';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEvidencePicker(bool isEditable) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Pilih file bukti pendukung',
            style: GoogleFonts.figtree(
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Format yang didukung: JPG, PNG, dan PDF.',
            style: GoogleFonts.figtree(color: const Color(0xFF64748B)),
          ),
          const SizedBox(height: 14),
          OutlinedButton.icon(
            onPressed: isEditable ? _pickFiles : null,
            icon: const Icon(Icons.upload_file_rounded),
            label: const Text('Pilih File'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          if (_selectedFiles.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _selectedFiles
                  .map(
                    (file) => InputChip(
                      label: Text(file.name),
                      onDeleted: isEditable
                          ? () {
                              setState(() => _selectedFiles.remove(file));
                            }
                          : null,
                    ),
                  )
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSpkCard(bool isEditable) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSliderSection(
            title: 'Kesesuaian Waktu',
            value: _spkWaktu,
            min: 50,
            max: 100,
            enabled: isEditable,
            onChanged: (value) => setState(() => _spkWaktu = value),
          ),
          const SizedBox(height: 18),
          _buildSliderSection(
            title: 'Kesesuaian Output (IKU)',
            value: _spkOutput,
            min: 0,
            max: 100,
            enabled: isEditable,
            onChanged: (value) => setState(() => _spkOutput = value),
          ),
        ],
      ),
    );
  }

  Widget _buildSliderSection({
    required String title,
    required double value,
    required double min,
    required double max,
    required bool enabled,
    required ValueChanged<double> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$title: ${value.round()}%',
          style: GoogleFonts.figtree(
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0F172A),
          ),
        ),
        Slider(
          value: value.clamp(min, max),
          min: min,
          max: max,
          divisions: (max - min).round(),
          activeColor: const Color(0xFF33C8DA),
          onChanged: enabled ? onChanged : null,
        ),
      ],
    );
  }

  Widget _buildReadOnlyNotice(LpjDetail detail) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(
        detail.isSubmitted
            ? 'LPJ sedang menunggu approval Bendahara.'
            : 'LPJ ini belum dapat diubah.',
        style: GoogleFonts.figtree(color: const Color(0xFF475569)),
      ),
    );
  }

  Widget _buildSubmitButton(LpjDetail detail, LpjProvider provider) {
    final label = detail.isRevisionRequested
        ? 'Submit Ulang LPJ'
        : 'Submit LPJ';

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: provider.isSubmitting
            ? null
            : () => _submit(detail, provider),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF33C8DA),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: provider.isSubmitting
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2.4,
                ),
              )
            : Text(
                label,
                style: GoogleFonts.figtree(fontWeight: FontWeight.w800),
              ),
      ),
    );
  }

  Widget _buildNumberField({
    required TextEditingController controller,
    required String label,
    required bool enabled,
    required String? Function(String?) validator,
  }) {
    return TextFormField(
      controller: controller,
      enabled: enabled,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        filled: true,
        fillColor: enabled ? Colors.white : const Color(0xFFF8FAFC),
      ),
    );
  }

  Widget _buildSatuanDropdown({
    required String label,
    required String? value,
    required bool enabled,
    required bool requiredField,
    required ValueChanged<String?> onChanged,
  }) {
    if (_loadingSatuan) {
      return const LinearProgressIndicator(minHeight: 2.5);
    }

    if (_satuanOptions.isEmpty) {
      return TextFormField(
        enabled: enabled,
        initialValue: value,
        keyboardType: TextInputType.number,
        validator: requiredField
            ? (text) {
                if (text == null || text.trim().isEmpty) {
                if (_isBlank(text)) {
                  return '$label wajib diisi';
                }
                if (int.tryParse(text) == null) {
                  return '$label harus berupa ID satuan';
                }
                return null;
              }
            : null,
        decoration: InputDecoration(
          labelText: '$label (ID)',
          helperText: 'Daftar satuan belum dimuat, masukkan ID satuan.',
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
        ),
        onChanged: (text) => onChanged(text),
      );
    }

    return DropdownButtonFormField<String>(
      value: value,
      isExpanded: true,
      validator: requiredField
          ? (selected) => selected == null || selected.isEmpty
                ? '$label wajib diisi'
                : null
          : null,
      items: _satuanOptions
          .map(
            (option) =>
                DropdownMenuItem(value: option.id, child: Text(option.name)),
          )
          .toList(),
      onChanged: enabled ? onChanged : null,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        filled: true,
        fillColor: enabled ? Colors.white : const Color(0xFFF8FAFC),
      ),
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

  String _deadlineText(String rawValue) {
    final deadline = DateTime.tryParse(rawValue);
    if (deadline == null) return rawValue;

    final remaining = deadline.difference(DateTime.now()).inDays;
    if (remaining > 0) {
      return 'Sisa $remaining hari';
    }
    if (remaining == 0) {
      return 'Jatuh tempo hari ini';
    }
    return 'Terlambat ${remaining.abs()} hari';
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
    final normalized = value?.toString().trim();
    if (normalized == null || normalized.isEmpty) return null;
    return int.tryParse(normalized);
  }

  bool _isBlank(Object? value) {
    return value == null || value.toString().trim().isEmpty;
  }
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

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String? trailing;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
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
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFF),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: const Color(0xFF33C8DA)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.figtree(
                    color: const Color(0xFF64748B),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.figtree(
                    color: const Color(0xFF0F172A),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          if (trailing != null)
            Text(
              trailing!,
              style: GoogleFonts.figtree(
                color: const Color(0xFF334155),
                fontWeight: FontWeight.w700,
              ),
            ),
        ],
      ),
    );
  }
}

class _SmallSummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _SmallSummaryCard({
    required this.label,
    required this.value,
    required this.color,
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
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(height: 10),
          Text(
            label,
            style: GoogleFonts.figtree(
              color: const Color(0xFF64748B),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.figtree(
              color: const Color(0xFF0F172A),
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
