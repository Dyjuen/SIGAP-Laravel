import 'package:flutter/material.dart';

class FaqSection extends StatelessWidget {
  const FaqSection({super.key});

  @override
  Widget build(BuildContext context) {
    final faqs = [
      {'q': 'Siapa yang bisa menggunakan SIGAP?', 'a': 'SIGAP digunakan oleh civitas akademika PNJ.'},
      {'q': 'Bagaimana cara mengajukan KAK?', 'a': 'Login sebagai Pengusul, masuk ke menu Ajukan Usulan.'},
      {'q': 'Apakah saya bisa memantau status usulan?', 'a': 'Tentu! Fitur Pelacakan Langsung memungkinkan Anda melihat status terkini.'},
      {'q': 'Format dokumen apa yang dihasilkan?', 'a': 'Sistem menghasilkan dokumen formal dalam format PDF.'},
    ];

    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const Text(
            'Frequently asked questions',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ...faqs.map((f) => ExpansionTile(
                title: Text(f['q']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(f['a']!),
                  )
                ],
              )),
        ],
      ),
    );
  }
}
