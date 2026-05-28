import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../models/kak_model.dart';
import '../../providers/kak_detail_provider.dart';
import '../../services/kak_service.dart';
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
  bool isLoading = true;
  bool isProcessing = false;
  KakDetail? kakDetail;
  String? errorMessage;

  final TextEditingController catatanController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadKakDetail();
  }

  Future<void> _loadKakDetail() async {
    try {
      final kakService = context.read<KakService>();
      final detail = await kakService.getKakDetail(widget.kakId.toString());
      setState(() {
        kakDetail = detail;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
        isLoading = false;
      });
    }
  }

  Future<void> _approveKak() async {
    setState(() => isProcessing = true);

    try {
      final kakService = context.read<KakService>();
      await kakService.approveKak(widget.kakId.toString());

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
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Tolak KAK', style: GoogleFonts.figtree()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Berikan alasan penolakan:'),
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
    if (catatanController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Alasan penolakan tidak boleh kosong')),
      );
      return;
    }

    setState(() => isProcessing = true);

    try {
      final kakService = context.read<KakService>();
      await kakService.rejectKak(
        widget.kakId.toString(),
        catatanController.text,
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
        title: Text('Minta Revisi KAK', style: GoogleFonts.figtree()),
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
        if (controller.text.isNotEmpty) {
          catatanFields[key] = controller.text;
        }
      });

      await kakService.requestRevisionKak(
        widget.kakId.toString(),
        catatanController.text.isNotEmpty ? catatanController.text : null,
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
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('Detail KAK', style: GoogleFonts.figtree())),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (errorMessage != null) {
      return Scaffold(
        appBar: AppBar(title: Text('Detail KAK', style: GoogleFonts.figtree())),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(errorMessage!),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() => isLoading = true);
                  _loadKakDetail();
                },
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text('Review KAK', style: GoogleFonts.figtree())),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // KAK Detail
            if (kakDetail != null)
              Padding(
                padding: const EdgeInsets.all(16),
                child: KakDetailPage(kakId: widget.kakId),
              ),

            const SizedBox(height: 24),

            // Action Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  FilledButton(
                    onPressed: isProcessing ? null : _approveKak,
                    child: isProcessing
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(
                            'Setujui KAK',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: isProcessing ? null : _showRevisionDialog,
                    child: Text(
                      'Minta Revisi',
                      style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: isProcessing ? null : _showRejectDialog,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red),
                    ),
                    child: Text(
                      'Tolak KAK',
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.w600,
                        color: Colors.red,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    catatanController.dispose();
    super.dispose();
  }
}
