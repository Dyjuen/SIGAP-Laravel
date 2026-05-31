import 'package:flutter/material.dart';
import '../../screens/login_page.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
      color: Colors.transparent,
      child: Column(
        children: [
          // "v2.0 Is Now Live" Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFE0F7FA).withOpacity(0.6),
              border: Border.all(color: const Color(0xFF80DEEA), width: 1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'v2.0 Is Now Live',
              style: TextStyle(
                color: Color(0xFF00838F),
                fontWeight: FontWeight.bold,
                fontSize: 12,
                fontFamily: 'Figtree',
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Heading: "Administrasi Kampus Jadi Lebih Cepat"
          const Text(
            'Administrasi Kampus\nJadi Lebih Cepat',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 34,
              fontWeight: FontWeight.w900,
              height: 1.2,
              color: Color(0xFF0F172A),
              fontFamily: 'Figtree',
            ),
          ),
          const SizedBox(height: 16),

          // Subtitle
          const Text(
            'Sistem Informasi Gerbang Administrasi Pengajuan\nuntuk civitas akademika Politeknik Negeri Jakarta.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFF64748B),
              height: 1.5,
              fontFamily: 'Figtree',
            ),
          ),
          const SizedBox(height: 32),

          // CTA Buttons: Mulai Sekarang & Pelajari
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Mulai Sekarang
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const LoginPage()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF33C8DA),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Mulai Sekarang',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        fontFamily: 'Figtree',
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Pelajari
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFB2EBF2), width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Pelajari',
                      style: TextStyle(
                        color: Color(0xFF0097A7),
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        fontFamily: 'Figtree',
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 36),

          // Mockup Preview Card
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.cyan.withOpacity(0.12),
                  blurRadius: 30,
                  offset: const Offset(0, 15),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                'assets/images/landing/previews/dashboard-preview.png',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  // Fallback if image asset has any issue
                  return Container(
                    height: 200,
                    width: double.infinity,
                    color: Colors.grey.shade200,
                    child: const Icon(Icons.dashboard, size: 64, color: Colors.grey),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
