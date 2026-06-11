import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';
import '../../services/api_service.dart';

class KegiatanPage extends StatefulWidget {
  const KegiatanPage({super.key});

  @override
  State<KegiatanPage> createState() => _KegiatanPageState();
}

class _KegiatanPageState extends State<KegiatanPage> {
  bool _isLoading = true;
  List<dynamic> _items = [];

  @override
  void initState() {
    super.initState();
    _loadApprovedKaks();
  }

  Future<void> _loadApprovedKaks() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.get('/kegiatan');
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        List<dynamic> data = [];
        if (decoded is Map<String, dynamic> && decoded.containsKey('approvedKaks')) {
          data = decoded['approvedKaks'] as List<dynamic>;
        } else if (decoded is List<dynamic>) {
          data = decoded;
        }
        
        setState(() {
          _items = data;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _openSubmitModal(Map<String, dynamic> kak) async {
    final penanggungCtrl = TextEditingController();
    final pelaksanaCtrl = TextEditingController();
    PlatformFile? pickedFile;
    bool isSubmitting = false;

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) {
          return Dialog(
            backgroundColor: Colors.transparent,
            insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.5)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF33C8DA), Color(0xFF2BA9B8)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Ajukan Kegiatan',
                              style: GoogleFonts.figtree(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Konversikan KAK yang telah disetujui menjadi Kegiatan resmi',
                              style: GoogleFonts.figtree(
                                fontSize: 12,
                                color: Colors.white.withOpacity(0.9),
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      // Content
                      Flexible(
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // KAK Title display
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF33C8DA).withOpacity(0.06),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFF33C8DA).withOpacity(0.15)),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.stars_rounded, color: Color(0xFF33C8DA), size: 20),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Nama KAK',
                                            style: GoogleFonts.figtree(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: const Color(0xFF2BA9B8),
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            kak['nama_kegiatan'] ?? '-',
                                            style: GoogleFonts.figtree(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w700,
                                              color: const Color(0xFF1F2937),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 20),

                              // Penanggung Jawab Field
                              Text(
                                'Penanggung Jawab',
                                style: GoogleFonts.figtree(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF4B5563),
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextField(
                                controller: penanggungCtrl,
                                decoration: InputDecoration(
                                  hintText: 'Nama Penanggung Jawab',
                                  prefixIcon: const Icon(Icons.person_outline_rounded, size: 20),
                                  filled: true,
                                  fillColor: const Color(0xFFF8FAFC),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Pelaksana Field
                              Text(
                                'Pelaksana',
                                style: GoogleFonts.figtree(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF4B5563),
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextField(
                                controller: pelaksanaCtrl,
                                decoration: InputDecoration(
                                  hintText: 'Nama Unit Pelaksana',
                                  prefixIcon: const Icon(Icons.group_outlined, size: 20),
                                  filled: true,
                                  fillColor: const Color(0xFFF8FAFC),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),

                              // File Upload Field
                              Text(
                                'Surat Pengantar',
                                style: GoogleFonts.figtree(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF4B5563),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: () async {
                                    final res = await FilePicker.platform.pickFiles(
                                      type: FileType.custom,
                                      allowedExtensions: ['pdf', 'doc', 'docx'],
                                      withData: true,
                                    );
                                    if (res != null && res.files.isNotEmpty) {
                                      setState(() => pickedFile = res.files.first);
                                    }
                                  },
                                  borderRadius: BorderRadius.circular(12),
                                  child: Ink(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: const Color(0xFFE2E8F0)),
                                    ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        pickedFile == null
                                            ? Icons.upload_file_outlined
                                            : Icons.check_circle_outline_rounded,
                                        color: pickedFile == null
                                            ? const Color(0xFF64748B)
                                            : Colors.green,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          pickedFile == null
                                              ? 'Pilih berkas Surat Pengantar'
                                              : pickedFile!.name,
                                          style: GoogleFonts.figtree(
                                            fontSize: 14,
                                            color: pickedFile == null
                                                ? const Color(0xFF64748B)
                                                : const Color(0xFF1F2937),
                                            fontWeight: pickedFile == null
                                                ? FontWeight.normal
                                                : FontWeight.w600,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (pickedFile != null)
                                        IconButton(
                                          icon: const Icon(Icons.close, size: 18),
                                          onPressed: () {
                                            setState(() => pickedFile = null);
                                          },
                                          padding: EdgeInsets.zero,
                                          constraints: const BoxConstraints(),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                      
                      // Footer actions
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: isSubmitting ? null : () => Navigator.of(ctx).pop(),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: Text(
                                  'Batal',
                                  style: GoogleFonts.figtree(
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF475569),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              flex: 2,
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: isSubmitting
                                      ? null
                                      : const LinearGradient(
                                          colors: [Color(0xFF33C8DA), Color(0xFF2BA9B8)],
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                        ),
                                  color: isSubmitting ? Colors.grey.shade300 : null,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: isSubmitting
                                      ? []
                                      : [
                                          BoxShadow(
                                            color: const Color(0xFF33C8DA).withOpacity(0.25),
                                            blurRadius: 10,
                                            offset: const Offset(0, 4),
                                          )
                                        ],
                                ),
                                child: ElevatedButton(
                                  onPressed: isSubmitting
                                      ? null
                                      : () async {
                                          if (penanggungCtrl.text.trim().isEmpty ||
                                              pelaksanaCtrl.text.trim().isEmpty) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(
                                                content: Text(
                                                  'Isi penanggung jawab dan pelaksana.',
                                                ),
                                                backgroundColor: Colors.redAccent,
                                              ),
                                            );
                                            return;
                                          }

                                          setState(() => isSubmitting = true);
                                          try {
                                            final dio = Provider.of<Dio>(context, listen: false);
                                            final map = <String, dynamic>{
                                              'kak_id': kak['kak_id'].toString(),
                                              'penanggung_jawab_manual': penanggungCtrl.text.trim(),
                                              'pelaksana_manual': pelaksanaCtrl.text.trim(),
                                            };

                                            if (pickedFile != null) {
                                              map['surat_pengantar'] = await _toMultipartFile(pickedFile!);
                                            }

                                            final formData = FormData.fromMap(map);

                                            final resp = await dio.post(
                                              '/kegiatan',
                                              data: formData,
                                              options: Options(headers: {'Accept': 'application/json'}),
                                            );

                                            if (resp.statusCode == 201 || resp.statusCode == 200) {
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  const SnackBar(
                                                    content: Text('Kegiatan berhasil diajukan.'),
                                                    backgroundColor: Colors.green,
                                                  ),
                                                );
                                              }
                                              Navigator.of(ctx).pop();
                                              _loadApprovedKaks();
                                            } else {
                                              final msg = resp.data is Map
                                                  ? resp.data['message'] ?? 'Gagal mengajukan kegiatan.'
                                                  : 'Gagal mengajukan kegiatan.';
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(
                                                    content: Text(msg),
                                                    backgroundColor: Colors.redAccent,
                                                  ),
                                                );
                                              }
                                            }
                                          } on DioException catch (e) {
                                            final responseMessage = e.response?.data is Map
                                                ? (e.response?.data['message'] ?? e.response?.data['errors'] ?? e.message)
                                                : e.message;
                                            if (context.mounted) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text('Gagal mengajukan kegiatan: $responseMessage'),
                                                  backgroundColor: Colors.redAccent,
                                                ),
                                              );
                                            }
                                          } catch (e) {
                                            if (context.mounted) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text('Gagal mengajukan kegiatan: $e'),
                                                  backgroundColor: Colors.redAccent,
                                                ),
                                              );
                                            }
                                          } finally {
                                            if (mounted) setState(() => isSubmitting = false);
                                          }
                                        },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: isSubmitting
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : Text(
                                          'Ajukan Sekarang',
                                          style: GoogleFonts.figtree(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Future<MultipartFile> _toMultipartFile(PlatformFile file) async {
    final mimeType = lookupMimeType(file.name, headerBytes: file.bytes);
    final mediaType = _toMediaType(mimeType, file.name);

    if (file.bytes != null) {
      return MultipartFile.fromBytes(
        file.bytes!,
        filename: file.name,
        contentType: mediaType,
      );
    }
    if (file.path != null) {
      return MultipartFile.fromFile(
        file.path!,
        filename: file.name,
        contentType: mediaType,
      );
    }
    throw StateError('File tidak memiliki bytes atau path.');
  }

  MediaType _toMediaType(String? mimeType, String fileName) {
    if (mimeType != null && mimeType.contains('/')) {
      final parts = mimeType.split('/');
      if (parts.length == 2) {
        return MediaType(parts[0], parts[1]);
      }
    }

    final ext = fileName.split('.').last.toLowerCase();
    return switch (ext) {
      'pdf' => MediaType('application', 'pdf'),
      'doc' => MediaType('application', 'msword'),
      'docx' => MediaType(
        'application',
        'vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
      'jpg' || 'jpeg' => MediaType('image', 'jpeg'),
      'png' => MediaType('image', 'png'),
      'webp' => MediaType('image', 'webp'),
      _ => MediaType('application', 'octet-stream'),
    };
  }

  Widget _buildKegiatanCard(Map<String, dynamic> kak) {
    final primaryColor = const Color(0xFF33C8DA);
    final darkColor = const Color(0xFF1F2937);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Left status highlight line
              Container(
                width: 6,
                color: primaryColor,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: primaryColor.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              kak['tipe'] ?? 'Umum',
                              style: GoogleFonts.figtree(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: primaryColor,
                              ),
                            ),
                          ),
                          Text(
                            'Siap Diajukan',
                            style: GoogleFonts.figtree(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF22C55E),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Title
                      Text(
                        kak['nama_kegiatan'] ?? '-',
                        style: GoogleFonts.figtree(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: darkColor,
                          height: 1.35,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Color(0xFFF1F5F9), height: 1),
                      const SizedBox(height: 16),
                      // Actions row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFF94A3B8)),
                              const SizedBox(width: 4),
                              Text(
                                'ID KAK: #${kak['kak_id']}',
                                style: GoogleFonts.figtree(
                                  fontSize: 11,
                                  color: const Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                          // Beautiful Action Button
                          Container(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF33C8DA), Color(0xFF2BA9B8)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                  color: primaryColor.withOpacity(0.15),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                )
                              ],
                            ),
                            child: ElevatedButton(
                              onPressed: () => _openSubmitModal(kak),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: Text(
                                'Ajukan',
                                style: GoogleFonts.figtree(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.inventory_2_outlined,
                color: Color(0xFF94A3B8),
                size: 48,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Belum Ada KAK Siap Diajukan',
              style: GoogleFonts.figtree(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1F2937),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Silakan ajukan proposal KAK baru terlebih dahulu dan tunggu persetujuan dari Verifikator.',
              style: GoogleFonts.figtree(
                fontSize: 13,
                color: const Color(0xFF64748B),
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF33C8DA);
    final darkColor = const Color(0xFF1F2937);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: false,
        title: Text(
          'Manajemen Kegiatan',
          style: GoogleFonts.figtree(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadApprovedKaks,
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Quick Summary Stats Card
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: primaryColor.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.assignment_turned_in_rounded, color: primaryColor, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'KAK Siap Diajukan',
                          style: GoogleFonts.figtree(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _isLoading ? '...' : '${_items.length} Usulan KAK',
                          style: GoogleFonts.figtree(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: darkColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Main List Content
          Expanded(
            child: _isLoading
                ? Center(
                    child: CircularProgressIndicator(color: primaryColor),
                  )
                : _items.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: _loadApprovedKaks,
                        color: primaryColor,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                          itemCount: _items.length,
                          itemBuilder: (context, idx) {
                            final kak = _items[idx] as Map<String, dynamic>;
                            return _buildKegiatanCard(kak);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
