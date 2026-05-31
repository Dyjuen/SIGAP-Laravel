import 'dart:convert';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class KakDetailPage extends StatefulWidget {
  final int kakId;
  const KakDetailPage({super.key, required this.kakId});

  @override
  State<KakDetailPage> createState() => _KakDetailPageState();
}

class _KakDetailPageState extends State<KakDetailPage> {
  bool _isLoading = true;
  Map<String, dynamic>? _kak;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadKak();
  }

  Future<void> _loadKak() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final res = await ApiService.get('/kak/${widget.kakId}');
      if (res.statusCode == 200) {
        setState(() {
          _kak = jsonDecode(res.body);
          _isLoading = false;
        });
      } else {
        final data = jsonDecode(res.body);
        setState(() {
          _error = data['message'] ?? 'Gagal memuat KAK.';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() { _error = 'Terjadi kesalahan koneksi.'; _isLoading = false; });
    }
  }

  Future<void> _submitKak() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ajukan KAK?'),
        content: const Text('Kirim KAK ini ke Verifikator untuk ditinjau?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Batal', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF33C8DA)),
            child: const Text('Ajukan', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    final res = await ApiService.post('/kak/${widget.kakId}/submit', {});
    if (!mounted) return;
    if (res.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('KAK berhasil diajukan!'), backgroundColor: Colors.green),
      );
      _loadKak();
    } else {
      final data = jsonDecode(res.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(data['message'] ?? 'Gagal mengajukan.'), backgroundColor: Colors.redAccent),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
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
            Text('SIGAP PNJ',
                style: TextStyle(
                    color: Color(0xFF0F172A),
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    fontFamily: 'Figtree')),
            Text('Detail KAK',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontFamily: 'Figtree')),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF33C8DA)),
            onPressed: _loadKak,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF33C8DA)))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.redAccent)))
              : _buildBody(),
    );
  }

  Widget _buildBody() {
    final kak = _kak!;
    final statusId = kak['status_id'] as int? ?? 1;
    final statusNama = kak['status_nama'] ?? 'Draft';
    final canSubmit = statusId == 1 || statusId == 5;

    Color statusColor;
    Color statusBg;
    switch (statusId) {
      case 3: statusColor = const Color(0xFF10B981); statusBg = const Color(0xFFECFDF5); break;
      case 4: statusColor = const Color(0xFFEF4444); statusBg = const Color(0xFFFEF2F2); break;
      case 2: statusColor = const Color(0xFFF59E0B); statusBg = const Color(0xFFFFFBEB); break;
      case 5: statusColor = const Color(0xFF8B5CF6); statusBg = const Color(0xFFF5F3FF); break;
      default: statusColor = const Color(0xFF64748B); statusBg = const Color(0xFFF1F5F9);
    }

    final rab = kak['rab'] as List? ?? [];
    final totalRab = rab.fold<double>(
        0, (sum, r) => sum + _parseDouble(r['jumlah_diusulkan']));

    final manfaat = kak['manfaat'] as List? ?? [];
    final tahapan = kak['tahapan'] as List? ?? [];
    final approvals = kak['approvals'] as List? ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        kak['nama_kegiatan'] ?? '-',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0F172A),
                          fontFamily: 'Figtree',
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(8)),
                      child: Text(statusNama,
                          style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _infoRow(Icons.category_outlined, kak['tipe'] ?? '-'),
                const SizedBox(height: 6),
                _infoRow(Icons.location_on_outlined, kak['lokasi'] ?? '-'),
                const SizedBox(height: 6),
                _infoRow(Icons.calendar_today_outlined,
                    '${kak['tanggal_mulai'] ?? '-'} s/d ${kak['tanggal_selesai'] ?? '-'}'),
                const SizedBox(height: 6),
                _infoRow(Icons.schedule_outlined, kak['kurun_waktu_pelaksanaan'] ?? '-'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Description
          _buildSection('Deskripsi Kegiatan', kak['deskripsi_kegiatan'] ?? '-'),
          const SizedBox(height: 12),
          _buildSection('Metode Pelaksanaan', kak['metode_pelaksanaan'] ?? '-'),
          const SizedBox(height: 12),
          _buildSection('Sasaran Utama', kak['sasaran_utama'] ?? '-'),
          const SizedBox(height: 12),

          // Manfaat
          if (manfaat.isNotEmpty) ...[
            _buildListSection('Manfaat Kegiatan',
                manfaat.map((m) => m['manfaat'] as String? ?? '-').toList()),
            const SizedBox(height: 12),
          ],

          // Tahapan
          if (tahapan.isNotEmpty) ...[
            _buildListSection('Tahapan Pelaksanaan',
                tahapan.map((t) => t['nama_tahapan'] as String? ?? '-').toList(),
                numbered: true),
            const SizedBox(height: 12),
          ],

          // RAB Summary
          if (rab.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Rincian Anggaran (RAB)',
                      style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 15,
                          color: Color(0xFF0F172A),
                          fontFamily: 'Figtree')),
                  const SizedBox(height: 12),
                  ...rab.map((r) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(r['uraian'] ?? '-',
                                  style: const TextStyle(color: Color(0xFF334155), fontSize: 13)),
                            ),
                            Text(
                              _formatRupiah(_parseDouble(r['jumlah_diusulkan'])),
                              style: const TextStyle(
                                  color: Color(0xFF33C8DA), fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),
                      )),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Anggaran',
                          style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                      Text(_formatRupiah(totalRab),
                          style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF33C8DA),
                              fontSize: 16,
                              fontFamily: 'Figtree')),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Approval History
          if (approvals.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Riwayat Peninjauan',
                      style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 15,
                          color: Color(0xFF0F172A),
                          fontFamily: 'Figtree')),
                  const SizedBox(height: 12),
                  ...approvals.map((a) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              margin: const EdgeInsets.only(top: 5),
                              decoration: const BoxDecoration(
                                  color: Color(0xFF33C8DA), shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${a['approver_nama'] ?? '-'} — ${a['status'] ?? '-'}',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1E293B),
                                        fontSize: 13),
                                  ),
                                  if (a['catatan'] != null) ...[
                                    const SizedBox(height: 4),
                                    Text(a['catatan'],
                                        style: const TextStyle(
                                            color: Color(0xFF64748B), fontSize: 12)),
                                  ],
                                  const SizedBox(height: 2),
                                  Text(a['tanggal'] ?? '-',
                                      style: const TextStyle(
                                          color: Color(0xFF94A3B8), fontSize: 11)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          if (canSubmit) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _submitKak,
                icon: const Icon(Icons.send_outlined),
                label: Text(
                  statusId == 5 ? 'Ajukan Ulang ke Verifikator' : 'Ajukan ke Verifikator',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF33C8DA),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text, style: const TextStyle(color: Color(0xFF334155), fontSize: 13)),
        ),
      ],
    );
  }

  Widget _buildSection(String title, String content) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 13,
                  color: Color(0xFF64748B),
                  fontFamily: 'Figtree')),
          const SizedBox(height: 8),
          Text(content,
              style: const TextStyle(color: Color(0xFF334155), fontSize: 14, height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildListSection(String title, List<String> items, {bool numbered = false}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 13,
                  color: Color(0xFF64748B),
                  fontFamily: 'Figtree')),
          const SizedBox(height: 8),
          ...items.asMap().entries.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      numbered ? '${e.key + 1}.' : '•',
                      style: const TextStyle(color: Color(0xFF33C8DA), fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(e.value,
                          style: const TextStyle(color: Color(0xFF334155), fontSize: 13, height: 1.4)),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  String _formatRupiah(double amount) {
    final s = amount.toStringAsFixed(0);
    final result = StringBuffer();
    int count = 0;
    for (int i = s.length - 1; i >= 0; i--) {
      if (count > 0 && count % 3 == 0) result.write('.');
      result.write(s[i]);
      count++;
    }
    return 'Rp ${result.toString().split('').reversed.join()}';
  }

  double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}
