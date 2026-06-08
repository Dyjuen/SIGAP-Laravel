import 'package:flutter/material.dart';

class FaqSection extends StatefulWidget {
  const FaqSection({super.key});

  @override
  State<FaqSection> createState() => _FaqSectionState();
}

class _FaqSectionState extends State<FaqSection> {
  final faqs = [
    {
      'q': 'Bagaimana cara membuat akun?',
      'a': 'Akun Anda akan dibuat secara otomatis oleh Administrator Utama Kampus PNJ saat registrasi awal tahun akademik.',
      'isOpen': false,
    },
    {
      'q': 'Apakah bisa merevisi KAK yang sudah dikirim?',
      'a': 'Tentu! Selama status usulan Anda masih "Pending" atau "Revisi", Anda dapat mengajukan perbaikan dokumen di menu revisi.',
      'isOpen': false,
    },
    {
      'q': 'Berapa lama proses pencairan dana kegiatan?',
      'a': 'Rata-rata proses membutuhkan waktu 3-7 hari kerja tergantung kelengkapan berkas KAK & RAB yang diunggah.',
      'isOpen': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
      color: Colors.transparent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // FAQ Title
          const Text(
            'Pertanyaan Sering Diajukan',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F172A),
              fontFamily: 'Figtree',
            ),
          ),
          const SizedBox(height: 24),

          // FAQ Accordion Cards
          ...faqs.asMap().entries.map((entry) {
            final idx = entry.key;
            final f = entry.value;
            final isOpen = f['isOpen'] as bool;

            return Padding(
              padding: const EdgeInsets.only(bottom: 14.0),
              child: Material(
                color: Colors.white.withValues(alpha: 0.9),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: isOpen ? const Color(0xFF33C8DA) : const Color(0xFFE2E8F0),
                    width: isOpen ? 1.5 : 1,
                  ),
                ),
                shadowColor: Colors.black.withValues(alpha: 0.02),
                child: Theme(
                  data: Theme.of(context).copyWith(
                    dividerColor: Colors.transparent,
                    splashColor: const Color(0xFF33C8DA).withValues(alpha: 0.1),
                  ),
                  child: ExpansionTile(
                    key: ValueKey(idx),
                    initiallyExpanded: isOpen,
                    backgroundColor: Colors.transparent,
                    collapsedBackgroundColor: Colors.transparent,
                    onExpansionChanged: (expanded) {
                      setState(() {
                        f['isOpen'] = expanded;
                      });
                    },
                    title: Text(
                      f['q'] as String,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: isOpen ? const Color(0xFF0097A7) : const Color(0xFF1E293B),
                        fontFamily: 'Figtree',
                      ),
                    ),
                    trailing: Icon(
                      isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      color: isOpen ? const Color(0xFF33C8DA) : const Color(0xFF64748B),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 20.0),
                        child: Text(
                          f['a'] as String,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF475569),
                            height: 1.45,
                            fontFamily: 'Figtree',
                          ),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
