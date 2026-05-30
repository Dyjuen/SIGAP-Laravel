import 'package:flutter/material.dart';
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
        title: Text('Tolak KAK', style: GoogleFonts.figtree(fontWeight: FontWeight.bold)),
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

  void _showRevisionDialog() {
    catatanController.clear();
    final Map<String, TextEditingController> fieldControllers = {
      'nama_kegiatan': TextEditingController(),
      'deskripsi_kegiatan': TextEditingController(),
      'tipe_kegiatan_id': TextEditingController(),
      'sasaran_utama': TextEditingController(),
      'metode_pelaksanaan': TextEditingController(),
      'lokasi': TextEditingController(),
      'tanggal': TextEditingController(),
    };

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Minta Revisi KAK', style: GoogleFonts.figtree(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Catatan Umum:'),
              const SizedBox(height: 8),
              TextField(
                controller: catatanController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Catatan revisi (opsional)...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Catatan per Field (opsional):'),
              const SizedBox(height: 8),
              ..._buildFieldInputs(fieldControllers),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              fieldControllers.forEach((_, controller) => controller.dispose());
            },
            child: const Text('Batal'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              _requestRevision(fieldControllers);
              fieldControllers.forEach((_, controller) => controller.dispose());
            },
            child: const Text('Minta Revisi'),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildFieldInputs(
    Map<String, TextEditingController> controllers,
  ) {
    const fields = [
      ('nama_kegiatan', 'Nama Kegiatan'),
      ('deskripsi_kegiatan', 'Deskripsi Kegiatan'),
      ('tipe_kegiatan_id', 'Tipe Kegiatan'),
      ('sasaran_utama', 'Sasaran Utama'),
      ('metode_pelaksanaan', 'Metode Pelaksanaan'),
      ('lokasi', 'Lokasi'),
      ('tanggal', 'Tanggal'),
    ];

    return fields
        .map(
          (field) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: TextField(
              controller: controllers[field.$1],
              maxLines: 2,
              decoration: InputDecoration(
                labelText: field.$2,
                hintText: 'Catatan untuk ${field.$2.toLowerCase()}...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
        )
        .toList();
  }

  Future<void> _requestRevision(
    Map<String, TextEditingController> fieldControllers,
  ) async {
    setState(() => isProcessing = true);

    try {
      final kakService = context.read<KakService>();
      final catatanFields = <String, String>{};

      fieldControllers.forEach((key, controller) {
        if (controller.text.trim().isNotEmpty) {
          catatanFields[key] = controller.text.trim();
        }
      });

      await kakService.reviseKak(
        widget.kakId.toString(),
        catatanController.text.trim().isNotEmpty ? catatanController.text.trim() : null,
        catatanFields.isNotEmpty ? catatanFields : null,
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
        appBar: AppBar(title: Text('Review KAK', style: GoogleFonts.figtree(fontWeight: FontWeight.bold))),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (provider.isError) {
      return Scaffold(
        appBar: AppBar(title: Text('Review KAK', style: GoogleFonts.figtree(fontWeight: FontWeight.bold))),
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
        title: Text('Review KAK', style: GoogleFonts.figtree(fontWeight: FontWeight.bold)),
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
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
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
                          onPressed: isProcessing ? null : _showRevisionDialog,
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
        data['tahun_anggaran'] = int.parse(_tahunAnggaranController.text.trim());
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
                          color: _mode == 'daftar' ? Colors.white : Colors.black87,
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
                          color: _mode == 'manual' ? Colors.white : Colors.black87,
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
                    Text('Gagal memuat mata anggaran: $_loadError', style: const TextStyle(color: Colors.red)),
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
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                validator: (val) {
                  if (_mode == 'manual' && (val == null || val.trim().isEmpty)) {
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
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                validator: (val) {
                  if (_mode == 'manual' && (val == null || val.trim().isEmpty)) {
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
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      validator: (val) {
                        if (_mode == 'manual') {
                          if (val == null || val.trim().isEmpty) {
                            return 'Tahun wajib diisi';
                          }
                          if (val.trim().length != 4 || int.tryParse(val.trim()) == null) {
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
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Total Pagu',
                        hintText: '500000000',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
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
                    style: GoogleFonts.figtree(fontWeight: FontWeight.w600, color: Colors.grey.shade600),
                  ),
                ),
                const SizedBox(width: 16),
                FilledButton(
                  onPressed: _submit,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    'Setujui KAK',
                    style: GoogleFonts.figtree(fontWeight: FontWeight.bold, color: Colors.white),
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
