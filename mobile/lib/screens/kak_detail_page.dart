import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/kak_model.dart';
import '../providers/kak_detail_provider.dart';
import '../services/master_data_service.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import 'pengusul/pengajuan_create_page.dart';
import 'pengusul/kak_create_edit_form.dart';

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
  List<dynamic> tipeKegiatanOptions = [];
  List<dynamic> ikuOptions = [];
  List<dynamic> satuanOptions = [];
  List<dynamic> kategoriBelanjaOptions = [];
  bool isLoadingMaster = true;
  bool _isEditing = false;
  Map<String, dynamic>? _currentFormData;

  // Removed: final GlobalKey<KakCreateEditFormState> _kakFormKey = GlobalKey<KakCreateEditFormState>();

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  Future<void> _loadAllData() async {
    setState(() => isLoadingMaster = true);
    try {
      if (!widget.embedMode) {
        if (mounted) {
          await context.read<KakDetailProvider>().loadKakDetail(widget.kakId);
        }
      }

      if (mounted) {
        final masterService = context.read<MasterDataService>();
        final results = await Future.wait([
          masterService.getTipeKegiatan(),
          masterService.getIku(),
          masterService.getSatuan(),
          masterService.getKategoriBelanja(),
        ]);

        setState(() {
          tipeKegiatanOptions = results[0];
          ikuOptions = results[1];
          satuanOptions = results[2];
          kategoriBelanjaOptions = results[3];
          isLoadingMaster = false;
          _isEditing = false; // Reset editing state on reload
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => isLoadingMaster = false);
        _isEditing = false; // Reset editing state on error
      }
    }
  }

  void _handleFormChange(Map<String, dynamic> formData) {
    setState(() {
      _currentFormData = formData;
    });
  }

  Future<void> _saveKak() async {
    final formData = _currentFormData; // Use _currentFormData directly
    if (formData != null) {
      if (mounted) {
        final provider = context.read<KakDetailProvider>();
        final success = await provider.updateKak(widget.kakId, formData);

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('KAK berhasil diperbarui'),
              backgroundColor: Color(0xFF2E7D32),
            ),
          );
          setState(() {
            _isEditing = false;
          });
          // Reload KAK detail to ensure UI is updated with fresh data and notes
          _loadAllData();
        } else if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(provider.errorMessage ?? 'Gagal memperbarui KAK'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      }
    }
  }

  void _cancelEdit() {
    setState(() {
      _isEditing = false;
    });
    // Re-initialize the form with the original data
    _loadAllData();
  }

  Widget _buildActionsSection({
    required KakDetail kak,
    required KakDetailProvider provider,
    required ColorScheme colorScheme,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        children: [
          if (_isEditing) // Show Save and Cancel buttons only when editing
            Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: provider.isLoading ? null : _saveKak,
                    child: provider.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(
                            'Simpan Perubahan',
                            style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                          ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: provider.isLoading ? null : _cancelEdit,
                    child: Text(
                      'Batal',
                      style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            )
          else // Show Kembali and Ajukan Kegiatan buttons when not editing
            Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text(
                          'Kembali',
                          style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
                // "Ajukan Kegiatan" button, always shown if statusId == 3
                if (kak.statusId == 3)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: () async {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => PengajuanCreatePage(kak: kak),
                            ),
                          );
                          if (result == true && mounted) {
                            provider.loadKakDetail(kak.kakId);
                          }
                        },
                        child: Text(
                          'Ajukan Kegiatan',
                          style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  Future<void> _openKakPdf(String type) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sesi aktif tidak ditemukan. Silakan login kembali.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final url = '${ApiService.baseUrl}/kak/${widget.kakId}/pdf/$type?token=$token';
    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        throw 'Tidak dapat membuka browser untuk link ini';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal memuat PDF KAK: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<KakDetailProvider>(
      builder: (context, provider, child) {
        final kak = provider.kakDetail;
        final colorScheme = Theme.of(context).colorScheme;

        if (provider.isLoading || isLoadingMaster) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (kak == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Detail KAK')),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(provider.errorMessage ?? 'KAK tidak ditemukan'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadAllData,
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
              'Detail KAK',
              style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
            ),
            actions: [
              if (!_isEditing) ...[
                IconButton(
                  icon: const Icon(Icons.picture_as_pdf_outlined),
                  tooltip: 'Preview KAK',
                  onPressed: () => _openKakPdf('preview'),
                ),
                IconButton(
                  icon: const Icon(Icons.download_outlined),
                  tooltip: 'Download KAK',
                  onPressed: () => _openKakPdf('download'),
                ),
              ],
              if (!widget.embedMode && !_isEditing)
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () {
                    setState(() {
                      _isEditing = true;
                    });
                  },
                ),
            ],
          ),
          body: Column(
            children: [
              Expanded(
                child: KakCreateEditForm(
                  key: ValueKey('${kak.kakId}_${_isEditing ? 'edit' : 'readOnly'}'),
                  initialData: kak,
                  tipeKegiatanOptions: tipeKegiatanOptions,
                  ikuOptions: ikuOptions,
                  satuanOptions: satuanOptions,
                  kategoriBelanjaOptions: kategoriBelanjaOptions,
                  readOnly: !_isEditing,
                  onSubmit: _saveKak,
                  isLoading: provider.isLoading,
                  onFormChange: _handleFormChange,
                ),
              ),
              if (!widget.embedMode)
                _buildActionsSection(
                  kak: kak,
                  provider: provider,
                  colorScheme: colorScheme,
                ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}
