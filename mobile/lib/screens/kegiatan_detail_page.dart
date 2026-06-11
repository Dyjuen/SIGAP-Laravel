import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/services.dart';

class KegiatanDetailPage extends StatefulWidget {
  final int kegiatanId;
  const KegiatanDetailPage({super.key, required this.kegiatanId});

  @override
  State<KegiatanDetailPage> createState() => _KegiatanDetailPageState();
}

class _KegiatanDetailPageState extends State<KegiatanDetailPage> {
  bool _isLoading = true;
  bool _isError = false;
  String _errorMessage = '';
  Map<String, dynamic> _kegiatan = {};
  bool _isSubmitting = false;
  final TextEditingController _catatanController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  @override
  void dispose() {
    _catatanController.dispose();
    super.dispose();
  }

  Future<void> _fetchDetail() async {
    setState(() {
      _isLoading = true;
      _isError = false;
    });

    try {
      final dio = context.read<Dio>();
      final res = await dio.get('/kegiatan/${widget.kegiatanId}');

      if (res.statusCode == 200) {
        setState(() {
          _kegiatan = res.data['kegiatan'] ?? res.data;
          _isLoading = false;
        });
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

  String _formatCurrency(dynamic amount) {
    if (amount == null) return 'Rp 0';
    final number = double.tryParse(amount.toString()) ?? 0.0;
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(number);
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '-';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('d MMMM yyyy', 'id_ID').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  Future<void> _launchUrl(String? urlString) async {
    if (urlString == null || urlString.isEmpty) return;

    showDialog(
      context: context,
      builder: (context) {
        final colorScheme = Theme.of(context).colorScheme;
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF33C8DA).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.picture_as_pdf_rounded,
                        color: Color(0xFF33C8DA),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        'Lampiran KAK',
                        style: GoogleFonts.figtree(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: colorScheme.onSurface,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  'Salin tautan di bawah ini untuk mengunduh atau membuka dokumen surat pengantar di peramban (browser) Anda:',
                  style: GoogleFonts.figtree(
                    fontSize: 13,
                    height: 1.5,
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: colorScheme.outline.withOpacity(0.2),
                    ),
                  ),
                  child: Text(
                    urlString,
                    style: GoogleFonts.figtree(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF0E7490),
                    ),
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        'Batal',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.bold,
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: urlString));
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Tautan berhasil disalin ke papan klip!',
                            ),
                            backgroundColor: Color(0xFF2E7D32),
                          ),
                        );
                      },
                      icon: const Icon(Icons.copy_rounded, size: 16),
                      label: Text(
                        'Salin Tautan',
                        style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF33C8DA),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _submitApprove() async {
    setState(() {
      _isSubmitting = true;
    });

    try {
      final dio = context.read<Dio>();
      final res = await dio.post(
        '/kegiatan/${widget.kegiatanId}/approve',
        data: {'catatan': _catatanController.text.trim()},
      );

      if (res.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Kegiatan berhasil disetujui.'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.of(context).pop(true); // Close bottom sheet
          Navigator.of(
            context,
          ).pop(true); // Close detail page, notify list to refresh
        }
      } else {
        throw Exception('Server returned status code ${res.statusCode}');
      }
    } catch (e) {
      setState(() {
        _isSubmitting = false;
      });
      if (mounted) {
        Navigator.of(context).pop(); // Close bottom sheet
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menyetujui kegiatan: ${e.toString()}'),
            backgroundColor: const Color(0xFFE57373),
          ),
        );
      }
    }
  }

  void _showApproveBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 48,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Konfirmasi Persetujuan',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A),
                    fontFamily: 'Figtree',
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Anda akan menyetujui pelaksanaan kegiatan ini.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF64748B),
                    fontFamily: 'Figtree',
                  ),
                ),
                const SizedBox(height: 20),
                () {
                  final List<dynamic> approvals =
                      _kegiatan['approvals'] as List? ?? [];
                  final ppkApproval = approvals.firstWhere(
                    (a) => a['approval_level'] == 'PPK',
                    orElse: () => null,
                  );
                  final ppkCatatan = ppkApproval != null
                      ? ppkApproval['catatan']
                      : null;
                  final authProvider = Provider.of<AuthProvider>(
                    context,
                    listen: false,
                  );
                  final isWadir = authProvider.user?.roleId == 5;

                  if (isWadir &&
                      ppkCatatan != null &&
                      ppkCatatan.toString().trim().isNotEmpty) {
                    return Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFDCFCE7)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.feedback_outlined,
                                color: Colors.green,
                                size: 16,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Catatan PPK',
                                style: GoogleFonts.figtree(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF2E7D32),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '"$ppkCatatan"',
                            style: GoogleFonts.figtree(
                              fontSize: 13,
                              fontStyle: FontStyle.italic,
                              color: const Color(0xFF1B5E20),
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                }(),
                TextField(
                  controller: _catatanController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Catatan persetujuan (opsional)',
                    hintText: 'Tulis catatan jika diperlukan...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: Color(0xFF33C8DA),
                        width: 2,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _isSubmitting
                            ? null
                            : () => Navigator.of(context).pop(),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        child: const Text(
                          'Batal',
                          style: TextStyle(
                            color: Color(0xFF475569),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitApprove,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF33C8DA),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 0,
                        ),
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : const Text(
                                'Ya, Setujui',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final roleId = authProvider.user?.roleId;
    final List<dynamic> approvals = _kegiatan['approvals'] as List? ?? [];
    final String targetLevel = roleId == 4
        ? 'PPK'
        : (roleId == 5 ? 'Wadir2' : '');
    final myApproval = approvals.firstWhere(
      (a) => a['approval_level'] == targetLevel && a['status'] == 'Aktif',
      orElse: () => null,
    );
    final bool isPendingMyApproval = myApproval != null;

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          title: Text(
            'Detail Kegiatan',
            style: GoogleFonts.figtree(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
          automaticallyImplyLeading: false,
          centerTitle: false,
          bottom: const TabBar(
            labelColor: Color(0xFF33C8DA),
            unselectedLabelColor: Color(0xFF64748B),
            indicatorColor: Color(0xFF33C8DA),
            indicatorSize: TabBarIndicatorSize.tab,
            labelStyle: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              fontFamily: 'Figtree',
            ),
            unselectedLabelStyle: TextStyle(
              fontWeight: FontWeight.w500,
              fontSize: 13,
              fontFamily: 'Figtree',
            ),
            tabs: [
              Tab(text: 'Ringkasan'),
              Tab(text: 'RAB / Budget'),
              Tab(text: 'Persetujuan'),
            ],
          ),
        ),
        body: _buildBody(isPendingMyApproval),
      ),
    );
  }

  Widget _buildBody(bool isPendingMyApproval) {
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
              const Icon(
                Icons.error_outline,
                size: 64,
                color: Color(0xFFE57373),
              ),
              const SizedBox(height: 16),
              const Text(
                'Gagal memuat detail kegiatan',
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
                onPressed: _fetchDetail,
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

    final kak = _kegiatan['kak'] ?? {};
    final namaKegiatan = kak['nama_kegiatan'] ?? 'Tanpa Nama Kegiatan';
    final tipe = kak['tipe_kegiatan']?['nama_tipe'] ?? 'Akademik';
    final sumberDana = kak['mata_anggaran']?['nama_sumber_dana'] ?? 'PNBP';
    final tglMulai = kak['tanggal_mulai'];
    final tglSelesai = kak['tanggal_selesai'];
    final lokasi = kak['lokasi'] ?? '-';

    final String deskripsiKegiatan = kak['deskripsi_kegiatan'] ?? '-';
    final String metodePelaksanaan = kak['metode_pelaksanaan'] ?? '-';
    final String sasaranUtama = kak['sasaran_utama'] ?? '-';

    final pj = _kegiatan['penanggung_jawab_manual'] ?? kak['penanggung_jawab_manual'] ?? '-';
    final pelaksana = _kegiatan['pelaksana_manual'] ?? kak['pelaksana_manual'] ?? '-';

    // Grouping anggaran by kategori belanja
    final List<dynamic> anggaran = kak['anggaran'] as List? ?? [];
    final Map<String, List<dynamic>> groupedAnggaran = {};
    for (var item in anggaran) {
      final cat = item['kategori_belanja']?['nama'] ?? 'Tanpa Kategori';
      if (!groupedAnggaran.containsKey(cat)) {
        groupedAnggaran[cat] = [];
      }
      groupedAnggaran[cat]!.add(item);
    }

    final double totalAnggaran = anggaran.fold(
      0.0,
      (sum, item) =>
          sum + (double.tryParse(item['jumlah_diusulkan'].toString()) ?? 0.0),
    );

    // Public URL for surat pengantar
    final String? suratPengantarUrl =
        _kegiatan['surat_pengantar_url'] as String?;

    // Approval history
    final List<dynamic> approvals = _kegiatan['approvals'] as List? ?? [];

    // Target IKU
    final List<dynamic> targets = (kak['target_iku'] as List? ?? kak['ikus'] as List?) ?? [];

    return Stack(
      children: [
        TabBarView(
          children: [
            // ── TAB 1: RINGKASAN ─────────────────────────────────────────
            RefreshIndicator(
              onRefresh: _fetchDetail,
              color: const Color(0xFF33C8DA),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.fromLTRB(16, 16, 16, isPendingMyApproval ? 110 : 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Main Title Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            namaKegiatan,
                            style: GoogleFonts.figtree(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF0F172A),
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '📄 $tipe',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF475569),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE0F7FA),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '⚡ $sumberDana',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0E7490),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(color: Color(0xFFF1F5F9), height: 1),
                          const SizedBox(height: 16),
                          Text(
                            'TOTAL ANGGARAN DIAJUKAN',
                            style: GoogleFonts.figtree(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatCurrency(totalAnggaran),
                            style: GoogleFonts.figtree(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF33C8DA),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Detail Info Card
                    _buildSectionCard(
                      title: 'INFORMASI PELAKSANAAN',
                      icon: Icons.calendar_today_outlined,
                      children: [
                        _buildCompactInfoRow('Waktu', '${_formatDate(tglMulai)} s/d ${_formatDate(tglSelesai)}'),
                        const SizedBox(height: 12),
                        _buildCompactInfoRow('Lokasi', lokasi),
                        const SizedBox(height: 12),
                        _buildCompactInfoRow('Penanggung Jawab', pj),
                        const SizedBox(height: 12),
                        _buildCompactInfoRow('Pelaksana', pelaksana),
                        const SizedBox(height: 12),
                        _buildCompactInfoRow('Sasaran', sasaranUtama),
                        if (targets.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          _buildCompactInfoRow('IKU', targets.map((t) => t['iku']?['kode_iku'] ?? '-').join(', ')),
                        ],
                      ],
                    ),
                    const SizedBox(height: 16),

                    // IKU Card
                    () {
                      if (targets.isEmpty) return const SizedBox.shrink();

                      return Column(
                        children: [
                          _buildSectionCard(
                            title: 'INDIKATOR KINERJA UTAMA (IKU)',
                            icon: Icons.track_changes_rounded,
                            children: [
                              ...targets.map((t) {
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF33C8DA),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              t['iku']?['kode_iku'] ?? 'IKU',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              t['iku']?['nama_iku'] ?? '-',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: Color(0xFF1E293B),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Target Capaian',
                                                  style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                                                ),
                                                Text(
                                                  t['target']?.toString() ?? '-',
                                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Satuan',
                                                  style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                                                ),
                                                Text(
                                                  t['satuan']?['nama_satuan'] ?? '-',
                                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ],
                          ),
                          const SizedBox(height: 16),
                        ],
                      );
                    }(),

                    // Deskripsi Card
                    _buildSectionCard(
                      title: 'DESKRIPSI & METODE',
                      icon: Icons.description_outlined,
                      children: [
                        Text(
                          'Gambaran Umum',
                          style: GoogleFonts.figtree(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          deskripsiKegiatan,
                          style: GoogleFonts.figtree(
                            fontSize: 13,
                            color: const Color(0xFF334155),
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Metode Pelaksanaan',
                          style: GoogleFonts.figtree(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          metodePelaksanaan,
                          style: GoogleFonts.figtree(
                            fontSize: 13,
                            color: const Color(0xFF334155),
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Surat Pengantar Card
                    if (suratPengantarUrl != null)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.insert_drive_file_outlined,
                                  color: Color(0xFF33C8DA),
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'DOKUMEN LAMPIRAN',
                                  style: GoogleFonts.figtree(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                    color: const Color(0xFF475569),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              height: 48,
                              child: ElevatedButton.icon(
                                onPressed: () => _launchUrl(suratPengantarUrl),
                                icon: const Icon(Icons.picture_as_pdf_rounded, size: 18),
                                label: Text(
                                  'Buka Surat Pengantar (PDF)',
                                  style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF33C8DA),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
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

            // ── TAB 2: RAB / BUDGET ──────────────────────────────────────
            RefreshIndicator(
              onRefresh: _fetchDetail,
              color: const Color(0xFF33C8DA),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.fromLTRB(16, 16, 16, isPendingMyApproval ? 110 : 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: const [
                                  Icon(
                                    Icons.calculate_outlined,
                                    color: Color(0xFF33C8DA),
                                    size: 20,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Daftar Anggaran Belanja',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF0F172A),
                                      fontFamily: 'Figtree',
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          if (groupedAnggaran.isEmpty)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 24.0),
                              child: Center(
                                child: Text(
                                  'Belum ada rincian anggaran.',
                                  style: TextStyle(
                                    color: Color(0xFF94A3B8),
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            )
                          else ...[
                            ...groupedAnggaran.entries.map((entry) {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 8,
                                    ),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFF8FAFC),
                                      border: Border(
                                        left: BorderSide(
                                          color: Color(0xFF33C8DA),
                                          width: 4,
                                        ),
                                      ),
                                    ),
                                    child: Text(
                                      entry.key,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF334155),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  ...entry.value.map((item) {
                                    final List<String> vols = [];
                                    final double v1 = double.tryParse(item['volume1']?.toString() ?? '0') ?? 0;
                                    final String s1 = item['satuan1']?['nama_satuan'] ?? '';
                                    if (v1 > 0) vols.add('${v1.toInt()} $s1');

                                    final double v2 = double.tryParse(item['volume2']?.toString() ?? '0') ?? 0;
                                    final String s2 = item['satuan2']?['nama_satuan'] ?? '';
                                    if (v2 > 0) vols.add('${v2.toInt()} $s2');

                                    final double v3 = double.tryParse(item['volume3']?.toString() ?? '0') ?? 0;
                                    final String s3 = item['satuan3']?['nama_satuan'] ?? '';
                                    if (v3 > 0) vols.add('${v3.toInt()} $s3');

                                    final String volumeText = vols.join(' x ');

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF8FAFC),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: const Color(0xFFE2E8F0)),
                                      ),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Expanded(
                                            flex: 3,
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  item['uraian'] ?? '',
                                                  style: const TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w600,
                                                    color: Color(0xFF1E293B),
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  volumeText,
                                                  style: const TextStyle(
                                                    fontSize: 11,
                                                    color: Color(0xFF64748B),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Expanded(
                                            flex: 2,
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.end,
                                              children: [
                                                Text(
                                                  _formatCurrency(item['jumlah_diusulkan']),
                                                  style: const TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(0xFF33C8DA),
                                                  ),
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  '@ ${_formatCurrency(item['harga_satuan'])}',
                                                  style: const TextStyle(
                                                    fontSize: 10,
                                                    color: Color(0xFF64748B),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }),
                                  const SizedBox(height: 16),
                                ],
                              );
                            }),
                            const Divider(color: Color(0xFFE2E8F0)),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Total Anggaran',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E293B),
                                  ),
                                ),
                                Text(
                                  _formatCurrency(totalAnggaran),
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF33C8DA),
                                    fontFamily: 'Figtree',
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── TAB 3: PERSETUJUAN ────────────────────────────────────────
            RefreshIndicator(
              onRefresh: _fetchDetail,
              color: const Color(0xFF33C8DA),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.fromLTRB(16, 16, 16, isPendingMyApproval ? 110 : 24),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(
                            Icons.history_rounded,
                            color: Color(0xFF33C8DA),
                            size: 20,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Alur Persetujuan',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                              fontFamily: 'Figtree',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      if (approvals.isEmpty)
                        const Text(
                          'Belum ada riwayat persetujuan.',
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF64748B),
                            fontStyle: FontStyle.italic,
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: approvals.length,
                          itemBuilder: (context, idx) {
                            final app = approvals[idx];
                            final roleName = app['approval_level'] ?? '-';
                            final status = app['status'] ?? '-';
                            final userName = app['approver']?['nama_lengkap'] ?? '-';
                            final dateStr = _formatDate(app['updated_at']);

                            Color statusColor = Colors.orange;
                            Color statusBg = const Color(0xFFFFF7ED);
                            if (status == 'Disetujui') {
                              statusColor = Colors.green;
                              statusBg = const Color(0xFFF0FDF4);
                            } else if (status == 'Ditolak') {
                              statusColor = Colors.red;
                              statusBg = const Color(0xFFFEF2F2);
                            }

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16.0),
                              child: IntrinsicHeight(
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    Column(
                                      children: [
                                        Icon(
                                          status == 'Disetujui'
                                              ? Icons.check_circle
                                              : status == 'Ditolak'
                                                  ? Icons.cancel
                                                  : Icons.pending,
                                          color: statusColor,
                                          size: 20,
                                        ),
                                        if (idx < approvals.length - 1)
                                          Expanded(
                                            child: Container(
                                              width: 2,
                                              color: const Color(0xFFE2E8F0),
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Persetujuan: $roleName',
                                            style: const TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF0F172A),
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            'Oleh: $userName',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: Color(0xFF64748B),
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            dateStr,
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: Color(0xFF94A3B8),
                                            ),
                                          ),
                                          if (app['catatan'] != null &&
                                              app['catatan'].toString().trim().isNotEmpty) ...[
                                            const SizedBox(height: 6),
                                            Container(
                                              width: double.infinity,
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFF8FAFC),
                                                borderRadius: BorderRadius.circular(8),
                                                border: Border.all(color: const Color(0xFFE2E8F0)),
                                              ),
                                              child: Text(
                                                'Catatan: "${app['catatan']}"',
                                                style: GoogleFonts.figtree(
                                                  fontSize: 11,
                                                  fontStyle: FontStyle.italic,
                                                  color: const Color(0xFF475569),
                                                ),
                                              ),
                                            ),
                                          ],
                                          const SizedBox(height: 12),
                                        ],
                                      ),
                                    ),
                                    Align(
                                      alignment: Alignment.topRight,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: statusBg,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          status.toUpperCase(),
                                          style: TextStyle(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: statusColor,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),

        // Sticky Bottom Action Bar
        if (isPendingMyApproval)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
                border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _showApproveBottomSheet,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF33C8DA),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Setujui Kegiatan',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF33C8DA), size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: GoogleFonts.figtree(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF475569),
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildCompactInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: GoogleFonts.figtree(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF64748B),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 3,
          child: Text(
            value,
            style: GoogleFonts.figtree(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF0F172A),
            ),
          ),
        ),
      ],
    );
  }
}
