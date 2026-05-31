import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BlueStatCard extends StatelessWidget {
  final Color bg;
  final String label;
  final Color textColor;
  final String value;

  const BlueStatCard({
    super.key,
    this.bg = const Color(0xFF33C8DA),
    this.label = 'KEGIATAN',
    this.textColor = const Color(0xFF1F2937),
    this.value = '12',
  });

  @override
  Widget build(BuildContext context) {
    // Determine icon based on label loosely
    IconData icon = Icons.assignment_rounded;
    if (label.toLowerCase().contains('selesai') || label.toLowerCase().contains('terserap')) {
      icon = Icons.check_circle_outline_rounded;
    } else if (label.toLowerCase().contains('proses') || label.toLowerCase().contains('berlangsung')) {
      icon = Icons.hourglass_empty_rounded;
    } else if (label.toLowerCase().contains('dana') || label.toLowerCase().contains('anggaran')) {
      icon = Icons.payments_outlined;
    } else if (label.toLowerCase().contains('tolak') || label.toLowerCase().contains('revisi')) {
      icon = Icons.cancel_outlined;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF33C8DA).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: const Color(0xFF33C8DA), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  value,
                  style: GoogleFonts.figtree(
                    fontSize: 20, // slightly smaller so large numbers fit
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF1F2937),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  label,
                  style: GoogleFonts.figtree(
                    fontSize: 12,
                    color: const Color(0xFF6B7280),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
