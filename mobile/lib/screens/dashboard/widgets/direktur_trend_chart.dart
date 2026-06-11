import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../../core/app_theme.dart';
import '../../../models/dashboard_model.dart';

/// Trend Chart: Line chart untuk trend dana + bar hint untuk total kegiatan.
/// Menggunakan fl_chart LineChart dengan dual-axis visual.
class DirektorTrendChart extends StatelessWidget {
  final List<TrendData> trends;
  const DirektorTrendChart({super.key, required this.trends});

  @override
  Widget build(BuildContext context) {
    if (trends.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Container(
          height: 180,
          decoration: AppTheme.cardDecoration,
          child: const Center(
            child: Text('Belum ada data tren.', style: TextStyle(color: AppTheme.textSecondary)),
          ),
        ),
      );
    }

    final maxDana = trends.map((t) => t.danaDiminta).fold(0.0, (a, b) => a > b ? a : b);
    final maxRealisasi = trends.map((t) => t.danaTerserap).fold(0.0, (a, b) => a > b ? a : b);
    final maxY = ((maxDana > maxRealisasi ? maxDana : maxRealisasi) * 1.2).clamp(1.0, double.infinity);

    // Build spots
    final rencanaSpots = trends.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value.danaDiminta);
    }).toList();

    final realisasiSpots = trends.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value.danaTerserap);
    }).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        decoration: AppTheme.cardDecoration,
        padding: const EdgeInsets.fromLTRB(16, 16, 20, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Legend
            Row(
              children: [
                _LegendDot(color: AppTheme.primary, label: 'Dana Rencana'),
                const SizedBox(width: 16),
                _LegendDot(color: const Color(0xFF10B981), label: 'Realisasi'),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 170,
              child: LineChart(
                LineChartData(
                  minX: 0,
                  maxX: (trends.length - 1).toDouble(),
                  minY: 0,
                  maxY: maxY,
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    getDrawingHorizontalLine: (value) => FlLine(
                      color: const Color(0xFFF1F5F9),
                      strokeWidth: 1,
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 22,
                        interval: 1,
                        getTitlesWidget: (value, meta) {
                          final idx = value.toInt();
                          if (idx >= trends.length) return const SizedBox();
                          final label = trends[idx].periode;
                          final parts = label.split(' ');
                          return Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              parts.isNotEmpty ? parts[0] : label,
                              style: const TextStyle(fontSize: 9, color: AppTheme.textSecondary),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  lineTouchData: LineTouchData(
                    touchTooltipData: LineTouchTooltipData(
                      getTooltipColor: (_) => const Color(0xFF1E293B),
                      getTooltipItems: (spots) => spots.map((spot) {
                        final label = spot.barIndex == 0 ? 'Rencana' : 'Realisasi';
                        final amount = spot.y >= 1e9
                            ? '${(spot.y / 1e9).toStringAsFixed(1)}M'
                            : spot.y >= 1e6
                                ? '${(spot.y / 1e6).toStringAsFixed(1)}Jt'
                                : spot.y.toStringAsFixed(0);
                        return LineTooltipItem(
                          '$label\nRp $amount',
                          const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600),
                        );
                      }).toList(),
                    ),
                  ),
                  lineBarsData: [
                    // Dana Rencana
                    LineChartBarData(
                      spots: rencanaSpots,
                      isCurved: true,
                      curveSmoothness: 0.35,
                      color: AppTheme.primary,
                      barWidth: 2.5,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        gradient: LinearGradient(
                          colors: [AppTheme.primary.withOpacity(0.15), AppTheme.primary.withOpacity(0.0)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                    // Realisasi
                    LineChartBarData(
                      spots: realisasiSpots,
                      isCurved: true,
                      curveSmoothness: 0.35,
                      color: const Color(0xFF10B981),
                      barWidth: 2.5,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        gradient: LinearGradient(
                          colors: [const Color(0x2610B981), const Color(0x0010B981)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
