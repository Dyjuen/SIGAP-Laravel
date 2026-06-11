import 'package:flutter/material.dart';
import '../../../core/app_theme.dart';

/// Hero KPI Card untuk Dashboard Direktur.
/// Dua gaya: primary (gradient cyan) dan secondary (white with cyan accent).
class DirektorKpiCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool isPrimary;

  const DirektorKpiCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.isPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: isPrimary
            ? const LinearGradient(
                colors: [Color(0xFF00BCD4), Color(0xFF0097A7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isPrimary ? null : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: isPrimary ? null : Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: isPrimary
                ? const Color(0xFF00BCD4).withOpacity(0.28)
                : Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: isPrimary ? Colors.white.withOpacity(0.22) : AppTheme.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: isPrimary ? Colors.white : AppTheme.primary, size: 18),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTheme.heading.copyWith(
              color: isPrimary ? Colors.white : AppTheme.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTheme.caption.copyWith(
              color: isPrimary ? Colors.white70 : AppTheme.textSecondary,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
