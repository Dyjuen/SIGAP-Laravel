import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import 'package:google_fonts/google_fonts.dart';

class PpkKegiatanDetailPage extends StatefulWidget {
  final int kegiatanId;
  const PpkKegiatanDetailPage({super.key, required this.kegiatanId});

  @override
  State<PpkKegiatanDetailPage> createState() => _PpkKegiatanDetailPageState();
}

class _PpkKegiatanDetailPageState extends State<PpkKegiatanDetailPage> {
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
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
                        color: const Color(0xFF00BCD4).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.picture_as_pdf_rounded,
                        color: Color(0xFF00BCD4),
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
                    color: colorScheme.surfaceVariant.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: colorScheme.outline.withOpacity(0.2)),
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
                            content: Text('Tautan berhasil disalin ke papan klip!'),
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
                        backgroundColor: const Color(0xFF00BCD4),
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
        data: {
          'catatan': _catatanController.text.trim(),
        },
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
          Navigator.of(context).pop(true); // Close detail page, notify list to refresh
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
                  final List<dynamic> approvals = _kegiatan['approvals'] as List? ?? [];
                  final ppkApproval = approvals.firstWhere((a) => a['approval_level'] == 'PPK', orElse: () => null);
                  final ppkCatatan = ppkApproval != null ? ppkApproval['catatan'] : null;
                  final authProvider = Provider.of<AuthProvider>(context, listen: false);
                  final isWadir = authProvider.user?.roleId == 5;

                  if (isWadir && ppkCatatan != null && ppkCatatan.toString().trim().isNotEmpty) {
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
                              const Icon(Icons.feedback_outlined, color: Colors.green, size: 16),
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
                      borderSide: const BorderSide(color: Color(0xFF00BCD4), width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        child: const Text(
                          'Batal',
                          style: TextStyle(color: Color(0xFF475569), fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitApprove,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00BCD4),
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
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
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
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Detail Kegiatan',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: Color(0xFF0F172A),
            fontFamily: 'Figtree',
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF0F172A), size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF00BCD4)),
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
                  backgroundColor: const Color(0xFF00BCD4),
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
    final pengusul = kak['pengusul']?['nama_lengkap'] ?? '-';
    final tglMulai = kak['tanggal_mulai'];
    final tglSelesai = kak['tanggal_selesai'];
    final lokasi = kak['lokasi'] ?? '-';
    final ikus = kak['ikus'] as List? ?? [];
    final ikusStr = ikus.map((i) => i['iku']?['nama_iku']).where((n) => n != null).join(', ');

    final penanggungJawab = _kegiatan['penanggung_jawab_manual'] ?? '-';
    final pelaksana = _kegiatan['pelaksana_manual'] ?? '-';
    final suratPengantarUrl = _kegiatan['surat_pengantar_url'];

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
      (sum, item) => sum + (double.tryParse(item['jumlah_diusulkan'].toString()) ?? 0.0),
    );

    // Approval history
    final List<dynamic> approvals = _kegiatan['approvals'] as List? ?? [];
    final activeApproval = _kegiatan['active_approval'] ?? _kegiatan['activeApproval'] ?? {};
    final bool isPendingMyApproval = activeApproval['status'] == 'Aktif';

    return Stack(
      children: [
        SingleChildScrollView(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 16,
            bottom: isPendingMyApproval ? 110 : 24,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
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
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        fontFamily: 'Figtree',
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
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
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Informasi KAK
              _buildSectionCard(
                title: 'INFORMASI KAK',
                icon: Icons.assignment_outlined,
                children: [
                  _buildInfoTile(Icons.person_outline, 'Pengusul', pengusul),
                  _buildInfoTile(
                    Icons.calendar_today_outlined,
                    'Waktu Pelaksanaan',
                    '${_formatDate(tglMulai)} s/d ${_formatDate(tglSelesai)}',
                  ),
                  _buildInfoTile(Icons.location_on_outlined, 'Lokasi', lokasi),
                  _buildInfoTile(Icons.track_changes_outlined, 'IKU Sasaran', ikusStr.isEmpty ? '-' : ikusStr),
                ],
              ),
              const SizedBox(height: 16),

              // Informasi Pelaksanaan
              _buildSectionCard(
                title: 'INFORMASI PELAKSANAAN',
                icon: Icons.check_circle_outline,
                isCyanTint: true,
                children: [
                  _buildInfoTile(Icons.manage_accounts_outlined, 'Penanggung Jawab', penanggungJawab),
                  _buildInfoTile(Icons.group_outlined, 'Pelaksana', pelaksana),
                  const SizedBox(height: 12),
                  const Text(
                    'Surat Pengantar',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0E7490),
                    ),
                  ),
                  const SizedBox(height: 6),
                  if (suratPengantarUrl != null)
                    ElevatedButton.icon(
                      onPressed: () => _launchUrl(suratPengantarUrl),
                      icon: const Icon(Icons.file_open_outlined, size: 16),
                      label: const Text('Buka Surat Pengantar (PDF)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00BCD4),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                    )
                  else
                    const Text(
                      'Tidak ada dokumen surat pengantar.',
                      style: TextStyle(
                        fontSize: 13,
                        fontStyle: FontStyle.italic,
                        color: Color(0xFF64748B),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),

              // RAB Grouped Table
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
                      children: const [
                        Icon(Icons.calculate_outlined, color: Color(0xFF00BCD4), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Rincian Anggaran Biaya (RAB)',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                            fontFamily: 'Figtree',
                          ),
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
                            style: TextStyle(color: Color(0xFF94A3B8), fontStyle: FontStyle.italic),
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
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: const BoxDecoration(
                                color: Color(0xFFF8FAFC),
                                border: Border(left: BorderSide(color: Color(0xFF00BCD4), width: 4)),
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
                              // build volume string
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

                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
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
                                          const SizedBox(height: 2),
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
                                              color: Color(0xFF00BCD4),
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
                            const SizedBox(height: 12),
                          ],
                        );
                      }),
                      const Divider(color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total Usulan KAK',
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
                              color: Color(0xFF00BCD4),
                              fontFamily: 'Figtree',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Riwayat Persetujuan
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
                      children: const [
                        Icon(Icons.history_rounded, color: Color(0xFF00BCD4), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Riwayat Persetujuan',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                            fontFamily: 'Figtree',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
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

                          // Colors based on status
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
                                           'Approval Level: $roleName',
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
                                         if (app['catatan'] != null && app['catatan'].toString().trim().isNotEmpty) ...[
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
            ],
          ),
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
                  )
                ],
                border: const Border(
                  top: BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Kembalikan kegiatan hanya didukung pada persetujuan KAK oleh Verifikator.',
                            ),
                            backgroundColor: Color(0xFFC2410C),
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        side: const BorderSide(color: Colors.red),
                      ),
                      child: const Text(
                        'Kembalikan',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _showApproveBottomSheet,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00BCD4),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Setujui Kegiatan',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
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
    bool isCyanTint = false,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isCyanTint ? const Color(0xFFE0F7FA).withOpacity(0.4) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isCyanTint ? const Color(0xFFB2EBF2) : const Color(0xFFE2E8F0),
        ),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF00BCD4), size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF475569),
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

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: const Color(0xFF94A3B8)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
