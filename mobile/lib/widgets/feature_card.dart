import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class FeatureCardWidget extends StatelessWidget {
  const FeatureCardWidget({
    super.key,
    required this.title,
    required this.desc,
    required this.icon,
  });

  final String title;
  final String desc;
  final Widget icon;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: colorScheme.surface.withOpacity(0.8),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.transparent, width: 1),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                alignment: Alignment.center,
                child: icon,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: GoogleFonts.figtree(
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                  color: colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                desc,
                maxLines: 3,
                style: GoogleFonts.figtree(
                  fontSize: 13,
                  color: Colors.grey[600],
                  height: 1.4,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
