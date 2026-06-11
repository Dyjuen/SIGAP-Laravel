import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../../core/app_theme.dart';
import '../../../models/dashboard_model.dart';

/// Donut/Pie Chart untuk distribusi dana per unit/jurusan.
class DirektorDanaPieChart extends StatefulWidget {
  final List<JurusanData> byJurusan;
  const DirektorDanaPieChart({super.key, required this.byJurusan});

  @override
  State<DirektorDanaPieChart> createState() => _DirektorDanaPieChartState();
}

class _DirektorDanaPieChartState extends State<DirektorDanaPieChart> {
  int? _touchedIdx;

  static const _palette = [
    Color(0xFF00BCD4), // cyan primary
    Color(0xFF0097A7),
    Color(0xFF26C6DA),
    Color(0xFF80DEEA),
    Color(0xFFB2EBF2),
    Color(0xFF006064),
    Color(0xFF00838F),
    Color(0xFF4DD0E1),
  ];

  @override
  Widget build(BuildContext context) {
    final units = widget.byJurusan.where((u) => u.danaDiminta > 0).toList();

    if (units.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Container(
          height: 180,
          decoration: AppTheme.cardDecoration,
          child: const Center(
            child: Text('Belum ada data distribusi dana.', style: TextStyle(color: AppTheme.textSecondary)),
          ),
        ),
      );
    }

    final totalDana = units.fold(0.0, (sum, u) => sum + u.danaDiminta);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        decoration: AppTheme.cardDecoration,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 180,
              child: Row(
                children: [
                  // Pie chart
                  Expanded(
                    flex: 5,
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 40,
                        pieTouchData: PieTouchData(
                          touchCallback: (event, response) {
                            setState(() {
                              if (!event.isInterestedForInteractions ||
                                  response == null ||
                                  response.touchedSection == null) {
                                _touchedIdx = null;
                              } else {
                                _touchedIdx = response.touchedSection!.touchedSectionIndex;
                              }
                            });
                          },
                        ),
                        sections: units.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final unit = entry.value;
                          final isTouched = _touchedIdx == idx;
                          final color = _palette[idx % _palette.length];
                          final pct = totalDana > 0 ? unit.danaDiminta / totalDana * 100 : 0;

                          return PieChartSectionData(
                            color: color,
                            value: unit.danaDiminta,
                            title: isTouched ? '${pct.toStringAsFixed(0)}%' : '',
                            radius: isTouched ? 56 : 48,
                            titleStyle: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Legend
                  Expanded(
                    flex: 6,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: units.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final unit = entry.value;
                        final color = _palette[idx % _palette.length];
                        final pct = totalDana > 0 ? unit.danaDiminta / totalDana * 100 : 0;
                        final name = unit.namaJurusan.length > 20
                            ? '${unit.namaJurusan.substring(0, 18)}…'
                            : unit.namaJurusan;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(name,
                                    style: const TextStyle(fontSize: 9, color: AppTheme.textSecondary),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${pct.toStringAsFixed(0)}%',
                                style: const TextStyle(
                                    fontSize: 9, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
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
