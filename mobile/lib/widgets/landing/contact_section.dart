import 'package:flutter/material.dart';

class ContactSection extends StatelessWidget {
  const ContactSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.cyan[50],
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const Text(
            'Hubungi Tim SIGAP',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          const TextField(
            decoration: InputDecoration(
              labelText: 'Nama Lengkap',
              border: OutlineInputBorder(),
              filled: true,
              fillColor: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          const TextField(
            decoration: InputDecoration(
              labelText: 'Alamat Email',
              border: OutlineInputBorder(),
              filled: true,
              fillColor: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          const TextField(
            maxLines: 4,
            decoration: InputDecoration(
              labelText: 'Pesan',
              border: OutlineInputBorder(),
              filled: true,
              fillColor: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Terima kasih! Pesan Anda telah diterima.')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF33C8DA),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Kirim Pesan', style: TextStyle(fontSize: 16, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}
