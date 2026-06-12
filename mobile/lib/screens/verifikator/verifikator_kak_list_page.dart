import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;

import '../../models/dashboard_model.dart';
import '../../services/api_service.dart';
import '../../providers/auth_provider.dart';
import 'verifikator_approval_page.dart';
import '../../utils/download_helper.dart';
import '../../widgets/pdf_preview_dialog.dart';

class VerifikatorKakListPage extends StatefulWidget {
  const VerifikatorKakListPage({super.key});

  @override
  State<VerifikatorKakListPage> createState() => _VerifikatorKakListPageState();
}

class _VerifikatorKakListPageState extends State<VerifikatorKakListPage> {
  bool _isLoading = true;
  List<DashboardItem> _kaks = [];
  List<DashboardItem> _filteredKaks = [];
  String _statusFilter = 'Semua'; // 'Semua' or 'Menunggu'
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadKaks();
  }

  Future<void> _loadKaks() async {
    setState(() => _isLoading = true);
    try {
      final dio = context.read<Dio>();
      final response = await dio.get(
        '/kak',
        queryParameters: _searchController.text.trim().isNotEmpty
            ? {'search': _searchController.text.trim()}
            : null,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> itemsData = [];

        // Handle both standard list response and Laravel pagination response
        if (data is Map<String, dynamic> && data.containsKey('data')) {
          itemsData = data['data'] as List<dynamic>;
        } else if (data is List<dynamic>) {
          itemsData = data;
        }

        final loaded = itemsData.map((item) {
          return DashboardItem(
            id: item['kak_id']?.toString() ?? '',
            nama: item['nama_kegiatan'] ?? '',
            pengusulNama: item['pengusul_nama'] ?? item['pengusul']?['name'],
            tipe: item['tipe'] ?? item['tipe_kegiatan']?['nama_tipe'],
            status: item['status_nama'] ?? 'Review',
            tanggalMulai: item['tanggal_mulai'],
            tanggalSelesai: item['tanggal_selesai'],
            createdAt: item['updated_at'],
          );
        }).toList();

        setState(() {
          _kaks = loaded;
          _applyFilters();
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load KAK list');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal memuat daftar KAK: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _applyFilters() {
    List<DashboardItem> result = List.from(_kaks);

    // Explicitly exclude Disetujui (Approved) and Revisi from this screen
    // regardless of backend role returns (e.g., if testing as Admin)
    result = result.where((item) {
      final status = item.status?.toLowerCase() ?? '';
      return !status.contains('disetujui') && 
             !status.contains('approved') && 
             !status.contains('revisi');
    }).toList();

    // Locally filter by status if 'Menunggu' is selected
    if (_statusFilter == 'Menunggu') {
      result = result
          .where(
            (item) =>
                item.status?.toLowerCase().contains('review') == true ||
                item.status?.toLowerCase().contains('menunggu') == true,
          )
          .toList();
    }

    setState(() {
      _filteredKaks = result;
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _openKakPdf(String kakId, String type, {String title = 'Dokumen KAK'}) async {
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

    final previewUrl = '${ApiService.baseUrl}/kak/$kakId/pdf/preview?token=$token';
    final downloadUrl = '${ApiService.baseUrl}/kak/$kakId/pdf/download?token=$token';

    if (type == 'preview') {
      await showPdfPreviewDialog(
        context,
        previewUrl: previewUrl,
        downloadUrl: downloadUrl,
        title: title,
        kakId: kakId,
      );
    } else {
      // Direct Download inside the application
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
          ),
        ),
      );

      try {
        final uri = Uri.parse(downloadUrl);
        final response = await http.get(uri);
        if (mounted) {
          if (Navigator.of(context).canPop()) {
            Navigator.pop(context); // Close loading dialog
          }
        }

        if (response.statusCode == 200) {
          final bytes = response.bodyBytes;
          if (mounted) {
            await downloadFile(
              bytes: bytes,
              fileName: 'KAK_$kakId.pdf',
              fallbackUrl: downloadUrl,
              context: context,
            );
          }

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('File KAK berhasil diunduh dan disimpan.'),
                backgroundColor: Color(0xFF2E7D32),
              ),
            );
          }
        } else {
          throw Exception('Server error: ${response.statusCode}');
        }
      } catch (e) {
        if (mounted) {
          if (Navigator.of(context).canPop()) {
            Navigator.pop(context); // Close loading dialog if still open
          }
        }
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Gagal mengunduh file KAK: $e'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        centerTitle: false,
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Daftar Verifikasi KAK',
          style: GoogleFonts.figtree(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(
              left: 16,
              right: 16,
              bottom: 16,
              top: 8,
            ),
            child: Column(
              children: [
                // Search bar
                TextField(
                  controller: _searchController,
                  onChanged: (val) => _loadKaks(),
                  decoration: InputDecoration(
                    hintText: 'Cari nama kegiatan...',
                    hintStyle: GoogleFonts.figtree(
                      color: Colors.grey.shade400,
                      fontSize: 14,
                    ),
                    prefixIcon: Icon(Icons.search, color: colorScheme.primary),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _loadKaks();
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade200),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: colorScheme.primary,
                        width: 1.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Status Filter Chips
                Row(
                  children: [
                    ChoiceChip(
                      label: Text(
                        'Semua',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: _statusFilter == 'Semua'
                              ? Colors.white
                              : Colors.black87,
                        ),
                      ),
                      selected: _statusFilter == 'Semua',
                      selectedColor: colorScheme.primary,
                      backgroundColor: Colors.grey.shade100,
                      onSelected: (val) {
                        if (val) {
                          setState(() => _statusFilter = 'Semua');
                          _applyFilters();
                        }
                      },
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      label: Text(
                        'Menunggu Verifikasi',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: _statusFilter == 'Menunggu'
                              ? Colors.white
                              : Colors.black87,
                        ),
                      ),
                      selected: _statusFilter == 'Menunggu',
                      selectedColor: colorScheme.primary,
                      backgroundColor: Colors.grey.shade100,
                      onSelected: (val) {
                        if (val) {
                          setState(() => _statusFilter = 'Menunggu');
                          _applyFilters();
                        }
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),

          // KAK List
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadKaks,
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _filteredKaks.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(
                          height: MediaQuery.of(context).size.height * 0.2,
                        ),
                        Center(
                          child: Column(
                            children: [
                              Icon(
                                Icons.inbox_outlined,
                                size: 64,
                                color: Colors.grey.shade300,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Tidak ada KAK yang ditemukan',
                                style: GoogleFonts.figtree(
                                  color: Colors.grey.shade500,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filteredKaks.length,
                      itemBuilder: (context, index) {
                        final item = _filteredKaks[index];
                        return _buildListCard(context, item);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListCard(BuildContext context, DashboardItem item) {

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
      borderOnForeground: false,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  VerifikatorApprovalPage(kakId: int.tryParse(item.id) ?? 0),
            ),
          ).then((result) {
            if (result == true) {
              _loadKaks();
            }
          });
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      item.nama,
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: Colors.black87,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: (item.status?.toUpperCase() == 'DISETUJUI' || item.status?.toUpperCase() == 'APPROVED')
                              ? const Color(0xFFECFDF5)
                              : (item.status?.toUpperCase() == 'DITOLAK' || item.status?.toUpperCase() == 'REJECTED')
                                  ? const Color(0xFFFEF2F2)
                                  : (item.status?.toUpperCase() == 'REVIEW' || item.status?.toUpperCase() == 'MENUNGGU VERIFIKASI')
                                      ? const Color(0xFFFFFBEB)
                                      : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          item.status ?? 'Review',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                            color: (item.status?.toUpperCase() == 'DISETUJUI' || item.status?.toUpperCase() == 'APPROVED')
                                ? const Color(0xFF10B981)
                                : (item.status?.toUpperCase() == 'DITOLAK' || item.status?.toUpperCase() == 'REJECTED')
                                    ? const Color(0xFFEF4444)
                                    : (item.status?.toUpperCase() == 'REVIEW' || item.status?.toUpperCase() == 'MENUNGGU VERIFIKASI')
                                        ? const Color(0xFFF59E0B)
                                        : const Color(0xFF64748B),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            constraints: const BoxConstraints(),
                            padding: EdgeInsets.zero,
                            icon: const Icon(
                              Icons.picture_as_pdf_outlined,
                              color: Color(0xFF64748B),
                              size: 20,
                            ),
                            onPressed: () => _openKakPdf(item.id, 'preview', title: item.nama),
                            tooltip: 'Preview KAK',
                          ),
                          const SizedBox(width: 12),
                          IconButton(
                            constraints: const BoxConstraints(),
                            padding: EdgeInsets.zero,
                            icon: const Icon(
                              Icons.download_outlined,
                              color: Color(0xFF64748B),
                              size: 20,
                        ),
                            onPressed: () => _openKakPdf(item.id, 'download', title: item.nama),
                            tooltip: 'Download KAK',
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (item.pengusulNama != null) ...[
                Text(
                  'Dari: ${item.pengusulNama}',
                  style: GoogleFonts.figtree(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 4),
              ],

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (item.tipe != null)
                    Expanded(
                      child: Text(
                        item.tipe!,
                        style: GoogleFonts.figtree(
                          fontSize: 11,
                          color: Colors.grey.shade500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  if (item.createdAt != null)
                    Text(
                      item.createdAt!,
                      style: GoogleFonts.figtree(
                        fontSize: 11,
                        color: Colors.grey.shade500,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
