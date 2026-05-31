import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

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
        setState(() {
          _guides = jsonDecode(res.body);
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
            const SnackBar(content: Text('Panduan berhasil dihapus.'), backgroundColor: Colors.green),
          );
          _loadGuides();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gagal menghapus panduan.'), backgroundColor: Colors.redAccent),
          );
          setState(() {
            _isLoading = false;
          });
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Terjadi kesalahan koneksi.'), backgroundColor: Colors.redAccent),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showAddGuideDialog() {
    final formKey = GlobalKey<FormState>();
    final titleCtrl = TextEditingController();
    final pathCtrl = TextEditingController();
    String selectedType = 'document'; // Default document

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
                  const Text(
                    'Tambah Panduan Baru',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      fontFamily: 'Figtree',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),

                  // Judul Panduan
                  TextFormField(
                    controller: titleCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Judul Panduan',
                      prefixIcon: Icon(Icons.description_outlined),
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Judul panduan wajib diisi' : null,
                  ),
                  const SizedBox(height: 16),

                  // Tipe Media
                  DropdownButtonFormField<String>(
                    initialValue: selectedType,
                    decoration: const InputDecoration(
                      labelText: 'Tipe Media',
                      prefixIcon: Icon(Icons.perm_media_outlined),
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'document', child: Text('Dokumen PDF')),
                      DropdownMenuItem(value: 'video', child: Text('Video Tutorial')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() {
                          selectedType = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 16),

                  // Path Media / URL
                  TextFormField(
                    controller: pathCtrl,
                    decoration: InputDecoration(
                      labelText: selectedType == 'video' ? 'URL Video (YouTube / Drive)' : 'Path File Dokumen',
                      prefixIcon: const Icon(Icons.link_outlined),
                      border: const OutlineInputBorder(),
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Alamat link wajib diisi' : null,
                  ),
                  const SizedBox(height: 24),

                  // Submit button
                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (formKey.currentState!.validate()) {
                          Navigator.of(ctx).pop();
                          
                          setState(() {
                            _isLoading = true;
                          });

                          try {
                            final res = await ApiService.post('/admin/panduan', {
                              'title': titleCtrl.text.trim(),
                              'type': selectedType,
                              'path': pathCtrl.text.trim(),
                            });

                            if (res.statusCode == 201) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Panduan berhasil disimpan.'), backgroundColor: Colors.green),
                              );
                              _loadGuides();
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Gagal menambahkan panduan.'), backgroundColor: Colors.redAccent),
                              );
                              setState(() {
                                _isLoading = false;
                              });
                            }
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Terjadi kesalahan koneksi.'), backgroundColor: Colors.redAccent),
                            );
                            setState(() {
                              _isLoading = false;
                            });
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF33C8DA),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'SIGAP PNJ',
              style: TextStyle(
                color: Color(0xFF0F172A),
                fontWeight: FontWeight.w900,
                fontSize: 20,
                fontFamily: 'Figtree',
              ),
            ),
            Text(
              'Pusat Bantuan & Panduan',
              style: TextStyle(
                color: Color(0xFF64748B),
                fontSize: 12,
                fontFamily: 'Figtree',
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF33C8DA)),
            onPressed: _loadGuides,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF33C8DA)))
          : Column(
              children: [
                // Top Banner "Butuh Bantuan"
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
                                'Pusat Panduan Ril',
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
                            onPressed: _showAddGuideDialog,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: const Color(0xFF33C8DA),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('Tambah', style: TextStyle(fontWeight: FontWeight.bold)),
                          )
                      ],
                    ),
                  ),
                ),

                // Search field
                Padding(
                  padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 12.0),
                  child: TextFormField(
                    controller: _searchController,
                    onChanged: _filterGuides,
                    decoration: InputDecoration(
                      hintText: 'Cari judul panduan...',
                      hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                      filled: true,
                      fillColor: Colors.white,
                      prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5),
                      ),
                    ),
                  ),
                ),

                // Guides List
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
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                children: [
                                  // Icon inside circle
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: isVideo ? const Color(0xFFFFFBEB) : const Color(0xFFE0F7FA),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Icon(
                                      isVideo ? Icons.play_circle_outline : Icons.description_outlined,
                                      color: isVideo ? const Color(0xFFF59E0B) : const Color(0xFF33C8DA),
                                      size: 26,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  // Text Description
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
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
                                          isVideo ? 'Video Tutorial • Ril dari database' : 'Dokumen PDF • Ril dari database',
                                          style: const TextStyle(
                                            color: Color(0xFF64748B),
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Action icons
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.cloud_download_outlined, color: Color(0xFF33C8DA)),
                                        onPressed: () {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Mengunduh ${g['title']}...'),
                                              backgroundColor: const Color(0xFF33C8DA),
                                            ),
                                          );
                                        },
                                      ),
                                      if (isAdmin)
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                          onPressed: () => _deleteGuide(g['id'] as int, g['title'] as String),
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
    );
  }
}
