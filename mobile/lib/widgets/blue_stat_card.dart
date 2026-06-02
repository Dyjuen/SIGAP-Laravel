import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BlueStatCard extends StatelessWidget {
  final Color bg;
  final String label;
  final Color textColor;
  final String value;
  final IconData? customIcon;
  final Color? customIconColor;

  const BlueStatCard({
    super.key,
    this.bg = Colors.white,
    this.label = 'KEGIATAN',
    this.textColor = const Color(0xFF1F2937),
    this.value = '12',
    this.customIcon,
    this.customIconColor,
  });

  @override
  Widget build(BuildContext context) {
    final cleanLabel = label.toUpperCase();
    
    // 1. Determine Icon
    IconData icon = customIcon ?? Icons.assignment_rounded;
    if (customIcon == null) {
      if (cleanLabel.contains('SELESAI') || cleanLabel.contains('APPROVED') || cleanLabel.contains('DISETUJUI')) {
        icon = Icons.check_circle_rounded;
      } else if (cleanLabel.contains('PENDING') || cleanLabel.contains('REVIEW') || cleanLabel.contains('MENUNGGU')) {
        icon = Icons.pending_actions_rounded;
      } else if (cleanLabel.contains('DRAFT')) {
        icon = Icons.insert_drive_file_outlined;
      } else if (cleanLabel.contains('DANA') || cleanLabel.contains('ANGGARAN') || cleanLabel.contains('CAIR') || cleanLabel.contains('USUL')) {
        icon = Icons.payments_outlined;
      } else if (cleanLabel.contains('REJECT') || cleanLabel.contains('DITOLAK') || cleanLabel.contains('TOLAK') || cleanLabel.contains('REVISI')) {
        icon = Icons.cancel_rounded;
      }
    }

    // 2. Determine Theme Colors dynamically
    Color iconColor = customIconColor ?? const Color(0xFF33C8DA);
    Color tintColor = const Color(0xFF33C8DA).withOpacity(0.1);
    Color dynamicTextColor = textColor;

    if (customIconColor == null) {
      if (cleanLabel.contains('SELESAI') || cleanLabel.contains('APPROVED') || cleanLabel.contains('DISETUJUI')) {
        iconColor = const Color(0xFF10B981); // Emerald 500
        tintColor = const Color(0xFFE6F4EA);
      } else if (cleanLabel.contains('PENDING') || cleanLabel.contains('REVIEW') || cleanLabel.contains('MENUNGGU')) {
        iconColor = const Color(0xFFF59E0B); // Amber 500
        tintColor = const Color(0xFFFEF3C7);
      } else if (cleanLabel.contains('REJECT') || cleanLabel.contains('DITOLAK') || cleanLabel.contains('TOLAK') || cleanLabel.contains('REVISI')) {
        iconColor = const Color(0xFFEF4444); // Red 500
        tintColor = const Color(0xFFFEE2E2);
      } else if (cleanLabel.contains('DRAFT')) {
        iconColor = const Color(0xFF64748B); // Slate 500
        tintColor = const Color(0xFFF1F5F9);
      } else if (cleanLabel.contains('DANA') || cleanLabel.contains('ANGGARAN') || cleanLabel.contains('CAIR') || cleanLabel.contains('USUL')) {
        iconColor = const Color(0xFF6366F1); // Indigo 500
        tintColor = const Color(0xFFEEF2FF);
      }
    }

    // Handle when card is fully colored (not white)
    final bool isColoredBg = bg != Colors.white && bg != const Color(0xFFFFFFFF);
    final Color displayBg = bg;
    final Color displayTextColor = isColoredBg ? Colors.white : dynamicTextColor;
    final Color displayLabelColor = isColoredBg ? Colors.white.withOpacity(0.8) : const Color(0xFF6B7280);
    final Color displayIconColor = isColoredBg ? Colors.white : iconColor;
    final Color displayIconBg = isColoredBg ? Colors.white.withOpacity(0.2) : tintColor;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: displayBg,
        borderRadius: BorderRadius.circular(16),
        border: isColoredBg ? null : Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: isColoredBg 
                ? displayBg.withOpacity(0.2) 
                : const Color(0xFF0F172A).withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: displayIconBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: displayIconColor,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  value,
                  style: GoogleFonts.figtree(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: displayTextColor,
                    height: 1.1,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: GoogleFonts.figtree(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: displayLabelColor,
                    letterSpacing: 0.5,
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
