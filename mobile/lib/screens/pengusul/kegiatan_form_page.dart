import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/chatbot_service.dart';
import '../../services/api_service.dart';

class KegiatanFormPage extends StatefulWidget {
  final VoidCallback? onSuccess;
  const KegiatanFormPage({super.key, this.onSuccess});

  @override
  State<KegiatanFormPage> createState() => _KegiatanFormPageState();
}

class _KegiatanFormPageState extends State<KegiatanFormPage> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;
  bool _isSubmitting = false;

  // Step 1: Umum
  final _namaKegiatanCtrl = TextEditingController();
  final _deskripsiCtrl = TextEditingController();
  final _metodeCtrl = TextEditingController();
  final _lokasiCtrl = TextEditingController();
  final _sasaranCtrl = TextEditingController();
  DateTime? _tanggalMulai;
  DateTime? _tanggalSelesai;
  int? _tipeKegiatanId;
  List<Map<String, dynamic>> _tipeKegiatanList = [];

  // Step 2: Manfaat & Tahapan
  final List<TextEditingController> _manfaatCtrls = [TextEditingController()];
  final List<TextEditingController> _tahapanCtrls = [TextEditingController()];

  // Step 3: RAB
  final List<Map<String, dynamic>> _rabItems = [
    {
      'uraian': TextEditingController(),
      'volume1': TextEditingController(),
      'harga_satuan': TextEditingController(),
      'kategori_belanja_id': 1,
    },
  ];
  List<Map<String, dynamic>> _kategoriBelanja = [];

  bool _masterLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadMasterData();
    // Hide chatbot when filling KAK/Kegiatan
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatbotService>().setVisible(false);
    });
  }

  Future<void> _loadMasterData() async {
    try {
      final tipeRes = await ApiService.get('/master/tipe-kegiatan');
      final kategoriRes = await ApiService.get('/master/kategori-belanja');
      if (tipeRes.statusCode == 200 && kategoriRes.statusCode == 200) {
        setState(() {
          final tipeData = jsonDecode(tipeRes.body);
          final List<dynamic> tipeList = (tipeData is Map && tipeData.containsKey('data'))
              ? tipeData['data']
              : (tipeData is List ? tipeData : []);
          _tipeKegiatanList = List<Map<String, dynamic>>.from(tipeList);

          final kategoriData = jsonDecode(kategoriRes.body);
          final List<dynamic> kategoriList = (kategoriData is Map && kategoriData.containsKey('data'))
              ? kategoriData['data']
              : (kategoriData is List ? kategoriData : []);
          _kategoriBelanja = List<Map<String, dynamic>>.from(kategoriList);

          if (_tipeKegiatanList.isNotEmpty) {
            final firstTipe = _tipeKegiatanList[0];
            _tipeKegiatanId = int.tryParse((firstTipe['tipe_kegiatan_id'] ?? firstTipe['id'] ?? '').toString()) ?? 1;
          }
          if (_kategoriBelanja.isNotEmpty) {
            final firstKat = _kategoriBelanja[0];
            _rabItems[0]['kategori_belanja_id'] = int.tryParse((firstKat['kategori_belanja_id'] ?? firstKat['id'] ?? '').toString()) ?? 1;
          }
          _masterLoaded = true;
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    // Show chatbot again when leaving
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ChatbotService>().setVisible(true);
      }
    });
    _namaKegiatanCtrl.dispose();
    _deskripsiCtrl.dispose();
    _metodeCtrl.dispose();
    _lokasiCtrl.dispose();
    _sasaranCtrl.dispose();
    for (final c in _manfaatCtrls) {
      c.dispose();
    }
    for (final c in _tahapanCtrls) {
      c.dispose();
    }
    for (final r in _rabItems) {
      (r['uraian'] as TextEditingController).dispose();
      (r['volume1'] as TextEditingController).dispose();
      (r['harga_satuan'] as TextEditingController).dispose();
    }
    super.dispose();
  }

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _tanggalMulai = picked;
        } else {
          _tanggalSelesai = picked;
        }
      });
    }
  }

  String _fmtDate(DateTime? dt) {
    if (dt == null) return 'Pilih Tanggal';
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  String _fmtDateApi(DateTime dt) {
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }

  Future<void> _submit() async {
    // Validate all required fields
    if (_namaKegiatanCtrl.text.trim().isEmpty ||
        _deskripsiCtrl.text.trim().isEmpty ||
        _metodeCtrl.text.trim().isEmpty ||
        _lokasiCtrl.text.trim().isEmpty ||
        _sasaranCtrl.text.trim().isEmpty ||
        _tanggalMulai == null ||
        _tanggalSelesai == null ||
        _tipeKegiatanId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lengkapi semua kolom pada tab Umum.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      setState(() => _currentStep = 0);
      return;
    }

    final manfaatFilled = _manfaatCtrls
        .where((c) => c.text.trim().isNotEmpty)
        .toList();
    final tahapanFilled = _tahapanCtrls
        .where((c) => c.text.trim().isNotEmpty)
        .toList();

    if (manfaatFilled.isEmpty || tahapanFilled.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Tambahkan minimal 1 manfaat dan 1 tahapan pelaksanaan.',
          ),
          backgroundColor: Colors.redAccent,
        ),
      );
      setState(() => _currentStep = 1);
      return;
    }

    final rabValid = _rabItems.every(
      (r) =>
          (r['uraian'] as TextEditingController).text.trim().isNotEmpty &&
          (r['volume1'] as TextEditingController).text.trim().isNotEmpty &&
          (r['harga_satuan'] as TextEditingController).text.trim().isNotEmpty,
    );

    if (!rabValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lengkapi semua kolom RAB.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      setState(() => _currentStep = 2);
      return;
    }

    setState(() => _isSubmitting = true);

    final body = {
      'nama_kegiatan': _namaKegiatanCtrl.text.trim(),
      'deskripsi_kegiatan': _deskripsiCtrl.text.trim(),
      'metode_pelaksanaan': _metodeCtrl.text.trim(),
      'lokasi': _lokasiCtrl.text.trim(),
      'sasaran_utama': _sasaranCtrl.text.trim(),
      'tanggal_mulai': _fmtDateApi(_tanggalMulai!),
      'tanggal_selesai': _fmtDateApi(_tanggalSelesai!),
      'tipe_kegiatan_id': _tipeKegiatanId,
      'manfaat': manfaatFilled.map((c) => {'value': c.text.trim()}).toList(),
      'tahapan': tahapanFilled
          .map((c) => {'nama_tahapan': c.text.trim()})
          .toList(),
      'rab': _rabItems
          .map(
            (r) => {
              'uraian': (r['uraian'] as TextEditingController).text.trim(),
              'volume1':
                  double.tryParse(
                    (r['volume1'] as TextEditingController).text.trim(),
                  ) ??
                  1,
              'harga_satuan':
                  double.tryParse(
                    (r['harga_satuan'] as TextEditingController).text.trim(),
                  ) ??
                  0,
              'kategori_belanja_id': r['kategori_belanja_id'] as int,
            },
          )
          .toList(),
    };

    print('Kategori Belanja IDs being sent:');
    final rabList = body['rab'] as List?;
    if (rabList != null) {
      for (var rabItem in rabList) {
        print('  - Uraian: ${rabItem['uraian']}, Kategori ID: ${rabItem['kategori_belanja_id']}');
      }
    }

    try {
      final res = await ApiService.post('/kak', body);
      if (!mounted) return;

      if (res.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('KAK berhasil disimpan sebagai Draft!'),
            backgroundColor: Colors.green,
          ),
        );
        widget.onSuccess?.call();
        Navigator.of(context).pop();
      } else {
        final data = jsonDecode(res.body);
        // Show detailed validation error if available
        String msg = data['message'] ?? 'Gagal menyimpan KAK.';
        if (data['errors'] != null) {
          final errors = data['errors'] as Map<String, dynamic>;
          msg = errors.values.first[0];
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: Colors.redAccent),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Terjadi kesalahan koneksi.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: true,
        centerTitle: false,
        title: Text(
          'Buat KAK Baru',
          style: GoogleFonts.figtree(
            fontSize: 20,
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.w800,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      body: Column(
        children: [
          // Step Tabs
          Container(
            color: Colors.white,
            child: Row(
              children: [
                _buildTab(0, 'Umum'),
                _buildTab(1, 'Manfaat & Tahapan'),
                _buildTab(2, 'RAB'),
              ],
            ),
          ),

          Expanded(
            child: Form(
              key: _formKey,
              child: [
                _buildStep0(),
                _buildStep1(),
                _buildStep2(),
              ][_currentStep],
            ),
          ),

          // Bottom Buttons
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: OutlinedButton(
                        onPressed: () => setState(() => _currentStep--),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Kembali',
                          style: TextStyle(
                            color: Color(0xFF475569),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _isSubmitting
                          ? null
                          : () {
                              if (_currentStep < 2) {
                                setState(() => _currentStep++);
                              } else {
                                _submit();
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF33C8DA),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text(
                              _currentStep == 2 ? 'Simpan Draft' : 'Lanjutkan',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
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
    );
  }

  Widget _buildTab(int index, String label) {
    final isActive = _currentStep == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _currentStep = index),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isActive
                      ? const Color(0xFF33C8DA)
                      : const Color(0xFF94A3B8),
                  fontSize: 13,
                ),
              ),
            ),
            Container(
              height: 2,
              color: isActive ? const Color(0xFF33C8DA) : Colors.transparent,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep0() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Informasi Umum',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              fontFamily: 'Figtree',
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Isi informasi dasar kegiatan yang akan diusulkan.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
          const SizedBox(height: 20),

          _buildField(_namaKegiatanCtrl, 'Nama Kegiatan', Icons.event_outlined),
          const SizedBox(height: 14),
          _buildField(
            _deskripsiCtrl,
            'Deskripsi / Latar Belakang',
            Icons.description_outlined,
            maxLines: 3,
          ),
          const SizedBox(height: 14),
          _buildField(
            _metodeCtrl,
            'Metode Pelaksanaan',
            Icons.build_outlined,
            maxLines: 2,
          ),
          const SizedBox(height: 14),
          _buildField(
            _lokasiCtrl,
            'Lokasi Kegiatan',
            Icons.location_on_outlined,
          ),
          const SizedBox(height: 14),
          _buildField(_sasaranCtrl, 'Sasaran Utama', Icons.people_outline),
          const SizedBox(height: 14),

          // Tipe Kegiatan Dropdown
          if (_masterLoaded && _tipeKegiatanList.isNotEmpty) ...[
            DropdownButtonFormField<int>(
              initialValue: _tipeKegiatanId,
              decoration: InputDecoration(
                labelText: 'Tipe Kegiatan',
                prefixIcon: const Icon(
                  Icons.category_outlined,
                  color: Color(0xFF64748B),
                ),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFF33C8DA),
                    width: 1.5,
                  ),
                ),
              ),
              items: _tipeKegiatanList
                  .map(
                    (t) => DropdownMenuItem<int>(
                      value: (t['tipe_kegiatan_id'] ?? t['id']) as int,
                      child: Text(t['nama_tipe'] ?? t['nama'] ?? '-'),
                    ),
                  )
                  .toList(),
              onChanged: (val) => setState(() => _tipeKegiatanId = val),
            ),
            const SizedBox(height: 14),
          ],

          // Date Pickers
          Row(
            children: [
              Expanded(
                child: _buildDatePicker(
                  'Tanggal Mulai',
                  _tanggalMulai,
                  () => _pickDate(true),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildDatePicker(
                  'Tanggal Selesai',
                  _tanggalSelesai,
                  () => _pickDate(false),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Manfaat Kegiatan',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'Figtree',
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Tuliskan manfaat yang diharapkan dari kegiatan ini.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
          const SizedBox(height: 12),

          ..._manfaatCtrls.asMap().entries.map(
            (e) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Expanded(
                    child: _buildField(
                      e.value,
                      'Manfaat ${e.key + 1}',
                      Icons.check_circle_outline,
                    ),
                  ),
                  if (_manfaatCtrls.length > 1)
                    IconButton(
                      icon: const Icon(
                        Icons.remove_circle_outline,
                        color: Colors.redAccent,
                      ),
                      onPressed: () => setState(() {
                        e.value.dispose();
                        _manfaatCtrls.removeAt(e.key);
                      }),
                    ),
                ],
              ),
            ),
          ),
          TextButton.icon(
            onPressed: () =>
                setState(() => _manfaatCtrls.add(TextEditingController())),
            icon: const Icon(Icons.add, color: Color(0xFF33C8DA)),
            label: const Text(
              'Tambah Manfaat',
              style: TextStyle(
                color: Color(0xFF33C8DA),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          const SizedBox(height: 24),
          const Text(
            'Tahapan Pelaksanaan',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'Figtree',
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Tuliskan tahapan-tahapan yang akan dilaksanakan.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
          const SizedBox(height: 12),

          ..._tahapanCtrls.asMap().entries.map(
            (e) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Expanded(
                    child: _buildField(
                      e.value,
                      'Tahapan ${e.key + 1}',
                      Icons.linear_scale_outlined,
                    ),
                  ),
                  if (_tahapanCtrls.length > 1)
                    IconButton(
                      icon: const Icon(
                        Icons.remove_circle_outline,
                        color: Colors.redAccent,
                      ),
                      onPressed: () => setState(() {
                        e.value.dispose();
                        _tahapanCtrls.removeAt(e.key);
                      }),
                    ),
                ],
              ),
            ),
          ),
          TextButton.icon(
            onPressed: () =>
                setState(() => _tahapanCtrls.add(TextEditingController())),
            icon: const Icon(Icons.add, color: Color(0xFF33C8DA)),
            label: const Text(
              'Tambah Tahapan',
              style: TextStyle(
                color: Color(0xFF33C8DA),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Rincian Anggaran Belanja (RAB)',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'Figtree',
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Tambahkan setiap komponen biaya yang dibutuhkan.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
          const SizedBox(height: 16),

          ..._rabItems.asMap().entries.map((e) {
            final r = e.value;
            return Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Item ${e.key + 1}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF475569),
                          fontFamily: 'Figtree',
                        ),
                      ),
                      if (_rabItems.length > 1)
                        IconButton(
                          icon: const Icon(
                            Icons.delete_outline,
                            color: Colors.redAccent,
                            size: 20,
                          ),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () =>
                              setState(() => _rabItems.removeAt(e.key)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _buildField(
                    r['uraian'] as TextEditingController,
                    'Uraian',
                    Icons.notes_outlined,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _buildField(
                          r['volume1'] as TextEditingController,
                          'Volume',
                          Icons.numbers_outlined,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildField(
                          r['harga_satuan'] as TextEditingController,
                          'Harga Satuan',
                          Icons.attach_money_outlined,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ],
                  ),
                  if (_masterLoaded && _kategoriBelanja.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    DropdownButtonFormField<int>(
                      initialValue: r['kategori_belanja_id'] as int,
                      decoration: InputDecoration(
                        labelText: 'Kategori Belanja',
                        prefixIcon: const Icon(
                          Icons.receipt_long_outlined,
                          color: Color(0xFF64748B),
                        ),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFE2E8F0),
                          ),
                        ),
                      ),
                      items: _kategoriBelanja
                          .map(
                            (k) => DropdownMenuItem<int>(
                              value: (k['kategori_belanja_id'] ?? k['id']) as int,
                              child: Text(
                                k['nama_kategori'] ?? k['nama'] ?? k['nama_kategori_belanja'] ?? '-',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (val) => setState(
                        () => r['kategori_belanja_id'] =
                            val ?? r['kategori_belanja_id'],
                      ),
                    ),
                  ],
                ],
              ),
            );
          }),

          TextButton.icon(
            onPressed: () => setState(() {
              _rabItems.add({
                'uraian': TextEditingController(),
                'volume1': TextEditingController(),
                'harga_satuan': TextEditingController(),
                'kategori_belanja_id': _kategoriBelanja.isNotEmpty
                    ? _kategoriBelanja[0]['kategori_belanja_id'] as int
                    : 1,
              });
            }),
            icon: const Icon(Icons.add, color: Color(0xFF33C8DA)),
            label: const Text(
              'Tambah Item RAB',
              style: TextStyle(
                color: Color(0xFF33C8DA),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(
    TextEditingController ctrl,
    String label,
    IconData icon, {
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: ctrl,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        hintText: label,
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
        filled: true,
        fillColor: Colors.white,
        prefixIcon: Icon(icon, color: const Color(0xFF64748B)),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
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
    );
  }

  Widget _buildDatePicker(String label, DateTime? value, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: value != null
                ? const Color(0xFF33C8DA)
                : const Color(0xFFE2E8F0),
          ),
        ),
        child: Row(
          children: [
            Icon(
              Icons.calendar_month_outlined,
              size: 18,
              color: value != null
                  ? const Color(0xFF33C8DA)
                  : const Color(0xFF94A3B8),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                value != null ? _fmtDate(value) : label,
                style: TextStyle(
                  color: value != null
                      ? const Color(0xFF334155)
                      : const Color(0xFF94A3B8),
                  fontSize: 13,
                  fontWeight: value != null
                      ? FontWeight.w600
                      : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
