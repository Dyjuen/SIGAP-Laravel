import 'package:flutter/material.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 40.0),
      decoration: const BoxDecoration(
        color: Colors.white,
      ),
      child: Column(
        children: [
          const Text(
            'Sistem Informasi Gerbang Administrasi Pengajuan KAK & LPJ',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'SIGAP PNJ memudahkan seluruh proses administrasi kegiatan di kampus secara cepat, transparan, dan efisien.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF33C8DA),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
            child: const Text('Jelajahi Fitur', style: TextStyle(fontSize: 16, color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
