import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class PlaceholderPage extends StatelessWidget {
  final String title;

  const PlaceholderPage({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        centerTitle: false,
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          title,
          style: GoogleFonts.figtree(
            fontSize: 20,
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.w800,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.construction_rounded,
              size: 80,
              color: Color(0xFFCBD5E1),
            ),
            const SizedBox(height: 16),
            Text(
              'Modul Dalam Pengembangan',
              style: GoogleFonts.figtree(
                color: const Color(0xFF64748B),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Halaman "$title" sedang dibangun.',
              style: GoogleFonts.figtree(
                color: const Color(0xFF94A3B8),
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
