import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../models/kak_model.dart';
import '../../services/kak_service.dart';
import '../../services/master_data_service.dart';
import '../../services/chatbot_service.dart';
import 'kak_create_edit_form.dart';

class KakFormPage extends StatefulWidget {
  final int? kakId;

  const KakFormPage({super.key, this.kakId});

  @override
  State<KakFormPage> createState() => _KakFormPageState();
}

class _KakFormPageState extends State<KakFormPage> {
  List<dynamic> tipeKegiatanOptions = [];
  List<dynamic> ikuOptions = [];
  List<dynamic> satuanOptions = [];
  bool isLoading = false;
  bool isLoadingData = true;
  String? errorMessage;
  Map<String, dynamic> currentFormData = {};
  KakDetail? kakDetail;

  bool get isEdit => widget.kakId != null;

  @override
  void initState() {
    super.initState();
    _loadData();
    // Hide chatbot when filling KAK
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatbotService>().setVisible(false);
    });
  }

  @override
  void dispose() {
    // Show chatbot again when leaving KAK form
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ChatbotService>().setVisible(true);
      }
    });
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      isLoadingData = true;
      errorMessage = null;
    });
    try {
      // Load master data
      final masterDataService = context.read<MasterDataService>();
      final tipeKegiatanData = await masterDataService.getTipeKegiatan();
      final ikuData = await masterDataService.getIku();
      final satuanData = await masterDataService.getSatuan();

      setState(() {
        tipeKegiatanOptions = tipeKegiatanData;
        ikuOptions = ikuData;
        satuanOptions = satuanData;
      });

      // Load KAK detail if edit mode
      if (isEdit) {
        final kakService = context.read<KakService>();
        final detail = await kakService.getKakDetail(widget.kakId.toString());
        setState(() {
          kakDetail = detail;
        });
      }

      setState(() {
        isLoadingData = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = 'Gagal memuat data: $e';
        isLoadingData = false;
      });
    }
  }

  Future<void> _submitForm(Map<String, dynamic> formData) async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final kakService = context.read<KakService>();
      if (isEdit) {
        await kakService.updateKak(widget.kakId.toString(), formData);
      } else {
        await kakService.createKak(formData);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isEdit ? 'KAK berhasil diperbarui' : 'KAK berhasil dibuat'),
            backgroundColor: const Color(0xFF2E7D32),
          ),
        );

        Navigator.pop(context, true); // Return true to indicate success
      }
    } catch (e) {
      setState(() {
        errorMessage = e.toString().replaceAll('Exception: ', '');
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage ?? (isEdit ? 'Gagal memperbarui KAK' : 'Gagal membuat KAK')),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = isEdit ? 'Edit KAK' : 'Buat KAK Baru';

    if (isLoadingData) {
      return Scaffold(
        appBar: AppBar(title: Text(title, style: GoogleFonts.figtree())),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (errorMessage != null && isEdit && kakDetail == null) {
      // Show error only if it's an initial load error
      return Scaffold(
        appBar: AppBar(title: Text(title, style: GoogleFonts.figtree())),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(errorMessage!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadData,
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(title, style: GoogleFonts.figtree())),
      body: KakCreateEditForm(
        initialData: kakDetail,
        tipeKegiatanOptions: tipeKegiatanOptions,
        ikuOptions: ikuOptions,
        satuanOptions: satuanOptions,
        isLoading: isLoading,
        onFormChange: (formData) {
          setState(() {
            currentFormData = formData;
          });
        },
        onSubmit: () => _submitForm(currentFormData),
      ),
    );
  }
}
