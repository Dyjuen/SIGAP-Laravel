import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LpjDocumentItemWidget extends StatelessWidget {
  const LpjDocumentItemWidget({
    super.key,
    this.actionIcon,
    required this.actionText,
    required this.actionVariant,
    required this.date,
    required this.files,
    required this.statusBg,
    required this.statusColor,
    required this.statusText,
    required this.title,
    this.onTap,
  });

  final Widget? actionIcon;
  final String actionText;
  final String actionVariant;
  final String date;
  final String files;
  final Color statusBg;
  final Color statusColor;
  final String statusText;
  final String title;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Icon, Title, Status
              Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      Icons.description_rounded,
                      color: Theme.of(context).primaryColor,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 1,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.figtree(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Theme.of(context).primaryTextTheme.bodyLarge?.color,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          date,
                          style: GoogleFonts.figtree(
                            fontSize: 12,
                            color: Theme.of(context).primaryTextTheme.bodySmall?.color,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusBg,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      statusText,
                      style: GoogleFonts.figtree(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: statusColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                height: 1,
                color: Theme.of(context).dividerColor,
              ),
              const SizedBox(height: 12),
              // Footer: Files, Action Button
              Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.file_copy_outlined,
                        color: Theme.of(context).primaryTextTheme.bodySmall?.color,
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        files,
                        style: GoogleFonts.figtree(
                          fontSize: 12,
                          color: Theme.of(context).primaryTextTheme.bodySmall?.color,
                        ),
                      ),
                    ],
                  ),
                  _buildActionButton(context),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(BuildContext context) {
    Color buttonColor;
    Color textColor;

    switch (actionVariant) {
      case 'primary':
        buttonColor = Theme.of(context).primaryColor;
        textColor = Colors.white;
        break;
      case 'destructive':
        buttonColor = Colors.red;
        textColor = Colors.white;
        break;
      case 'ghost':
        buttonColor = Colors.transparent;
        textColor = Theme.of(context).primaryColor;
        break;
      default: // outline
        buttonColor = Colors.transparent;
        textColor = Theme.of(context).primaryColor;
    }

    final hasBorder = actionVariant == 'outline';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: buttonColor,
          borderRadius: BorderRadius.circular(8),
          border: hasBorder
              ? Border.all(
                  color: Theme.of(context).primaryColor,
                  width: 1,
                )
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (actionIcon != null) ...[
              SizedBox.square(
                dimension: 16,
                child: actionIcon,
              ),
              const SizedBox(width: 4),
            ],
            Text(
              actionText,
              style: GoogleFonts.figtree(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
