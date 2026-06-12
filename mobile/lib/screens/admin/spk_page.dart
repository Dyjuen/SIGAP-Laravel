import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_theme.dart';
import '../../services/api_service.dart';

class SpkPage extends StatefulWidget {
  const SpkPage({super.key});

  @override
  State<SpkPage> createState() => _SpkPageState();
}

class _SpkPageState extends State<SpkPage> {
  bool _isLoading = true;
  bool _isSaving = false;

  // Configuration Fields matching API keys
  double _weightWaktu = 25.0;
  double _weightAnggaran = 25.0;
  double _weightOutput = 25.0;
  double _weightLpj = 25.0;

  int _waktuMin = 50;
  int _waktuMax = 100;
  int _anggaranMin = 50;
  int _anggaranMax = 100;
  int _outputMin = 0;
  int _outputMax = 100;
  int _lpjMin = 50;
  int _lpjMax = 100;
  int _lpjPenaltyPerDay = 5;

  List<dynamic> _kegiatans = [];
  List<dynamic> _filteredKegiatans = [];
  Map<String, dynamic> _statistics = {};
  int _currentPage = 1;
  static const int _itemsPerPage = 5; // Smaller page size is much better on mobile screen!

  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSpkData();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadSpkData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await ApiService.get('/admin/spk');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final config = data['spk_config'] ?? {};
        setState(() {
          _weightWaktu = (config['weight_waktu'] ?? 25.0).toDouble();
          _weightAnggaran = (config['weight_anggaran'] ?? 25.0).toDouble();
          _weightOutput = (config['weight_output'] ?? 25.0).toDouble();
          _weightLpj = (config['weight_lpj'] ?? 25.0).toDouble();

          _waktuMin = config['waktu_min'] ?? 50;
          _waktuMax = config['waktu_max'] ?? 100;
          _anggaranMin = config['anggaran_min'] ?? 50;
          _anggaranMax = config['anggaran_max'] ?? 100;
          _outputMin = config['output_min'] ?? 0;
          _outputMax = config['output_max'] ?? 100;
          _lpjMin = config['lpj_min'] ?? 50;
          _lpjMax = config['lpj_max'] ?? 100;
          _lpjPenaltyPerDay = config['lpj_penalty_per_day'] ?? 5;

          _kegiatans = data['kegiatans'] ?? [];
          _filteredKegiatans = List.from(_kegiatans);
          _statistics = data['statistics'] ?? {};
          _currentPage = 1;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _currentPage = 1;
      if (query.isEmpty) {
        _filteredKegiatans = List.from(_kegiatans);
      } else {
        _filteredKegiatans = _kegiatans.where((k) {
          final title = (k['nama_kegiatan'] ?? '').toString().toLowerCase();
          final user = (k['pengusul'] ?? '').toString().toLowerCase();
          final cat = (k['kategori'] ?? '').toString().toLowerCase();
          return title.contains(query) || user.contains(query) || cat.contains(query);
        }).toList();
      }
    });
  }

  double get _totalWeight => _weightWaktu + _weightAnggaran + _weightOutput + _weightLpj;
  bool get _isSumValid => (_totalWeight - 100.0).abs() < 0.001;

  bool get _areBoundsValid {
    return _waktuMax > _waktuMin &&
        _anggaranMax > _anggaranMin &&
        _outputMax > _outputMin &&
        _lpjMax > _lpjMin;
  }

  Future<void> _saveConfig() async {
    if (!_isSumValid) {
      _showSnackbar('Jumlah bobot kriteria harus tepat bernilai 100%.', Colors.red);
      return;
    }
    if (!_areBoundsValid) {
      _showSnackbar('Batas maksimum nilai kriteria harus lebih besar dari batas minimum.', Colors.red);
      return;
    }

    setState(() {
      _isSaving = true;
    });

    final payload = {
      'weight_waktu': _weightWaktu.toInt(),
      'weight_anggaran': _weightAnggaran.toInt(),
      'weight_output': _weightOutput.toInt(),
      'weight_lpj': _weightLpj.toInt(),
      'waktu_min': _waktuMin,
      'waktu_max': _waktuMax,
      'anggaran_min': _anggaranMin,
      'anggaran_max': _anggaranMax,
      'output_min': _outputMin,
      'output_max': _outputMax,
      'lpj_min': _lpjMin,
      'lpj_max': _lpjMax,
      'lpj_penalty_per_day': _lpjPenaltyPerDay,
    };

    try {
      final res = await ApiService.post('/admin/spk/config', payload);
      setState(() {
        _isSaving = false;
      });

      if (res.statusCode == 200) {
        _showSnackbar('Konfigurasi parameter SPK berhasil diperbarui.', const Color(0xFF33C8DA));
        _loadSpkData(); // Reload stats and recalculations
      } else {
        final data = jsonDecode(res.body);
        _showSnackbar(data['message'] ?? 'Gagal menyimpan konfigurasi.', Colors.red);
      }
    } catch (e) {
      setState(() {
        _isSaving = false;
      });
      _showSnackbar('Terjadi kesalahan koneksi.', Colors.red);
    }
  }

  void _showSnackbar(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: GoogleFonts.figtree(fontWeight: FontWeight.w600)),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Color _getKategoriColor(String? kategori) {
    switch (kategori) {
      case 'Sangat Baik':
        return const Color(0xFF10B981); // Emerald
      case 'Baik':
        return const Color(0xFF33C8DA); // Cyan Theme
      case 'Cukup':
        return const Color(0xFFF59E0B); // Amber
      default:
        return const Color(0xFFEF4444); // Red/Rose
    }
  }

  Widget _buildStatCard({
    required String title,
    required String label,
    required String value,
    required bool isCyan,
  }) {
    return Container(
      height: 140,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isCyan ? const Color(0xFF33C8DA) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: isCyan ? null : Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title.toUpperCase(),
                    style: GoogleFonts.figtree(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                      color: isCyan ? Colors.white.withValues(alpha: 0.85) : const Color(0xFF33C8DA),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.figtree(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: isCyan ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
              Text(
                value,
                style: GoogleFonts.figtree(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: isCyan ? Colors.white : const Color(0xFF33C8DA),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSliderInput({
    required String label,
    required double value,
    required ValueChanged<double> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: GoogleFonts.figtree(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF475569),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF33C8DA).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${value.toInt()}%',
                style: GoogleFonts.figtree(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF2BA9B8),
                ),
              ),
            ),
          ],
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: const Color(0xFF33C8DA),
            inactiveTrackColor: const Color(0xFFF1F5F9),
            thumbColor: const Color(0xFF2BA9B8),
            overlayColor: const Color(0xFF33C8DA).withValues(alpha: 0.12),
            trackHeight: 4,
          ),
          child: Slider(
            value: value,
            min: 0,
            max: 100,
            divisions: 100,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }

  Widget _buildBoundCard({
    required String title,
    required int minVal,
    required int maxVal,
    required ValueChanged<int> onMinChanged,
    required ValueChanged<int> onMaxChanged,
    int? penaltyVal,
    ValueChanged<int>? onPenaltyChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.figtree(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF334155),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MIN NILAI',
                      style: GoogleFonts.figtree(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF94A3B8),
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 4),
                    SizedBox(
                      height: 40,
                      child: TextField(
                        keyboardType: TextInputType.number,
                        style: GoogleFonts.figtree(fontSize: 13, fontWeight: FontWeight.bold),
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        controller: TextEditingController(text: minVal.toString())
                          ..selection = TextSelection.collapsed(offset: minVal.toString().length),
                        onChanged: (val) {
                          final parsed = int.tryParse(val) ?? 0;
                          onMinChanged(parsed);
                        },
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MAX NILAI',
                      style: GoogleFonts.figtree(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF94A3B8),
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 4),
                    SizedBox(
                      height: 40,
                      child: TextField(
                        keyboardType: TextInputType.number,
                        style: GoogleFonts.figtree(fontSize: 13, fontWeight: FontWeight.bold),
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        controller: TextEditingController(text: maxVal.toString())
                          ..selection = TextSelection.collapsed(offset: maxVal.toString().length),
                        onChanged: (val) {
                          final parsed = int.tryParse(val) ?? 0;
                          onMaxChanged(parsed);
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (penaltyVal != null && onPenaltyChanged != null) ...[
            const SizedBox(height: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'DENDA / HARI TERLAMBAT',
                  style: GoogleFonts.figtree(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF94A3B8),
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 4),
                SizedBox(
                  height: 40,
                  child: TextField(
                    keyboardType: TextInputType.number,
                    style: GoogleFonts.figtree(fontSize: 13, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    controller: TextEditingController(text: penaltyVal.toString())
                      ..selection = TextSelection.collapsed(offset: penaltyVal.toString().length),
                    onChanged: (val) {
                      final parsed = int.tryParse(val) ?? 0;
                      onPenaltyChanged(parsed);
                    },
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPredikatBar({
    required String name,
    required Color color,
    required int count,
    required double percentage,
  }) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Text(
                  name,
                  style: GoogleFonts.figtree(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF475569),
                  ),
                ),
              ],
            ),
            Text(
              '$count (${percentage.toStringAsFixed(0)}%)',
              style: GoogleFonts.figtree(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF475569),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: percentage / 100.0,
            backgroundColor: const Color(0xFFF1F5F9),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    // Total evaluated calculation helper
    final totalEval = _statistics['total_evaluated'] ?? 0;

    // Highest and Lowest details
    final highestName = _statistics['highest_kegiatan']?['nama_kegiatan'] ?? 'Tidak ada data';
    final highestScore = _statistics['highest_kegiatan']?['score'] ?? 0.0;
    final lowestName = _statistics['lowest_kegiatan']?['nama_kegiatan'] ?? 'Tidak ada data';
    final lowestScore = _statistics['lowest_kegiatan']?['score'] ?? 0.0;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Evaluasi & Parameter SPK',
          style: GoogleFonts.figtree(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF33C8DA)))
          : RefreshIndicator(
              onRefresh: _loadSpkData,
              color: const Color(0xFF33C8DA),
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                children: [
                  // 1. STATS GRID
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 1.25,
                    children: [
                      _buildStatCard(
                        title: 'SKOR INSTANSI',
                        label: 'Rata-Rata Skor',
                        value: '${_statistics['average_score'] ?? 0.0}',
                        isCyan: true,
                      ),
                      _buildStatCard(
                        title: 'EVALUASI',
                        label: 'Total Dievaluasi',
                        value: '$totalEval',
                        isCyan: false,
                      ),
                      _buildStatCard(
                        title: 'Kinerja Tertinggi',
                        label: highestName,
                        value: '$highestScore',
                        isCyan: false,
                      ),
                      _buildStatCard(
                        title: 'Kinerja Terendah',
                        label: lowestName,
                        value: '$lowestScore',
                        isCyan: false,
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // 2. CONFIGURATION FORM CARD
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Pengaturan Kriteria SPK',
                                  style: GoogleFonts.figtree(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: const Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Tentukan bobot kriteria (wajib 100%)',
                                  style: GoogleFonts.figtree(
                                    fontSize: 11,
                                    color: const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: _isSumValid
                                    ? const Color(0xFF10B981).withValues(alpha: 0.1)
                                    : const Color(0xFFEF4444).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: _isSumValid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                'TOTAL: ${_totalWeight.toInt()}%',
                                style: GoogleFonts.figtree(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w900,
                                  color: _isSumValid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 32, color: Color(0xFFF1F5F9)),

                        // Weight Sliders
                        _buildSliderInput(
                          label: 'Kesesuaian Waktu Pelaksanaan',
                          value: _weightWaktu,
                          onChanged: (val) => setState(() => _weightWaktu = val),
                        ),
                        const SizedBox(height: 14),
                        _buildSliderInput(
                          label: 'Ketepatan Penggunaan Anggaran',
                          value: _weightAnggaran,
                          onChanged: (val) => setState(() => _weightAnggaran = val),
                        ),
                        const SizedBox(height: 14),
                        _buildSliderInput(
                          label: 'Kesesuaian Target Output (IKU)',
                          value: _weightOutput,
                          onChanged: (val) => setState(() => _weightOutput = val),
                        ),
                        const SizedBox(height: 14),
                        _buildSliderInput(
                          label: 'Ketepatan Penyampaian LPJ',
                          value: _weightLpj,
                          onChanged: (val) => setState(() => _weightLpj = val),
                        ),

                        const SizedBox(height: 24),
                        Text(
                          'Batasan Konstrain Nilai Kriteria',
                          style: GoogleFonts.figtree(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Columns of Bounds (vertically stacked for premium clean mobile layout)
                        Column(
                          children: [
                            _buildBoundCard(
                              title: 'Kesesuaian Waktu',
                              minVal: _waktuMin,
                              maxVal: _waktuMax,
                              onMinChanged: (val) => setState(() => _waktuMin = val),
                              onMaxChanged: (val) => setState(() => _waktuMax = val),
                            ),
                            const SizedBox(height: 12),
                            _buildBoundCard(
                              title: 'Ketepatan Anggaran',
                              minVal: _anggaranMin,
                              maxVal: _anggaranMax,
                              onMinChanged: (val) => setState(() => _anggaranMin = val),
                              onMaxChanged: (val) => setState(() => _anggaranMax = val),
                            ),
                            const SizedBox(height: 12),
                            _buildBoundCard(
                              title: 'Kesesuaian Output',
                              minVal: _outputMin,
                              maxVal: _outputMax,
                              onMinChanged: (val) => setState(() => _outputMin = val),
                              onMaxChanged: (val) => setState(() => _outputMax = val),
                            ),
                            const SizedBox(height: 12),
                            _buildBoundCard(
                              title: 'Ketepatan LPJ',
                              minVal: _lpjMin,
                              maxVal: _lpjMax,
                              onMinChanged: (val) => setState(() => _lpjMin = val),
                              onMaxChanged: (val) => setState(() => _lpjMax = val),
                              penaltyVal: _lpjPenaltyPerDay,
                              onPenaltyChanged: (val) => setState(() => _lpjPenaltyPerDay = val),
                            ),
                          ],
                        ),

                        // Form validations warnings
                        if (!_areBoundsValid) ...[
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Icon(Icons.error_outline_rounded, size: 16, color: Color(0xFFEF4444)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Batas maksimum nilai kriteria harus lebih besar dari batas minimum.',
                                  style: GoogleFonts.figtree(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFFEF4444),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],

                        const Divider(height: 40, color: Color(0xFFF1F5F9)),

                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: (_isSaving || !_isSumValid || !_areBoundsValid) ? null : _saveConfig,
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFF33C8DA),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: _isSaving
                                ? const SizedBox(
                                    height: 18,
                                    width: 18,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                                  )
                                : Text(
                                    'Simpan & Terapkan Konfigurasi',
                                    style: GoogleFonts.figtree(fontWeight: FontWeight.w800, fontSize: 13),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 3. PREDIKAT DISTRIBUTION CARD
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Distribusi Predikat Kinerja',
                          style: GoogleFonts.figtree(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Persentase capaian kualitas dari seluruh kegiatan.',
                          style: GoogleFonts.figtree(fontSize: 12, color: const Color(0xFF64748B)),
                        ),
                        const Divider(height: 32, color: Color(0xFFF1F5F9)),

                        // Predikat Bars
                        _buildPredikatBar(
                          name: 'Sangat Baik (≥ 85)',
                          color: const Color(0xFF10B981),
                          count: _statistics['category_counts']?['Sangat Baik'] ?? 0,
                          percentage: totalEval > 0
                              ? ((_statistics['category_counts']?['Sangat Baik'] ?? 0) / totalEval) * 100
                              : 0.0,
                        ),
                        const SizedBox(height: 16),
                        _buildPredikatBar(
                          name: 'Baik (70 - 84)',
                          color: const Color(0xFF33C8DA),
                          count: _statistics['category_counts']?['Baik'] ?? 0,
                          percentage: totalEval > 0
                              ? ((_statistics['category_counts']?['Baik'] ?? 0) / totalEval) * 100
                              : 0.0,
                        ),
                        const SizedBox(height: 16),
                        _buildPredikatBar(
                          name: 'Cukup (55 - 69)',
                          color: const Color(0xFFF59E0B),
                          count: _statistics['category_counts']?['Cukup'] ?? 0,
                          percentage: totalEval > 0
                              ? ((_statistics['category_counts']?['Cukup'] ?? 0) / totalEval) * 100
                              : 0.0,
                        ),
                        const SizedBox(height: 16),
                        _buildPredikatBar(
                          name: 'Kurang (< 55)',
                          color: const Color(0xFFEF4444),
                          count: _statistics['category_counts']?['Kurang'] ?? 0,
                          percentage: totalEval > 0
                              ? ((_statistics['category_counts']?['Kurang'] ?? 0) / totalEval) * 100
                              : 0.0,
                        ),

                        // SAW Explanatory box
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF33C8DA).withValues(alpha: 0.06),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFF33C8DA).withValues(alpha: 0.15)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Formula Penilaian Kinerja SPK (SAW)',
                                style: GoogleFonts.figtree(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF2BA9B8),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Metode Simple Additive Weighting (SAW) menjumlahkan bobot kriteria Cj dikalikan nilai ternormalisasi dari masing-masing kriteria:',
                                style: GoogleFonts.figtree(
                                  fontSize: 11,
                                  color: const Color(0xFF475569),
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Container(
                                alignment: Alignment.center,
                                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: Text(
                                  'Skor Akhir = C₁w₁ + C₂w₂ + C₃w₃ + C₄w₄',
                                  style: GoogleFonts.figtree(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                    color: const Color(0xFF33C8DA),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Dimana: C₁=Waktu, C₂=Anggaran, C₃=Output IKU, C₄=LPJ',
                                style: GoogleFonts.figtree(
                                  fontSize: 10,
                                  color: const Color(0xFF64748B),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 4. RESULTS TABLE CARD
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hasil Evaluasi Kinerja Kegiatan',
                          style: GoogleFonts.figtree(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Daftar kegiatan dengan LPJ masuk beserta detail nilai kriteria.',
                          style: GoogleFonts.figtree(fontSize: 12, color: const Color(0xFF64748B)),
                        ),
                        const Divider(height: 24, color: Color(0xFFF1F5F9)),

                        // SEARCH BAR
                        TextField(
                          controller: _searchController,
                          style: GoogleFonts.figtree(fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'Cari kegiatan, pengusul, atau kategori...',
                            prefixIcon: const Icon(Icons.search_rounded, size: 20),
                            contentPadding: const EdgeInsets.symmetric(vertical: 10),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Table data
                        if (_filteredKegiatans.isEmpty)
                          Container(
                            height: 150,
                            alignment: Alignment.center,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.insert_drive_file_outlined, size: 36, color: Color(0xFF94A3B8)),
                                const SizedBox(height: 12),
                                Text(
                                  'Tidak ada data evaluasi kegiatan.',
                                  style: GoogleFonts.figtree(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          )
                        else ...[
                          Builder(
                            builder: (context) {
                              final totalPages = (_filteredKegiatans.length / _itemsPerPage).ceil();
                              final startIndex = (_currentPage - 1) * _itemsPerPage;
                              final endIndex = startIndex + _itemsPerPage;
                              final currentItems = _filteredKegiatans.skip(startIndex).take(_itemsPerPage).toList();

                              return Column(
                                children: [
                                  ListView.separated(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: currentItems.length,
                                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                                    itemBuilder: (context, index) {
                                      final item = currentItems[index];
                                      final kColor = _getKategoriColor(item['kategori']);

                                      return Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF8FAFC),
                                          borderRadius: BorderRadius.circular(16),
                                          border: Border.all(color: const Color(0xFFE2E8F0)),
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                CircleAvatar(
                                                  radius: 12,
                                                  backgroundColor: const Color(0xFF33C8DA).withValues(alpha: 0.1),
                                                  child: Text(
                                                    '${startIndex + index + 1}',
                                                    style: GoogleFonts.figtree(
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.bold,
                                                      color: const Color(0xFF33C8DA),
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: 10),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        item['nama_kegiatan'] ?? '-',
                                                        style: GoogleFonts.figtree(
                                                          fontSize: 14,
                                                          fontWeight: FontWeight.bold,
                                                          color: const Color(0xFF0F172A),
                                                        ),
                                                      ),
                                                      const SizedBox(height: 3),
                                                      Text(
                                                        'Pengusul: ${item['pengusul'] ?? '-'}',
                                                        style: GoogleFonts.figtree(
                                                          fontSize: 11,
                                                          fontWeight: FontWeight.bold,
                                                          color: const Color(0xFF64748B),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const Divider(height: 20, color: Color(0xFFE2E8F0)),
                                            // Row of criteria scores
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                _buildCriteriaScore('WAKTU', '${item['waktu_score'] ?? 0}'),
                                                _buildCriteriaScore('ANGGARAN', '${item['anggaran_score'] ?? 0}'),
                                                _buildCriteriaScore('OUTPUT', '${item['output_score'] ?? 0}'),
                                                _buildCriteriaScore('LPJ', '${item['lpj_score'] ?? 0}'),
                                              ],
                                            ),
                                            const Divider(height: 20, color: Color(0xFFE2E8F0)),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      'Skor Akhir',
                                                      style: GoogleFonts.figtree(
                                                        fontSize: 10,
                                                        color: const Color(0xFF94A3B8),
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 2),
                                                    Text(
                                                      '${item['total_score'] ?? 0.0}',
                                                      style: GoogleFonts.figtree(
                                                        fontSize: 16,
                                                        fontWeight: FontWeight.w900,
                                                        color: const Color(0xFF2BA9B8),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                                  decoration: BoxDecoration(
                                                    color: kColor.withValues(alpha: 0.1),
                                                    borderRadius: BorderRadius.circular(8),
                                                    border: Border.all(color: kColor.withValues(alpha: 0.2)),
                                                  ),
                                                  child: Text(
                                                    item['kategori'] ?? '-',
                                                    style: GoogleFonts.figtree(
                                                      fontSize: 11,
                                                      fontWeight: FontWeight.w900,
                                                      color: kColor,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              'LPJ Masuk: ${item['lpj_submitted_at'] ?? '-'}',
                                              style: GoogleFonts.figtree(
                                                fontSize: 10,
                                                color: const Color(0xFF94A3B8),
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                                  const SizedBox(height: 20),
                                  // Pagination Footer controls matching custom style
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Menampilkan ${startIndex + 1} - ${endIndex < _filteredKegiatans.length ? endIndex : _filteredKegiatans.length} dari ${_filteredKegiatans.length}',
                                        style: GoogleFonts.figtree(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: const Color(0xFF64748B),
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.arrow_left_rounded, size: 28),
                                            color: const Color(0xFF33C8DA),
                                            onPressed: _currentPage > 1
                                                ? () => setState(() => _currentPage--)
                                                : null,
                                          ),
                                          Text(
                                            '$_currentPage / $totalPages',
                                            style: GoogleFonts.figtree(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w900,
                                              color: const Color(0xFF0F172A),
                                            ),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.arrow_right_rounded, size: 28),
                                            color: const Color(0xFF33C8DA),
                                            onPressed: _currentPage < totalPages
                                                ? () => setState(() => _currentPage++)
                                                : null,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              );
                            }
                          )
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildCriteriaScore(String label, String score) {
    return Column(
      children: [
        Text(
          label,
          style: GoogleFonts.figtree(
            fontSize: 9,
            fontWeight: FontWeight.w900,
            color: const Color(0xFF94A3B8),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          score,
          style: GoogleFonts.figtree(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF475569),
          ),
        ),
      ],
    );
  }
}
