import 'package:flutter/material.dart';
import '../core/app_theme.dart';

class StatCard extends StatelessWidget {
  final String subtitle;
  final String label;
  final Object value;
  final bool isCyan;
  final VoidCallback? onTap;

  final double? width;

  const StatCard({
    super.key,
    required this.subtitle,
    required this.label,
    required this.value,
    this.isCyan = false,
    this.onTap,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final bgCol = isCyan ? AppTheme.primary : AppTheme.surface;
    final textCol = isCyan ? Colors.white : AppTheme.textPrimary;
    final subCol = isCyan ? const Color(0xFFB2EBF2) : AppTheme.primary;
    final valCol = isCyan ? Colors.white : AppTheme.primary;

    Widget card = Container(
      width: width,
      decoration: BoxDecoration(
        color: bgCol,
        borderRadius: BorderRadius.circular(16),
        border: isCyan ? null : Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: isCyan
                ? AppTheme.primary.withValues(alpha: 0.18)
                : Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    subtitle.toUpperCase(),
                    style: AppTheme.label.copyWith(
                      color: subCol,
                      fontSize: 8,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    label,
                    style: AppTheme.subheading.copyWith(
                      color: textCol,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '$value',
              style: AppTheme.displayLg.copyWith(
                color: valCol,
                fontSize: 22,
                fontWeight: FontWeight.w900,
                height: 1.0,
              ),
            ),
          ],
        ),
      ),
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: card,
      );
    }
    return card;
  }
}
