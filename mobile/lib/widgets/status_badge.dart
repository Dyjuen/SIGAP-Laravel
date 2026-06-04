import 'package:flutter/material.dart';
import '../core/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;

    final normStatus = status.toLowerCase().trim();

    if (normStatus == 'draft') {
      bgColor = const Color(0xFFF1F5F9);
      textColor = const Color(0xFF64748B);
    } else if (normStatus == 'review' ||
        normStatus == 'diajukan' ||
        normStatus == 'review kak' ||
        normStatus == 'menunggu' ||
        normStatus == 'submitted' ||
        normStatus == 'menunggu review' ||
        normStatus == 'pending') {
      bgColor = const Color(0xFFFFFBEB);
      textColor = const Color(0xFFD97706); // amber-600
    } else if (normStatus == 'disetujui' ||
        normStatus == 'approved' ||
        normStatus == 'selesai' ||
        normStatus == 'completed' ||
        normStatus == 'aktif' ||
        normStatus == 'active' ||
        normStatus == 'success' ||
        normStatus == 'sudah cair' ||
        normStatus == 'cair') {
      bgColor = const Color(0xFFECFDF5);
      textColor = const Color(0xFF059669); // emerald-600
    } else if (normStatus == 'ditolak' ||
        normStatus == 'rejected' ||
        normStatus == 'failed' ||
        normStatus == 'batal' ||
        normStatus == 'cancelled') {
      bgColor = const Color(0xFFFEF2F2);
      textColor = const Color(0xFFDC2626); // red-600
    } else if (normStatus == 'revisi' ||
        normStatus == 'revision requested' ||
        normStatus == 'perlu revisi') {
      bgColor = const Color(0xFFFFF7ED);
      textColor = const Color(0xFFEA580C); // orange-600
    } else {
      bgColor = const Color(0xFFF1F5F9);
      textColor = const Color(0xFF475569);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: textColor.withOpacity(0.12), width: 1),
      ),
      child: Text(
        status.toUpperCase(),
        style: AppTheme.label.copyWith(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
