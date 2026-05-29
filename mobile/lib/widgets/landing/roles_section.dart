import 'package:flutter/material.dart';

class RolesSection extends StatelessWidget {
  const RolesSection({super.key});

  @override
  Widget build(BuildContext context) {
    final roles = [
      {'title': 'Pengusul', 'desc': 'Mengusulkan KAK & LPJ langsung melalui sistem digital.'},
      {'title': 'Verifikator', 'desc': 'Melakukan verifikasi dokumen.'},
      {'title': 'WD2 & PPK', 'desc': 'Memberikan persetujuan akhir.'},
      {'title': 'Bendahara', 'desc': 'Melakukan pencairan dana.'},
      {'title': 'Rektorat', 'desc': 'Memantau dan mengawasi seluruh aktivitas.'},
    ];

    return Container(
      color: Colors.grey[50],
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const Text(
            'Siapa yang Menggunakan SIGAP?',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ...roles.map((r) => Card(
                margin: const EdgeInsets.only(bottom: 12.0),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(r['title']!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF33C8DA))),
                      const SizedBox(height: 8),
                      Text(r['desc']!),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
