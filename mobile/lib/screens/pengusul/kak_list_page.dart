import 'dart:convert';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import 'kak_edit_page.dart';
import 'kegiatan_form_page.dart';

class KakListPage extends StatefulWidget {
  final int? initialStatusId;
  const KakListPage({super.key, this.initialStatusId});

  @override
  State<KakListPage> createState() => _KakListPageState();
}

class _KakListPageState extends State<KakListPage> {
  bool _isLoading = true;
  List<dynamic> _kaks = [];
  List<dynamic> _filtered = [];
  final _searchController = TextEditingController();
  int? _activeStatusFilter;

  final _statusFilters = [
    {'id': null, 'label': 'Semua'},
    {'id': 1, 'label': 'Draft'},
    {'id': 2, 'label': 'Review'},
    {'id': 3, 'label': 'Disetujui'},
    {'id': 4, 'label': 'Ditolak'},
    {'id': 5, 'label': 'Revisi'},
  ];

  @override
  void initState() {
    super.initState();
    _activeStatusFilter = widget.initialStatusId;
    _loadKaks();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadKaks() async {
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
        setState(() {
          _kaks = data;
          _applyFilter();
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _applyFilter() {
    List<dynamic> result = List.from(_kaks);
    if (_activeStatusFilter != null) {
      result = result.where((k) => k['status_id'] == _activeStatusFilter).toList();
    }
    final q = _searchController.text.trim().toLowerCase();
    if (q.isNotEmpty) {
      result = result.where((k) =>
          (k['nama_kegiatan'] ?? '').toLowerCase().contains(q)).toList();
    }
    setState(() => _filtered = result);
  }

  Future<void> _deleteKak(int kakId, String nama) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus KAK?'),
        content: Text('Yakin ingin menghapus "$nama"? Tindakan ini tidak dapat dibatalkan.'),
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
    if (confirm != true) return;

    final res = await ApiService.delete('/kak/$kakId');
    if (!mounted) return;
    if (res.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('KAK berhasil dihapus.'), backgroundColor: Colors.green),
      );
      _loadKaks();
    } else {
      final data = jsonDecode(res.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(data['message'] ?? 'Gagal menghapus KAK.'), backgroundColor: Colors.redAccent),
      );
    }
  }

  Future<void> _submitKak(int kakId, String nama) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ajukan KAK?'),
        content: Text('Kirim "$nama" ke Verifikator untuk ditinjau?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Batal', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF33C8DA)),
            child: const Text('Ajukan', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    final res = await ApiService.post('/kak/$kakId/submit', {});
    if (!mounted) return;
    if (res.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('KAK berhasil diajukan!'), backgroundColor: Colors.green),
      );
      _loadKaks();
    } else {
      final data = jsonDecode(res.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(data['message'] ?? 'Gagal mengajukan KAK.'), backgroundColor: Colors.redAccent),
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
                  fontFamily: 'Figtree',
                )),
            Text('Daftar KAK Saya',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontFamily: 'Figtree')),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF33C8DA)),
            onPressed: _loadKaks,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context)
            .push(MaterialPageRoute(builder: (_) => KegiatanFormPage(onSuccess: _loadKaks)))
            .then((_) => _loadKaks()),
        backgroundColor: const Color(0xFF33C8DA),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Buat KAK', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextFormField(
              controller: _searchController,
              onChanged: (_) => _applyFilter(),
              decoration: InputDecoration(
                hintText: 'Cari nama kegiatan...',
                hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                filled: true,
                fillColor: Colors.white,
                prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5)),
              ),
            ),
          ),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: _statusFilters.map((f) {
                final isSelected = _activeStatusFilter == f['id'];
                return GestureDetector(
                  onTap: () {
                    setState(() => _activeStatusFilter = f['id'] as int?);
                    _applyFilter();
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF33C8DA) : Colors.white,
                      border: Border.all(
                          color: isSelected ? Colors.transparent : const Color(0xFFE2E8F0)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      f['label'] as String,
                      style: TextStyle(
                        color: isSelected ? Colors.white : const Color(0xFF475569),
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),

          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF33C8DA)))
                : _filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.inbox_outlined,
                                color: Color(0xFFCBD5E1), size: 60),
                            const SizedBox(height: 12),
                            const Text('Tidak ada KAK ditemukan.',
                                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _filtered.length,
                        itemBuilder: (context, idx) => _buildKakCard(_filtered[idx]),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildKakCard(Map<String, dynamic> kak) {
    final statusId = kak['status_id'] as int? ?? 1;
    final statusNama = kak['status_nama'] ?? 'Draft';
    final kakId = kak['kak_id'] as int;
    final nama = kak['nama_kegiatan'] ?? '-';
    final canDelete = statusId == 1 || statusId == 4;
    final canSubmit = statusId == 1 || statusId == 5;

    Color statusColor;
    Color statusBg;
    switch (statusId) {
      case 3:
        statusColor = const Color(0xFF10B981);
        statusBg = const Color(0xFFECFDF5);
        break;
      case 4:
        statusColor = const Color(0xFFEF4444);
        statusBg = const Color(0xFFFEF2F2);
        break;
      case 2:
        statusColor = const Color(0xFFF59E0B);
        statusBg = const Color(0xFFFFFBEB);
        break;
      case 5:
        statusColor = const Color(0xFF8B5CF6);
        statusBg = const Color(0xFFF5F3FF);
        break;
      default:
        statusColor = const Color(0xFF64748B);
        statusBg = const Color(0xFFF1F5F9);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.01), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      nama,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        fontFamily: 'Figtree',
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      kak['tipe'] ?? 'Tipe tidak tersedia',
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Diperbarui: ${kak['updated_at'] ?? '-'}',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration:
                    BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(8)),
                child: Text(statusNama,
                    style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                        fontFamily: 'Figtree')),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(color: Color(0xFFF1F5F9), height: 1),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 38,
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(
                          builder: (_) => KakEditPage(kakId: kakId)),
                    ).then((_) => _loadKaks()),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Detail / Edit',
                        style: TextStyle(
                            color: Color(0xFF475569), fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ),
              ),
              if (canSubmit) ...[
                const SizedBox(width: 8),
                Expanded(
                  child: SizedBox(
                    height: 38,
                    child: ElevatedButton(
                      onPressed: () => _submitKak(kakId, nama),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF33C8DA),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text(statusId == 5 ? 'Ajukan Ulang' : 'Ajukan',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                ),
              ],
              if (canDelete) ...[
                const SizedBox(width: 8),
                SizedBox(
                  height: 38,
                  width: 38,
                  child: OutlinedButton(
                    onPressed: () => _deleteKak(kakId, nama),
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.zero,
                      side: const BorderSide(color: Color(0xFFFDA4AF)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
