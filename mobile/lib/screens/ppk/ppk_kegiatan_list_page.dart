import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../kegiatan_detail_page.dart';

class PpkKegiatanListPage extends StatefulWidget {
  const PpkKegiatanListPage({super.key});

  @override
  State<PpkKegiatanListPage> createState() => _PpkKegiatanListPageState();
}

class _PpkKegiatanListPageState extends State<PpkKegiatanListPage> {
  bool _isLoading = true;
  bool _isError = false;
  String _errorMessage = '';
  List<dynamic> _kegiatans = [];
  List<dynamic> _filteredKegiatans = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchKegiatans();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _openKakPdf(dynamic kakId, String type) async {
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

    final url = '${ApiService.baseUrl}/kak/$kakId/pdf/$type?token=$token';
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

  Future<void> _fetchKegiatans() async {
    setState(() {
      _isLoading = true;
      _isError = false;
    });

    try {
      final dio = context.read<Dio>();
      final res = await dio.get('/kegiatan');

      if (res.statusCode == 200) {
        final data = res.data;
        // From verified API contract, approver pending list is in "pendingKegiatan"
        final List<dynamic> list = data['pendingKegiatan'] ?? [];
        setState(() {
          _kegiatans = list;
          _filteredKegiatans = list;
          _isLoading = false;
        });
        _filterList(_searchController.text);
      } else {
        throw Exception('Server returned status code ${res.statusCode}');
      }
    } catch (e) {
      setState(() {
        _isError = true;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _filterList(String query) {
    if (query.isEmpty) {
      setState(() {
        _filteredKegiatans = _kegiatans;
      });
      return;
    }

    final lowercaseQuery = query.toLowerCase();
    setState(() {
      _filteredKegiatans = _kegiatans.where((item) {
        final kak = item['kak'] ?? {};
        final namaKegiatan = (kak['nama_kegiatan'] ?? '').toString().toLowerCase();
        final pengusul = (kak['pengusul']?['nama_lengkap'] ?? '').toString().toLowerCase();
        return namaKegiatan.contains(lowercaseQuery) || pengusul.contains(lowercaseQuery);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(
          'Kegiatan Menunggu Approval',
          style: GoogleFonts.figtree(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
        automaticallyImplyLeading: false,
        centerTitle: false,
      ),
      body: Column(
        children: [
          // Search Box
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            child: TextField(
              controller: _searchController,
              onChanged: _filterList,
              decoration: InputDecoration(
                hintText: 'Cari nama kegiatan atau pengusul...',
                prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8)),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Color(0xFF94A3B8)),
                        onPressed: () {
                          _searchController.clear();
                          _filterList('');
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                fillColor: const Color(0xFFF1F5F9),
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                hintStyle: const TextStyle(fontSize: 14, color: Color(0xFF94A3B8)),
              ),
            ),
          ),

          // Content
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final isWadir = context.read<AuthProvider>().user?.roleId == 5;

    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
        ),
      );
    }

    if (_isError) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Color(0xFFE57373)),
              const SizedBox(height: 16),
              const Text(
                'Gagal memuat daftar kegiatan',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                  fontFamily: 'Figtree',
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _errorMessage,
                style: const TextStyle(color: Color(0xFF64748B)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _fetchKegiatans,
                icon: const Icon(Icons.refresh),
                label: const Text('Coba Lagi'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF33C8DA),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_filteredKegiatans.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.assignment_turned_in_outlined,
                size: 64,
                color: Color(0xFFE2E8F0),
              ),
              const SizedBox(height: 16),
              const Text(
                'Tidak ada kegiatan pending',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF475569),
                  fontFamily: 'Figtree',
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _searchController.text.isNotEmpty
                    ? 'Tidak ada hasil pencarian untuk "${_searchController.text}"'
                    : 'Semua kegiatan telah diproses.',
                style: const TextStyle(color: Color(0xFF94A3B8)),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchKegiatans,
      color: const Color(0xFF33C8DA),
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        itemCount: _filteredKegiatans.length,
        itemBuilder: (context, index) {
          final item = _filteredKegiatans[index];
          final kak = item['kak'] ?? {};
          final namaKegiatan = kak['nama_kegiatan'] ?? 'Tanpa Nama Kegiatan';
          final pengusul = kak['pengusul']?['nama_lengkap'] ?? 'Tanpa Pengusul';
          final tipe = kak['tipe_kegiatan']?['nama_tipe'] ?? 'Akademik';
          final String dateStr = item['created_at'] ?? kak['tanggal_mulai'] ?? '-';
          final int kegiatanId = item['kegiatan_id'] ?? 0;
          final List<dynamic> approvals = item['approvals'] as List? ?? [];
          final ppkApproval = approvals.firstWhere(
            (a) => a['approval_level'] == 'PPK',
            orElse: () => null,
          );
          final String? ppkCatatan = ppkApproval != null ? ppkApproval['catatan']?.toString() : null;

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            elevation: 0,
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => _navigateToDetail(kegiatanId),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                namaKegiatan,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F172A),
                                  fontFamily: 'Figtree',
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Pengusul: $pengusul',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF64748B),
                                  fontFamily: 'Figtree',
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF7ED),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFFFEDD5)),
                              ),
                              child: const Text(
                                'PENDING',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFFC2410C),
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
                                  onPressed: () {
                                    final kakId = kak['kak_id'];
                                    if (kakId != null) {
                                      _openKakPdf(kakId, 'preview');
                                    }
                                  },
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
                                  onPressed: () {
                                    final kakId = kak['kak_id'];
                                    if (kakId != null) {
                                      _openKakPdf(kakId, 'download');
                                    }
                                  },
                                  tooltip: 'Download KAK',
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    if (isWadir && ppkCatatan != null && ppkCatatan.trim().isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFDCFCE7)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: const [
                                Icon(Icons.feedback_outlined, size: 14, color: Color(0xFF16A34A)),
                                SizedBox(width: 6),
                                Text(
                                  'Catatan PPK',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF166534),
                                    fontFamily: 'Figtree',
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              ppkCatatan,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF14532D),
                                fontStyle: FontStyle.italic,
                                fontFamily: 'Figtree',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Wrap(
                            spacing: 12,
                            runSpacing: 8,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  tipe.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF475569),
                                  ),
                                ),
                              ),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.calendar_today_outlined, size: 12, color: Color(0xFF94A3B8)),
                                  const SizedBox(width: 4),
                                  Text(
                                    dateStr,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: Color(0xFF94A3B8),
                                      fontFamily: 'Figtree',
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: () => _navigateToDetail(kegiatanId),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF33C8DA),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          ),
                          child: const Text(
                            'Lihat Detail',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _navigateToDetail(int kegiatanId) {
    if (kegiatanId > 0) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => KegiatanDetailPage(kegiatanId: kegiatanId),
        ),
      ).then((value) {
        if (value == true) {
          _fetchKegiatans();
        }
      });
    }
  }
}
