import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LpjStatusCardWidget extends StatelessWidget {
  const LpjStatusCardWidget({
    super.key,
    required this.bg,
    required this.label,
    required this.textColor,
    required this.value,
  });

  final Color bg;
  final String label;
  final Color textColor;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: bg,
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
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              value,
              style: GoogleFonts.figtree(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: textColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
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
