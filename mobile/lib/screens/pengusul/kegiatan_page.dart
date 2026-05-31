import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';
import '../../services/api_service.dart';
import 'kak_detail_page.dart';

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
      final res = await ApiService.get('/kak');
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        List<dynamic> data = [];
        if (decoded is Map<String, dynamic> && decoded.containsKey('data')) {
          data = decoded['data'] as List<dynamic>;
        } else if (decoded is List<dynamic>) {
          data = decoded;
        }
        // filter to status_id == 3 (Disetujui)
        final approved = data
            .where((d) => (d['status_id'] as int?) == 3)
            .toList();
        setState(() {
          _items = approved;
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
          return AlertDialog(
            title: const Text('Ajukan Menjadi Kegiatan'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(kak['nama_kegiatan'] ?? '-'),
                  const SizedBox(height: 12),
                  TextField(
                    controller: penanggungCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Penanggung Jawab',
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: pelaksanaCtrl,
                    decoration: const InputDecoration(labelText: 'Pelaksana'),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: () async {
                      final res = await FilePicker.platform.pickFiles(
                        type: FileType.custom,
                        allowedExtensions: ['pdf', 'doc', 'docx'],
                        withData: true,
                      );
                      if (res != null && res.files.isNotEmpty) {
                        setState(() => pickedFile = res.files.first);
                      }
                    },
                    icon: const Icon(Icons.upload_file),
                    label: Text(
                      pickedFile == null
                          ? 'Pilih Surat Pengantar'
                          : pickedFile!.name,
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: isSubmitting ? null : () => Navigator.of(ctx).pop(),
                child: const Text('Batal'),
              ),
              ElevatedButton(
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
                            'penanggung_jawab_manual': penanggungCtrl.text
                                .trim(),
                            'pelaksana_manual': pelaksanaCtrl.text.trim(),
                          };

                          if (pickedFile != null) {
                            map['surat_pengantar'] =
                                await _toMultipartFile(pickedFile!);
                          }

                          final formData = FormData.fromMap(map);

                          final resp = await dio.post(
                            '/kegiatan',
                            data: formData,
                            options: Options(
                              headers: {'Accept': 'application/json'},
                            ),
                          );

                          if (resp.statusCode == 201 ||
                              resp.statusCode == 200) {
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
                                ? resp.data['message'] ??
                                      'Gagal mengajukan kegiatan.'
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
                                content: Text(
                                  'Gagal mengajukan kegiatan: $responseMessage',
                                ),
                                backgroundColor: Colors.redAccent,
                              ),
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  'Gagal mengajukan kegiatan: $e',
                                ),
                                backgroundColor: Colors.redAccent,
                              ),
                            );
                          }
                        } finally {
                          if (mounted) setState(() => isSubmitting = false);
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00BCD4),
                ),
                child: isSubmitting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text('Ajukan Kegiatan'),
              ),
            ],
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
      'docx' => MediaType('application', 'vnd.openxmlformats-officedocument.wordprocessingml.document'),
      'jpg' || 'jpeg' => MediaType('image', 'jpeg'),
      'png' => MediaType('image', 'png'),
      'webp' => MediaType('image', 'webp'),
      _ => MediaType('application', 'octet-stream'),
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('Manajemen Kegiatan'),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF00BCD4)),
            )
          : _items.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(
                    Icons.inbox_outlined,
                    color: Color(0xFFCBD5E1),
                    size: 60,
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Tidak ada KAK siap diajukan.',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (context, idx) {
                final kak = _items[idx] as Map<String, dynamic>;
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    title: Text(kak['nama_kegiatan'] ?? '-'),
                    subtitle: Text(kak['tipe'] ?? ''),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        OutlinedButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => KakDetailPage(kakId: kak['kak_id'] as int),
                              ),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF00BCD4)),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                          ),
                          child: const Text('Detail', style: TextStyle(color: Color(0xFF00BCD4), fontSize: 13)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: () => _openSubmitModal(kak),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF00BCD4),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                          ),
                          child: const Text(
                            'Ajukan',
                            style: TextStyle(color: Colors.white, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
