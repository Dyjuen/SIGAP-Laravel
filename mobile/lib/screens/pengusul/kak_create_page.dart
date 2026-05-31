import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../services/kak_service.dart';
import '../../services/master_data_service.dart';
import 'kak_create_edit_form.dart';

class KakCreatePage extends StatefulWidget {
  const KakCreatePage({super.key});

  @override
  State<KakCreatePage> createState() => _KakCreatePageState();
}

class _KakCreatePageState extends State<KakCreatePage> {
  List<dynamic> tipeKegiatanOptions = [];
  List<dynamic> ikuOptions = [];
  List<dynamic> satuanOptions = [];
  bool isLoading = false;
  bool isLoadingMaster = true;
  String? errorMessage;
  Map<String, dynamic> currentFormData = {};

  @override
  void initState() {
    super.initState();
    _loadMasterData();
  }

  Future<void> _loadMasterData() async {
    try {
      final masterDataService = context.read<MasterDataService>();
      final tipeKegiatanData = await masterDataService.getTipeKegiatan();
      final ikuData = await masterDataService.getIku();
      final satuanData = await masterDataService.getSatuan();

      setState(() {
        tipeKegiatanOptions = tipeKegiatanData;
        ikuOptions = ikuData;
        satuanOptions = satuanData;
        isLoadingMaster = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = 'Gagal memuat data master: $e';
        isLoadingMaster = false;
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
      await kakService.createKak(formData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('KAK berhasil dibuat'),
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
            content: Text(errorMessage ?? 'Gagal membuat KAK'),
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
    if (isLoadingMaster) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Buat KAK Baru', style: GoogleFonts.figtree()),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Buat KAK Baru', style: GoogleFonts.figtree()),
      ),
      body: KakCreateEditForm(
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
