import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart' as dio;
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/master_data_service.dart';
import '../widgets/app_shell.dart';
import '../widgets/sigap_bottom_navigation_bar.dart';
import 'pdf_viewer_page.dart';

class HelpGuidePage extends StatefulWidget {
  const HelpGuidePage({super.key});

  @override
  State<HelpGuidePage> createState() => _HelpGuidePageState();
}

class _HelpGuidePageState extends State<HelpGuidePage> {
  bool _isLoading = true;
  List<dynamic> _guides = [];
  List<dynamic> _filteredGuides = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadGuides();
  }

  Future<void> _loadGuides() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await ApiService.get('/admin/panduan');
      if (res.statusCode == 200) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final userRoleId = authProvider.user?.roleId;
        final isAdmin = userRoleId == 1;

        final allGuides = jsonDecode(res.body) as List<dynamic>;
        
        setState(() {
          _guides = isAdmin 
              ? allGuides 
              : allGuides.where((g) => g['target_role_id'] == userRoleId).toList();
          _filteredGuides = List.from(_guides);
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _filterGuides(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredGuides = List.from(_guides);
      } else {
        _filteredGuides = _guides.where((g) {
          final title = (g['title'] ?? '').toString().toLowerCase();
          return title.contains(query.toLowerCase());
        }).toList();
      }
    });
  }

  Future<void> _deleteGuide(int guideId, String title) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Panduan?'),
        content: Text('Apakah Anda yakin ingin menghapus panduan "$title"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Batal', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() {
        _isLoading = true;
      });

      try {
        final res = await ApiService.delete('/admin/panduan/$guideId');
        if (res.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Panduan berhasil dihapus.'),
              backgroundColor: Colors.green,
            ),
          );
          _loadGuides();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Gagal menghapus panduan.'),
              backgroundColor: Colors.redAccent,
            ),
          );
          setState(() {
            _isLoading = false;
          });
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Terjadi kesalahan koneksi.'),
            backgroundColor: Colors.redAccent,
          ),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showAddGuideDialog(List<dynamic> roles) {
    final formKey = GlobalKey<FormState>();
    final titleCtrl = TextEditingController();
    final pathCtrl = TextEditingController();
    String selectedType = 'document';
    int? selectedRoleId;
    File? selectedFile;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Tambah Panduan Baru', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), fontFamily: 'Figtree'), textAlign: TextAlign.center),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: titleCtrl,
                    decoration: const InputDecoration(labelText: 'Judul Panduan', prefixIcon: Icon(Icons.description_outlined), border: OutlineInputBorder()),
                    validator: (v) => v == null || v.isEmpty ? 'Judul panduan wajib diisi' : null,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: selectedType,
                    decoration: const InputDecoration(labelText: 'Tipe Media', prefixIcon: Icon(Icons.perm_media_outlined), border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'document', child: Text('Dokumen PDF')),
                      DropdownMenuItem(value: 'video', child: Text('Video Tutorial')),
                    ],
                    onChanged: (val) {
                      if (val != null) setDialogState(() => selectedType = val);
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  if (selectedType == 'video')
                    TextFormField(
                      controller: pathCtrl,
                      decoration: const InputDecoration(labelText: 'URL Video (YouTube / Drive)', prefixIcon: Icon(Icons.link_outlined), border: OutlineInputBorder()),
                      validator: (v) => v == null || v.isEmpty ? 'Alamat link wajib diisi' : null,
                    )
                  else
                    Column(
                      children: [
                        ElevatedButton.icon(
                          onPressed: () async {
                            final result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf']);
                            if (result != null && result.files.single.path != null) {
                              debugPrint('DEBUG: File selected: ${result.files.single.path}');
                              setDialogState(() {
                                selectedFile = File(result.files.single.path!);
                                pathCtrl.text = result.files.single.name;
                              });
                            } else {
                              debugPrint('DEBUG: No file selected');
                            }
                          },
                          icon: const Icon(Icons.upload_file),
                          label: const Text('Pilih File PDF'),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.grey[200], foregroundColor: Colors.black),
                        ),
                        if (selectedFile != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            'File Terpilih: ${pathCtrl.text}',
                            style: const TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ],
                    ),
                  
                  const SizedBox(height: 16),
                  DropdownButtonFormField<int>(
                    value: selectedRoleId,
                    decoration: const InputDecoration(labelText: 'Target Role', prefixIcon: Icon(Icons.person_outline), border: OutlineInputBorder()),
                    items: roles.map((role) {
                      return DropdownMenuItem<int>(
                        value: role['role_id'] as int,
                        child: Text(role['nama_role'] as String),
                      );
                    }).toList(),
                    onChanged: (val) => setDialogState(() => selectedRoleId = val),
                    validator: (v) => v == null ? 'Role wajib dipilih' : null,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (formKey.currentState!.validate()) {
                          if (selectedType == 'document' && selectedFile == null) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pilih file dokumen terlebih dahulu')));
                            return;
                          }
                          Navigator.of(ctx).pop();
                          setState(() => _isLoading = true);
                          try {
                            // Using Dio for Multipart Upload
                            final dioInstance = Provider.of<dio.Dio>(context, listen: false);
                            final formData = dio.FormData.fromMap({
                              'judul_panduan': titleCtrl.text.trim(),
                              'tipe_media': selectedType,
                              'target_role_id': selectedRoleId,
                              'file': selectedType == 'video' 
                                  ? pathCtrl.text.trim() 
                                  : await dio.MultipartFile.fromFile(selectedFile!.path, filename: pathCtrl.text),
                            });
                            
                            final res = await dioInstance.post('/admin/panduan', data: formData);
                            
                            if (res.statusCode == 201) {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Panduan berhasil disimpan.'), backgroundColor: Colors.green));
                              _loadGuides();
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gagal menambahkan panduan.'), backgroundColor: Colors.redAccent));
                              setState(() => _isLoading = false);
                            }
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Terjadi kesalahan koneksi.'), backgroundColor: Colors.redAccent));
                            setState(() => _isLoading = false);
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF33C8DA), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      child: const Text('Simpan Panduan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isAdmin = authProvider.user?.roleId == 1; // Super Admin role check

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: false,
        title: Text(
          'Pusat Panduan',
          style: GoogleFonts.figtree(
            fontSize: 20,
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.w800,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadGuides,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF33C8DA)),
            )
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Container(
                    padding: const EdgeInsets.all(20.0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF33C8DA), Color(0xFF0097A7)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.cyan.withOpacity(0.2),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'Pusat Panduan',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  fontFamily: 'Figtree',
                                ),
                              ),
                              SizedBox(height: 6),
                              Text(
                                'Cari dan unduh manual penggunaan sistem langsung dari database.',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                  fontFamily: 'Figtree',
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isAdmin)
                          ElevatedButton(
                            onPressed: () async {
                              setState(() => _isLoading = true);
                              try {
                                final roles = await Provider.of<MasterDataService>(context, listen: false).getRoles();
                                if (mounted) {
                                  setState(() => _isLoading = false);
                                  _showAddGuideDialog(roles);
                                }
                              } catch (e) {
                                if (mounted) {
                                  setState(() => _isLoading = false);
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal memuat role: $e')));
                                }
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: const Color(0xFF33C8DA),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Text(
                              'Tambah',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(
                    left: 16.0,
                    right: 16.0,
                    bottom: 12.0,
                  ),
                  child: TextFormField(
                    controller: _searchController,
                    onChanged: _filterGuides,
                    decoration: InputDecoration(
                      hintText: 'Cari judul panduan...',
                      hintStyle: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 14,
                      ),
                      filled: true,
                      fillColor: Colors.white,
                      prefixIcon: const Icon(
                        Icons.search,
                        color: Color(0xFF64748B),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: Color(0xFFE2E8F0),
                          width: 1,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: Color(0xFF33C8DA),
                          width: 1.5,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: _filteredGuides.isEmpty
                      ? const Center(
                          child: Text(
                            'Tidak ada dokumen panduan dalam database.',
                            style: TextStyle(color: Color(0xFF64748B)),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          itemCount: _filteredGuides.length,
                          itemBuilder: (context, idx) {
                            final g = _filteredGuides[idx];
                            final isVideo = g['type'] == 'video';

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16.0),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: isVideo
                                          ? const Color(0xFFFFFBEB)
                                          : const Color(0xFFE0F7FA),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Icon(
                                      isVideo
                                          ? Icons.play_circle_outline
                                          : Icons.description_outlined,
                                      color: isVideo
                                          ? const Color(0xFFF59E0B)
                                          : const Color(0xFF33C8DA),
                                      size: 26,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          g['title'] ?? 'Judul Panduan',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF1E293B),
                                            fontSize: 15,
                                            fontFamily: 'Figtree',
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          isVideo
                                              ? 'Video Tutorial'
                                              : 'Dokumen PDF',
                                          style: const TextStyle(
                                            color: Color(0xFF64748B),
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: Icon(
                                          isVideo
                                              ? Icons.open_in_new
                                              : Icons.remove_red_eye_outlined,
                                          color: const Color(0xFF33C8DA),
                                        ),
                                        onPressed: () async {
                                          final url = g['path'] as String;
                                          if (isVideo) {
                                            final uri = Uri.parse(url);
                                            if (await canLaunchUrl(uri)) {
                                              await launchUrl(uri, mode: LaunchMode.externalApplication);
                                            } else {
                                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tidak dapat membuka link video')));
                                            }
                                          } else {
                                            Navigator.of(context).push(
                                              MaterialPageRoute(
                                                builder: (_) => PdfViewerPage(
                                                  url: url.startsWith('http') 
                                                      ? url 
                                                      : 'https://sigap-laravel.wattaway.id/storage/$url',
                                                  title: g['title'],
                                                ),
                                              ),
                                            );
                                          }
                                        },
                                      ),
                                      if (isAdmin)
                                        IconButton(
                                          icon: const Icon(
                                            Icons.delete_outline,
                                            color: Colors.redAccent,
                                          ),
                                          onPressed: () => _deleteGuide(
                                            g['id'] as int,
                                            g['title'] as String,
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
      bottomNavigationBar: Navigator.of(context).canPop()
          ? SigapBottomNavigationBar(
              selectedIndex: AppShellState.activeInstance?.selectedIndex ?? 0,
              roleId: authProvider.user?.roleId ?? 3,
              onDestinationSelected: (index) {
                if (AppShellState.activeInstance != null) {
                  AppShellState.activeInstance!.setSelectedIndex(index);
                }
                Navigator.of(context).pop();
              },
            )
          : null,
    );
  }
}
