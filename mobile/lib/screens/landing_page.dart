import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import '../services/chatbot_service.dart';
import 'login_page.dart';
import '../widgets/sigap_logo.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  @override
  void initState() {
    super.initState();
    // Show chatbot on landing page
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ChatbotService>().setVisible(true);
      }
    });
  }
  final List<Map<String, dynamic>> _features = [
    {
      'title': 'Pengajuan Digital',
      'desc': 'Ajukan KAK dan RAB secara digital dalam hitungan menit tanpa repot.',
      'asset': 'assets/images/landing/features/pengajuan-digital.svg',
    },
    {
      'title': 'Pelacakan Real-time',
      'desc': 'Pantau proses verifikasi dan persetujuan usulan Anda secara transparan.',
      'asset': 'assets/images/landing/features/pelacakan-real-time.svg',
    },
    {
      'title': 'Revisi Terstruktur',
      'desc': 'Perbaiki catatan verifikasi dengan mudah langsung melalui sistem.',
      'asset': 'assets/images/landing/features/revisi-terstruktur.svg',
    },
    {
      'title': 'Dokumen Otomatis',
      'desc': 'Cetak KAK, LPJ, dan dokumen formal lainnya otomatis berformat PDF.',
      'asset': 'assets/images/landing/features/dokumen-otomatis.svg',
    },
    {
      'title': 'Notifikasi Instan',
      'desc': 'Dapatkan pemberitahuan langsung untuk setiap tahapan pengajuan.',
      'asset': 'assets/images/landing/features/notifikasi-instan.svg',
    },
  ];

  final List<Map<String, String>> _faqs = [
    {
      'q': 'Siapa saja yang bisa menggunakan SIGAP?',
      'a': 'SIGAP digunakan oleh civitas akademika Politeknik Negeri Jakarta, termasuk Pengusul (Dosen/Tendik), Verifikator, PPK, Wadir II, dan Bendahara sesuai hak akses masing-masing.',
    },
    {
      'q': 'Bagaimana alur pengajuan kegiatan di SIGAP?',
      'a': 'Pengusul membuat usulan KAK & RAB -> Verifikator memeriksa kelengkapan -> PPK menyetujui anggaran -> Wadir II memberikan otorisasi akhir -> Bendahara memproses pencairan dana.',
    },
    {
      'q': 'Apakah dokumen hasil cetakan sudah sesuai standar?',
      'a': 'Ya! Seluruh dokumen PDF yang dihasilkan (Surat Pengantar, KAK, RAB) telah diformat secara otomatis mengikuti regulasi dan standar formal Politeknik Negeri Jakarta.',
    },
    {
      'q': 'Apakah aplikasi ini aman dan terintegrasi?',
      'a': 'Sangat aman! Sistem menggunakan otentikasi terenkripsi dan terhubung secara real-time ke database PostgreSQL (Supabase) yang digunakan oleh versi web SIGAP.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    const primary = Color(0xFF33C8DA);
    const dark = Color(0xFF0F172A);
    const slate = Color(0xFF475569);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          // Background wave decoration
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 380,
            child: Image.asset(
              'assets/images/auth-bg.png',
              fit: BoxFit.cover,
            ),
          ),
          // Soft cyan overlay gradient for premium branding depth
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 380,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    primary.withOpacity(0.05),
                    const Color(0xFFF8FAFC),
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                // ── Sleek Custom Navbar ──
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const SigapLogo(
                        width: 115,
                        height: 36,
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const LoginPage()),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white.withOpacity(0.9),
                          foregroundColor: primary,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                        ),
                        child: Text(
                          'Masuk',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () async => setState(() {}),
                    color: primary,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // ── Hero Section ──
                          Padding(
                            padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                            child: Column(
                              children: [
                                Text(
                                  'Akselerasi Pengajuan\nKegiatan Kampus',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.figtree(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 28,
                                    color: dark,
                                    height: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'Sistem Informasi Gerbang Administrasi Pengajuan\nterintegrasi penuh untuk produktivitas sivitas PNJ.',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.figtree(
                                    fontSize: 13,
                                    color: slate,
                                    height: 1.5,
                                  ),
                                ),
                                const SizedBox(height: 28),
                                // CTA Hero Button
                                SizedBox(
                                  width: double.infinity,
                                  height: 52,
                                  child: ElevatedButton(
                                    onPressed: () => Navigator.of(context).push(
                                      MaterialPageRoute(builder: (_) => const LoginPage()),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: primary,
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                      shadowColor: primary.withOpacity(0.3),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Mulai Sekarang',
                                          style: GoogleFonts.figtree(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 15,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        const Icon(Icons.arrow_forward_rounded, size: 16),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),


                          // ── Stats Band ──
                          Container(
                            color: const Color(0xFFE0F7FA),
                            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                _buildStatItem('500+', 'Kegiatan'),
                                _buildStatDivider(),
                                _buildStatItem('6', 'Hak Akses'),
                                _buildStatDivider(),
                                _buildStatItem('100%', 'Real-time'),
                              ],
                            ),
                          ),
                          const SizedBox(height: 48),

                          // ── Features Section ──
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Column(
                              children: [
                                Text(
                                  'LAYANAN UNGGULAN',
                                  style: GoogleFonts.figtree(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                    color: primary,
                                    letterSpacing: 1.5,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Fitur Cerdas SIGAP',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.figtree(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                    color: dark,
                                  ),
                                ),
                                const SizedBox(height: 28),
                                ..._features.map((f) => _buildFeatureCard(f, primary)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 48),

                          // ── Beautiful Interactive FAQ Section ──
                          Container(
                            color: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
                            child: Column(
                              children: [
                                Text(
                                  'TANYA JAWAB',
                                  style: GoogleFonts.figtree(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                    color: primary,
                                    letterSpacing: 1.5,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Frequently Asked Questions',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.figtree(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                    color: dark,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Segala hal yang perlu Anda ketahui tentang penggunaan aplikasi SIGAP.',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.figtree(
                                    fontSize: 13,
                                    color: slate,
                                    height: 1.5,
                                  ),
                                ),
                                const SizedBox(height: 32),
                                Image.asset(
                                  'assets/images/landing/faq-boy-with-logos.png',
                                  height: 180,
                                  fit: BoxFit.contain,
                                ),
                                const SizedBox(height: 32),
                                ..._faqs.map((faq) => _buildFaqTile(faq, primary)),
                              ],
                            ),
                          ),

                          // ── Premium CTA Dashboard Preview ──
                          Padding(
                            padding: const EdgeInsets.all(24),
                            child: Container(
                              decoration: BoxDecoration(
                                color: primary,
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: [
                                  BoxShadow(
                                    color: primary.withOpacity(0.2),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(24),
                                child: Stack(
                                  children: [
                                    Positioned.fill(
                                      child: Opacity(
                                        opacity: 0.15,
                                        child: Image.asset(
                                          'assets/images/auth-bg.png',
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.all(32),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Siap untuk Memulai?',
                                            style: GoogleFonts.figtree(
                                              fontSize: 22,
                                              fontWeight: FontWeight.w900,
                                              color: Colors.white,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            'Masuk ke akun Anda sekarang untuk memantau, memverifikasi, atau mengajukan kegiatan baru.',
                                            style: GoogleFonts.figtree(
                                              fontSize: 13,
                                              color: Colors.white.withOpacity(0.9),
                                              height: 1.5,
                                            ),
                                          ),
                                          const SizedBox(height: 24),
                                          ElevatedButton(
                                            onPressed: () => Navigator.of(context).push(
                                              MaterialPageRoute(builder: (_) => const LoginPage()),
                                            ),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.white,
                                              foregroundColor: primary,
                                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(14),
                                              ),
                                              elevation: 0,
                                            ),
                                            child: Text(
                                              'Masuk ke Aplikasi',
                                              style: GoogleFonts.figtree(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                          // ── Elegant Footer ──
                          Container(
                            color: const Color(0xFFF1F5F9),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                            child: Column(
                              children: [
                                 const SigapLogo(
                                   width: 102,
                                   height: 32,
                                 ),
                                const SizedBox(height: 16),
                                Text(
                                  'Sistem Informasi Gerbang Administrasi Pengajuan\nPoliteknik Negeri Jakarta',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.figtree(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: slate,
                                    height: 1.5,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                const Divider(color: Color(0xFFE2E8F0)),
                                const SizedBox(height: 16),
                                Text(
                                  '© 2026 Politeknik Negeri Jakarta. All Rights Reserved.',
                                  style: GoogleFonts.figtree(
                                    fontSize: 11,
                                    color: const Color(0xFF94A3B8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.figtree(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: const Color(0xFF33C8DA),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.figtree(
            fontSize: 11,
            color: const Color(0xFF475569),
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildStatDivider() {
    return Container(
      width: 1,
      height: 32,
      color: const Color(0xFF33C8DA).withOpacity(0.2),
    );
  }

  Widget _buildFeatureCard(Map<String, dynamic> f, Color primary) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: primary.withOpacity(0.08),
              borderRadius: BorderRadius.circular(14),
            ),
            child: SvgPicture.asset(
              f['asset'] as String,
              width: 24,
              height: 24,
              colorFilter: ColorFilter.mode(primary, BlendMode.srcIn),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  f['title'] as String,
                  style: GoogleFonts.figtree(
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                    color: const Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  f['desc'] as String,
                  style: GoogleFonts.figtree(
                    fontSize: 12.5,
                    color: const Color(0xFF475569),
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFaqTile(Map<String, String> faq, Color primary) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        child: Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            tilePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
            childrenPadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
            collapsedIconColor: const Color(0xFF64748B),
            iconColor: primary,
            title: Text(
              faq['q']!,
              style: GoogleFonts.figtree(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: const Color(0xFF0F172A),
              ),
            ),
            children: [
              Text(
                faq['a']!,
                style: GoogleFonts.figtree(
                  fontSize: 13,
                  color: const Color(0xFF475569),
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
