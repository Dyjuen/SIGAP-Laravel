import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../widgets/feature_card.dart';
import '../widgets/faq_item.dart';
import 'login_page.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final List<bool> _faqExpanded = [false, false, false, false];

  final List<Map<String, dynamic>> _features = [
    {
      'title': 'Pengajuan Cepat',
      'desc': 'Proses KAK dan RAB kini hanya dalam hitungan menit secara digital.',
      'icon': Icons.speed_rounded,
    },
    {
      'title': 'Pelacakan Real-time',
      'desc': 'Pantau status usulan Anda mulai dari draf hingga pencairan dana.',
      'icon': Icons.track_changes_rounded,
    },
    {
      'title': 'Arsip Terpusat',
      'desc': 'Semua dokumen LPJ tersimpan aman dan mudah diakses kapan saja.',
      'icon': Icons.security_rounded,
    },
  ];

  final List<Map<String, String>> _faqs = [
    {'q': 'Bagaimana cara membuat akun?', 'a': 'Akun dibuat secara otomatis melalui integrasi SSO. Hubungi admin jika Anda mengalami kendala login.'},
    {'q': 'Apakah bisa merevisi KAK yang sudah dikirim?', 'a': 'Bisa, KAK yang dikirim dapat direvisi apabila Verifikator atau PPK mengembalikan dokumen tersebut dengan catatan revisi.'},
    {'q': 'Berapa lama proses pencairan dana?', 'a': 'Pencairan dana bergantung pada kelengkapan LPJ dan proses verifikasi akhir oleh Bendahara, biasanya 3-5 hari kerja.'},
  ];

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final primaryColor = colorScheme.primary;

    return Scaffold(
      backgroundColor: colorScheme.background,
      body: Stack(
        children: [
          // Background Gradient (Replacement for RadialTurbulenceGradientShaderFill)
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [
                  primaryColor.withOpacity(0.15),
                  colorScheme.background,
                  colorScheme.background,
                ],
                center: const Alignment(0, -0.6),
                radius: 1.5,
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),
          // Content
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Nav / Header
                ClipRRect(
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      decoration: BoxDecoration(
                        color: colorScheme.surface.withOpacity(0.6),
                      ),
                      child: SafeArea(
                        bottom: false,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'SIGAP',
                                  style: GoogleFonts.figtree(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 22,
                                    color: colorScheme.onSurface,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'PNJ',
                                  style: GoogleFonts.figtree(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 22,
                                    color: primaryColor,
                                  ),
                                ),
                              ],
                            ),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const LoginPage()),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: primaryColor,
                                foregroundColor: colorScheme.onPrimary,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: Text(
                                'Masuk',
                                style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                // Hero Section
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(9999),
                          border: Border.all(color: primaryColor.withOpacity(0.2)),
                        ),
                        child: Text(
                          'v2.0 Is Now Live',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            color: primaryColor,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Administrasi Kampus Jadi Lebih Cepat',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w900,
                          fontSize: 32,
                          color: colorScheme.onBackground,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Sistem Informasi Gerbang Administrasi Pengajuan untuk civitas akademika Politeknik Negeri Jakarta.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.figtree(
                          fontSize: 14,
                          color: Colors.grey[600],
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 32),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          ElevatedButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const LoginPage()),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryColor,
                              foregroundColor: colorScheme.onPrimary,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              'Mulai Sekarang',
                              style: GoogleFonts.figtree(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                          const SizedBox(width: 16),
                          OutlinedButton(
                            onPressed: () {}, // Optional action
                            style: OutlinedButton.styleFrom(
                              foregroundColor: colorScheme.onBackground,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                              side: BorderSide(color: Colors.grey.withOpacity(0.3)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              'Pelajari',
                              style: GoogleFonts.figtree(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Dashboard Preview Image
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Container(
                    height: 240,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      image: const DecorationImage(
                        image: NetworkImage('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'), // Placeholder for dashboard
                        fit: BoxFit.cover,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            colorScheme.background,
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                // Fitur Unggulan
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
                  child: Column(
                    children: [
                      Text(
                        'FITUR UNGGULAN',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          color: colorScheme.onBackground,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Solusi Digital Terintegrasi',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w900,
                          fontSize: 24,
                          color: colorScheme.onBackground,
                        ),
                      ),
                      const SizedBox(height: 32),
                      ..._features.map((f) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: FeatureCardWidget(
                          title: f['title'] as String,
                          desc: f['desc'] as String,
                          icon: Icon(
                            f['icon'] as IconData,
                            color: primaryColor,
                            size: 24,
                          ),
                        ),
                      )),
                    ],
                  ),
                ),
                // FAQ Section
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                  child: Column(
                    children: [
                      Text(
                        'Pertanyaan Sering Diajukan',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w800,
                          fontSize: 24,
                          color: colorScheme.onBackground,
                        ),
                      ),
                      const SizedBox(height: 32),
                      ..._faqs.asMap().entries.map((e) {
                        final idx = e.key;
                        final q = e.value['q']!;
                        final a = e.value['a']!;
                        return FaqItemWidget(
                          question: q,
                          answer: a,
                          isExpanded: _faqExpanded[idx],
                          onTap: () {
                            setState(() {
                              _faqExpanded[idx] = !_faqExpanded[idx];
                            });
                          },
                        );
                      }),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                // Footer
                Container(
                  color: colorScheme.surface,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Divider(color: Colors.grey.withOpacity(0.2), height: 1),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'SIGAP',
                                  style: GoogleFonts.figtree(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 18,
                                    color: colorScheme.onSurface,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'PNJ',
                                  style: GoogleFonts.figtree(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 18,
                                    color: primaryColor,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              '© 2024 Politeknik Negeri Jakarta\nSistem Informasi Gerbang Administrasi Pengajuan',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.figtree(
                                fontSize: 12,
                                color: Colors.grey[600],
                                height: 1.5,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.facebook_rounded, color: Colors.grey[600], size: 20),
                                const SizedBox(width: 16),
                                Icon(Icons.language_rounded, color: Colors.grey[600], size: 20),
                                const SizedBox(width: 16),
                                Icon(Icons.email_rounded, color: Colors.grey[600], size: 20),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Floating Action Button (from original landing page)
          Align(
            alignment: Alignment.bottomRight,
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: FloatingActionButton(
                onPressed: () {},
                backgroundColor: primaryColor,
                foregroundColor: colorScheme.onPrimary,
                shape: const CircleBorder(),
                elevation: 4,
                child: const Icon(Icons.chat_bubble_rounded),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
