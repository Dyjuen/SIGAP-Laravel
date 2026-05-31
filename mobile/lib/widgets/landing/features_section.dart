import 'package:flutter/material.dart';

class FeaturesSection extends StatelessWidget {
  const FeaturesSection({super.key});

  @override
  Widget build(BuildContext context) {
    final features = [
      {
        'title': 'Pengajuan Cepat',
        'desc': 'Proses KAK dan RAB kini hanya dalam hitungan menit secara digital.',
        'icon': Icons.offline_bolt_outlined,
      },
      {
        'title': 'Pelacakan Real-time',
        'desc': 'Pantau status usulan Anda mulai dari draf hingga pencairan dana.',
        'icon': Icons.track_changes,
      },
      {
        'title': 'Arsip Terpusat',
        'desc': 'Semua dokumen LPJ tersimpan aman dan mudah diakses kapan saja.',
        'icon': Icons.shield_outlined,
      },
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 32.0),
      color: Colors.transparent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Section Sub-title & Title
          const Text(
            'FITUR UNGGULAN',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0097A7),
              letterSpacing: 1.5,
              fontFamily: 'Figtree',
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Solusi Digital Terintegrasi',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F172A),
              fontFamily: 'Figtree',
            ),
          ),
          const SizedBox(height: 28),

          // Features Cards
          ...features.map((f) => Container(
                margin: const EdgeInsets.only(bottom: 20.0),
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: const Color(0xFFE0F7FA).withOpacity(0.35),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withOpacity(0.8), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.cyan.withOpacity(0.04),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Icon inside soft circle
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F7FA),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        f['icon'] as IconData,
                        color: const Color(0xFF33C8DA),
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Title and desc
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            f['title'] as String,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                              fontFamily: 'Figtree',
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            f['desc'] as String,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF475569),
                              height: 1.4,
                              fontFamily: 'Figtree',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
