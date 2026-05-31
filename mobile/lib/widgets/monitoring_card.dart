import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MonitoringCardWidget extends StatelessWidget {
  const MonitoringCardWidget({
    super.key,
    required this.date,
    required this.idText,
    required this.pic,
    required this.status,
    required this.statusBg,
    required this.statusColor,
    required this.title,
    this.onDetailTap,
    this.onTrackTap,
  });

  final String date;
  final String idText;
  final String pic;
  final String status;
  final Color statusBg;
  final Color statusColor;
  final String title;
  final VoidCallback? onDetailTap;
  final VoidCallback? onTrackTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Container(
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: colorScheme.outline, width: 1),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          maxLines: 1,
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: colorScheme.onSurface,
                            height: 1.35,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          idText,
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w400,
                            fontSize: 12,
                            color: colorScheme.onSurfaceVariant,
                            height: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: statusBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: Text(
                      status,
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: statusColor,
                        height: 1.2,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Divider(height: 0, thickness: 1, color: colorScheme.outline),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tanggal Tahap',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w400,
                            fontSize: 12,
                            color: colorScheme.onSurfaceVariant,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          date,
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w500,
                            fontSize: 14,
                            color: colorScheme.onSurface,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Tahap Saat Ini',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w400,
                            fontSize: 12,
                            color: colorScheme.onSurfaceVariant,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          pic,
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w500,
                            fontSize: 14,
                            color: colorScheme.onSurface,
                            height: 1.4,
                          ),
                          textAlign: TextAlign.end,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onDetailTap,
                      child: Text(
                        'Lihat Detail',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                          color: colorScheme.primary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: onTrackTap,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.timeline_rounded, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'Lacak',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w500,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
