import 'package:flutter/material.dart';
import '../core/app_theme.dart';
import 'status_badge.dart';

class ActivityItem extends StatelessWidget {
  final Widget? icon;
  final String status;
  final String time;
  final String title;

  const ActivityItem({
    super.key,
    this.icon,
    this.status = 'DISETUJUI',
    this.time = '2 jam yang lalu',
    this.title = 'Pengajuan KAK - Workshop AI',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.cardDecoration,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppTheme.primaryLight,
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: icon ?? const Icon(Icons.assignment, color: AppTheme.primary),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTheme.subheading.copyWith(
                      fontSize: 14,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    time,
                    style: AppTheme.caption.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            StatusBadge(status: status),
          ],
        ),
      ),
    );
  }
}
