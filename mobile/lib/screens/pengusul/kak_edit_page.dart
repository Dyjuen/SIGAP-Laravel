import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../models/kak_model.dart';
import '../../providers/kak_detail_provider.dart';
import '../../services/kak_service.dart';
import '../../services/master_data_service.dart';
import '../../services/chatbot_service.dart';
import 'kak_create_edit_form.dart';

class KakEditPage extends StatefulWidget {
  final int kakId;

  const KakEditPage({super.key, required this.kakId});

  @override
  State<KakEditPage> createState() => _KakEditPageState();
}

class _KakEditPageState extends State<KakEditPage> {
  List<dynamic> tipeKegiatanOptions = [];
  List<dynamic> ikuOptions = [];
  List<dynamic> satuanOptions = [];
  List<dynamic> kategoriBelanjaOptions = [];
  bool isLoading = false;
  bool isLoadingMaster = true;
  bool isLoadingData = true;
  String? errorMessage;
  Map<String, dynamic> currentFormData = {};
  KakDetail? kakDetail;

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
    // Show chatbot again when leaving
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ChatbotService>().setVisible(true);
      }
    });
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      // Load master data
      final masterDataService = context.read<MasterDataService>();
      final tipeKegiatanData = await masterDataService.getTipeKegiatan();
      final ikuData = await masterDataService.getIku();
      final satuanData = await masterDataService.getSatuan();
      final kategoriBelanjaData = await masterDataService.getKategoriBelanja();

      setState(() {
        tipeKegiatanOptions = tipeKegiatanData;
        ikuOptions = ikuData;
        satuanOptions = satuanData;
        kategoriBelanjaOptions = kategoriBelanjaData;
        isLoadingMaster = false;
      });

      // Load KAK detail
      final kakService = context.read<KakService>();
      final detail = await kakService.getKakDetail(widget.kakId.toString());

      setState(() {
        kakDetail = detail;
        isLoadingData = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = 'Gagal memuat data: $e';
        isLoadingMaster = false;
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
      await kakService.updateKak(widget.kakId.toString(), formData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('KAK berhasil diperbarui'),
            backgroundColor: Color(0xFF2E7D32),
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
            content: Text(errorMessage ?? 'Gagal memperbarui KAK'),
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
    if (isLoadingMaster || isLoadingData) {
      return Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          centerTitle: false,
          title: Text(
            'Edit KAK',
            style: GoogleFonts.figtree(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (errorMessage != null) {
      return Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          centerTitle: false,
          title: Text(
            'Edit KAK',
            style: GoogleFonts.figtree(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(errorMessage!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    isLoadingData = true;
                  });
                  _loadData();
                },
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        centerTitle: false,
        title: Text(
          'Edit KAK',
          style: GoogleFonts.figtree(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
      ),
      body: KakCreateEditForm(
        initialData: kakDetail,
        tipeKegiatanOptions: tipeKegiatanOptions,
        ikuOptions: ikuOptions,
        satuanOptions: satuanOptions,
        kategoriBelanjaOptions: kategoriBelanjaOptions,
        readOnly: (kakDetail?.statusId == 2 || kakDetail?.statusId == 3),
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
