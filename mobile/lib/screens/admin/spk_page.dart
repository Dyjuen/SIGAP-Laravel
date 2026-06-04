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
  Map<String, dynamic> _spkConfig = {};
  List<dynamic> _kegiatans = [];
  Map<String, dynamic> _statistics = {};

  @override
  void initState() {
    super.initState();
    _loadSpkData();
  }

  Future<void> _loadSpkData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await ApiService.get('/admin/spk');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          _spkConfig = data['spk_config'] ?? {};
          _kegiatans = data['kegiatans'] ?? [];
          _statistics = data['statistics'] ?? {};
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

  Color _getKategoriColor(String? kategori) {
    switch (kategori) {
      case 'Sangat Baik':
        return const Color(0xFF10B981); // Green
      case 'Baik':
        return const Color(0xFF3B82F6); // Blue
      case 'Cukup':
        return const Color(0xFFF59E0B); // Amber
      default:
        return const Color(0xFFEF4444); // Red
    }
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.15), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.figtree(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeightIndicator(String label, int weight, Color color) {
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
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
            Text(
              '$weight%',
              style: GoogleFonts.figtree(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: weight / 100,
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
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Evaluasi SPK',
          style: GoogleFonts.figtree(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.textPrimary, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: const Color(0xFFE2E8F0),
            height: 1.0,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primary),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadSpkData,
              color: AppTheme.primary,
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  // Overview Stats
                  Text(
                    'Statistik Evaluasi',
                    style: AppTheme.subheading,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _buildStatItem(
                          'Rata-rata Skor',
                          '${_statistics['average_score'] ?? 0}',
                          const Color(0xFF3B82F6),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildStatItem(
                          'Total Dievaluasi',
                          '${_statistics['total_evaluated'] ?? 0} Kegiatan',
                          const Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // Weights Config
                  Text(
                    'Konfigurasi Bobot SPK',
                    style: AppTheme.subheading,
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.cardDecoration,
                    child: Column(
                      children: [
                        _buildWeightIndicator(
                          'Kesesuaian Waktu',
                          _spkConfig['weight_waktu'] ?? 0,
                          const Color(0xFF3B82F6),
                        ),
                        const SizedBox(height: 16),
                        _buildWeightIndicator(
                          'Ketepatan Anggaran',
                          _spkConfig['weight_anggaran'] ?? 0,
                          const Color(0xFF10B981),
                        ),
                        const SizedBox(height: 16),
                        _buildWeightIndicator(
                          'Kesesuaian Output',
                          _spkConfig['weight_output'] ?? 0,
                          const Color(0xFF6366F1),
                        ),
                        const SizedBox(height: 16),
                        _buildWeightIndicator(
                          'Ketepatan LPJ',
                          _spkConfig['weight_lpj'] ?? 0,
                          const Color(0xFFF59E0B),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Activities Ranking
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Peringkat Evaluasi Kegiatan',
                        style: AppTheme.subheading,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'SPK Active',
                          style: GoogleFonts.figtree(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  if (_kegiatans.isEmpty)
                    Container(
                      height: 180,
                      decoration: AppTheme.cardDecoration,
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.bar_chart_rounded,
                            size: 48,
                            color: AppTheme.textTertiary.withValues(alpha: 0.5),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Belum ada kegiatan yang dievaluasi.',
                            style: GoogleFonts.figtree(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Evaluasi otomatis berjalan ketika LPJ diserahkan.',
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              color: AppTheme.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _kegiatans.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = _kegiatans[index];
                        final scoreColor = _getKategoriColor(item['kategori']);

                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: AppTheme.cardDecoration,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    radius: 14,
                                    backgroundColor: AppTheme.primaryLight,
                                    child: Text(
                                      '${index + 1}',
                                      style: GoogleFonts.figtree(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.primary,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item['nama_kegiatan'] ?? '-',
                                          style: GoogleFonts.figtree(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.textPrimary,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Pengusul: ${item['pengusul'] ?? '-'}',
                                          style: GoogleFonts.figtree(
                                            fontSize: 12,
                                            color: AppTheme.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 24, color: AppTheme.border),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Skor Akhir SPK',
                                        style: GoogleFonts.figtree(
                                          fontSize: 11,
                                          color: AppTheme.textTertiary,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${item['total_score'] ?? 0}',
                                        style: GoogleFonts.figtree(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w900,
                                          color: scoreColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: scoreColor.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: scoreColor.withValues(alpha: 0.2), width: 1),
                                    ),
                                    child: Text(
                                      item['kategori'] ?? '-',
                                      style: GoogleFonts.figtree(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: scoreColor,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
    );
  }
}
