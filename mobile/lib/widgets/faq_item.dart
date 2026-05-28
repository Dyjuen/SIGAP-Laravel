import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class FaqItemWidget extends StatelessWidget {
  const FaqItemWidget({
    super.key,
    required this.question,
    required this.answer,
    required this.isExpanded,
    required this.onTap,
  });

  final String question;
  final String answer;
  final bool isExpanded;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isExpanded ? colorScheme.primary : Colors.grey.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        question,
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: colorScheme.onSurface,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Icon(
                      isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                      color: isExpanded ? colorScheme.primary : Colors.grey[600],
                      size: 20,
                    ),
                  ],
                ),
              ),
              if (isExpanded)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Text(
                    answer,
                    style: GoogleFonts.figtree(
                      fontSize: 13,
                      color: Colors.grey[600],
                      height: 1.5,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
