import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Color Palette
  static const Color primary = Color(0xFF00BCD4);
  static const Color primaryLight = Color(0xFFE0F7FA);
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE2E8F0);
  
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);

  // Card Decoration
  static BoxDecoration cardDecoration = BoxDecoration(
    color: surface,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: border),
    boxShadow: const [
      BoxShadow(
        color: Color(0x0A000000), // 4% opacity black
        blurRadius: 10,
        offset: Offset(0, 4),
      ),
    ],
  );

  // Typography
  static TextStyle displayLg = GoogleFonts.figtree(
    fontSize: 28,
    fontWeight: FontWeight.w900,
    color: textPrimary,
    letterSpacing: -0.5,
    height: 1.25,
  );

  static TextStyle heading = GoogleFonts.figtree(
    fontSize: 20,
    fontWeight: FontWeight.w900,
    color: textPrimary,
    letterSpacing: -0.2,
    height: 1.3,
  );

  static TextStyle subheading = GoogleFonts.figtree(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    color: textPrimary,
    height: 1.3,
  );

  static TextStyle body = GoogleFonts.figtree(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: textPrimary,
    height: 1.4,
  );

  static TextStyle bodyBold = GoogleFonts.figtree(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: textPrimary,
    height: 1.4,
  );

  static TextStyle caption = GoogleFonts.figtree(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: textSecondary,
    height: 1.4,
  );

  static TextStyle label = GoogleFonts.figtree(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    color: textSecondary,
    letterSpacing: 0.5,
    height: 1.2,
  );
}
