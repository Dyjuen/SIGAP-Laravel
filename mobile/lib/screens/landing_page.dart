import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'login_page.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
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
      'icon': Icons.folder_open_rounded,
    },
    {
      'title': 'Multi-Role Approval',
      'desc': 'Alur persetujuan berlapis dari Verifikator, PPK, hingga Wadir.',
      'icon': Icons.verified_user_rounded,
    },
  ];

  final List<Map<String, String>> _faqs = [
    {
      'q': 'Siapa yang bisa menggunakan SIGAP?',
      'a': 'SIGAP digunakan oleh civitas akademika PNJ, termasuk Pengusul (Dosen/Tendik), Verifikator, PPK, WD2, dan Bendahara sesuai hak akses masing-masing.',
    },
    {
      'q': 'Bagaimana cara mengajukan KAK?',
      'a': 'Login sebagai Pengusul, masuk ke menu "Ajukan Usulan", isi formulir digital, unggah dokumen pendukung, dan kirim untuk verifikasi.',
    },
    {
      'q': 'Apakah saya bisa memantau status usulan?',
      'a': 'Tentu! Fitur "Pelacakan Langsung" memungkinkan Anda melihat status terkini usulan Anda, apakah sedang diverifikasi, disetujui, atau perlu revisi.',
    },
    {
      'q': 'Format dokumen apa yang dihasilkan?',
      'a': 'Sistem secara otomatis menghasilkan dokumen formal (KAK, LPJ, Surat Tugas) dalam format PDF yang siap cetak dan tanda tangan digital.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    const primary = Color(0xFF33C8DA);
    const dark = Color(0xFF1F2937);
    const muted = Color(0xFF6B7280);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Navbar ──────────────────────────────────────────────────
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              child: SafeArea(
                bottom: false,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SvgPicture.asset('assets/images/logoland.svg', height: 34),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const LoginPage()),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text('Masuk', style: GoogleFonts.figtree(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE5E7EB)),

            // ── Hero Section ─────────────────────────────────────────────
            Container(
              color: const Color(0xFFF8FAFC),
              padding: const EdgeInsets.fromLTRB(24, 56, 24, 48),
              child: Column(
                children: [
                  // Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                      color: primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(99),
                      border: Border.all(color: primary.withOpacity(0.3)),
                    ),
                    child: Text(
                      'Sistem Terpadu PNJ',
                      style: GoogleFonts.figtree(fontSize: 12, fontWeight: FontWeight.w600, color: primary),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text.rich(
                    TextSpan(
                      text: 'Kelola Kegiatan Kampus\nSecara ',
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.w900,
                        fontSize: 30,
                        color: dark,
                        height: 1.25,
                      ),
                      children: [
                        TextSpan(
                          text: 'cepat, transparan,\ndan efisien',
                          style: GoogleFonts.figtree(color: primary),
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Sistem Informasi Gerbang Administrasi Pengajuan\nuntuk civitas akademika Politeknik Negeri Jakarta.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.figtree(fontSize: 14, color: muted, height: 1.6),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const LoginPage()),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                      ),
                      icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                      label: Text(
                        'Mulai Sekarang',
                        style: GoogleFonts.figtree(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── Stats strip ──────────────────────────────────────────────
            Container(
              color: primary,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _stat('500+', 'Kegiatan'),
                  _divider(),
                  _stat('6', 'Role Pengguna'),
                  _divider(),
                  _stat('100%', 'Digital'),
                ],
              ),
            ),

            // ── Fitur Unggulan ───────────────────────────────────────────
            Container(
              color: const Color(0xFFF8FAFC),
              padding: const EdgeInsets.fromLTRB(24, 56, 24, 48),
              child: Column(
                children: [
                  Text(
                    'FITUR UNGGULAN',
                    style: GoogleFonts.figtree(
                      fontSize: 12, fontWeight: FontWeight.w800,
                      color: primary, letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Solusi Digital Terintegrasi',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.figtree(fontSize: 22, fontWeight: FontWeight.w900, color: dark),
                  ),
                  const SizedBox(height: 32),
                  ...(_features.map((f) => _featureCard(f, primary))),
                ],
              ),
            ),

            // ── FAQ ──────────────────────────────────────────────────────
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(24, 48, 24, 48),
              child: Column(
                children: [
                  Text(
                    'Pertanyaan Sering Diajukan',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.figtree(fontSize: 22, fontWeight: FontWeight.w900, color: dark),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Temukan jawaban atas pertanyaan umum seputar SIGAP.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.figtree(fontSize: 13, color: muted),
                  ),
                  const SizedBox(height: 28),
                  Image.asset(
                    'assets/images/landing/faq-boy-with-logos.png',
                    height: 200,
                  ),
                  const SizedBox(height: 24),
                  ...(_faqs.map((faq) => _faqTile(faq, primary))),
                ],
              ),
            ),

            // ── Footer ───────────────────────────────────────────────────
            Container(
              color: const Color(0xFFF8FAFC),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
              child: Column(
                children: [
                  const Divider(color: Color(0xFFE5E7EB)),
                  const SizedBox(height: 20),
                  SvgPicture.asset('assets/images/logoland.svg', height: 30),
                  const SizedBox(height: 12),
                  Text(
                    '© 2025 SIGAP PNJ · Politeknik Negeri Jakarta',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.figtree(fontSize: 12, color: muted),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _stat(String value, String label) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.figtree(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
        const SizedBox(height: 2),
        Text(label, style: GoogleFonts.figtree(fontSize: 12, color: Colors.white.withOpacity(0.85))),
      ],
    );
  }

  Widget _divider() => Container(width: 1, height: 36, color: Colors.white.withOpacity(0.3));

  Widget _featureCard(Map<String, dynamic> f, Color primary) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(f['icon'] as IconData, color: primary, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(f['title'] as String, style: GoogleFonts.figtree(fontWeight: FontWeight.w700, fontSize: 15, color: const Color(0xFF1F2937))),
                const SizedBox(height: 4),
                Text(f['desc'] as String, style: GoogleFonts.figtree(fontSize: 13, color: const Color(0xFF6B7280), height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _faqTile(Map<String, String> faq, Color primary) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          collapsedIconColor: const Color(0xFF6B7280),
          iconColor: primary,
          title: Text(
            faq['q']!,
            style: GoogleFonts.figtree(fontWeight: FontWeight.w600, fontSize: 14, color: const Color(0xFF1F2937)),
          ),
          children: [
            Text(
              faq['a']!,
              style: GoogleFonts.figtree(fontSize: 13, color: const Color(0xFF6B7280), height: 1.6),
            ),
          ],
        ),
      ),
    );
  }
}
