import 'package:flutter/material.dart';

class FeaturesSection extends StatelessWidget {
  const FeaturesSection({super.key});

  @override
  Widget build(BuildContext context) {
    final features = [
      {'title': 'Pengajuan Digital', 'desc': 'Buat dan kirim usulan tanpa dokumen fisik.'},
      {'title': 'Revisi Terstruktur', 'desc': 'Setiap revisi tercatat dengan komentar jelas.'},
      {'title': 'Pelacakan Secara Langsung', 'desc': 'Lihat status usulan kapan saja.'},
      {'title': 'Dokumen Otomatis', 'desc': 'Menghasilkan file PDF otomatis.'},
      {'title': 'Notifikasi Instan', 'desc': 'Pemberitahuan otomatis untuk setiap pembaruan.'},
    ];

    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const Text(
            'Semua Proses, Satu Sistem.',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          ...features.map((f) => Card(
                margin: const EdgeInsets.only(bottom: 16.0),
                elevation: 2,
                child: ListTile(
                  title: Text(f['title']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(f['desc']!),
                  leading: const Icon(Icons.check_circle, color: Color(0xFF33C8DA)),
                ),
              )),
        ],
      ),
    );
  }
}
