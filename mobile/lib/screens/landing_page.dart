import 'package:flutter/material.dart';
import 'login_page.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> with TickerProviderStateMixin {
  final List<bool> _faqExpanded = [false, false, false, false];
  late final AnimationController _heroAnim;
  late final Animation<double> _heroFade;
  late final Animation<Offset> _heroSlide;

  @override
  void initState() {
    super.initState();
    _heroAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..forward();
    _heroFade = CurvedAnimation(parent: _heroAnim, curve: Curves.easeOut);
    _heroSlide = Tween<Offset>(begin: const Offset(0, 0.12), end: Offset.zero)
        .animate(CurvedAnimation(parent: _heroAnim, curve: Curves.easeOutCubic));
  }

  @override
  void dispose() {
    _heroAnim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.white.withOpacity(0.92),
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFF00BCD4),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.bolt, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Text(
              'SIGAP PNJ',
              style: TextStyle(
                color: Color(0xFF0F172A),
                fontWeight: FontWeight.w900,
                fontSize: 20,
                fontFamily: 'Figtree',
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: ElevatedButton(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const LoginPage()),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00BCD4),
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              child: const Text('Masuk', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: const Color(0xFF00BCD4),
        foregroundColor: Colors.white,
        shape: const CircleBorder(),
        child: const Icon(Icons.chat_bubble_outline),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHero(),
            _buildFeatures(),
            _buildRoles(),
            _buildFaq(),
            _buildContact(),
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  // ─── HERO ───────────────────────────────────────────────────────────────────
  Widget _buildHero() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 110, 24, 56),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFFFFFFF), Color(0xFFE0F7FA)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: FadeTransition(
        opacity: _heroFade,
        child: SlideTransition(
          position: _heroSlide,
          child: Column(
            children: [

              const Text(
                'Sistem Informasi Gerbang Administrasi Pengajuan KAK & LPJ',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  height: 1.25,
                  color: Color(0xFF0F172A),
                  fontFamily: 'Figtree',
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'SIGAP PNJ memudahkan seluruh proses administrasi kegiatan di kampus secara cepat, transparan, dan efisien.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF475569),
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginPage()),
                  ),
                  icon: const Icon(Icons.arrow_forward_rounded),
                  label: const Text(
                    'Mulai Sekarang',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00BCD4),
                    foregroundColor: Colors.white,
                    elevation: 8,
                    shadowColor: const Color(0xFF00BCD4).withOpacity(0.35),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),

            ],
          ),
        ),
      ),
    );
  }

  // ─── FEATURES ───────────────────────────────────────────────────────────────
  Widget _buildFeatures() {
    final features = [
      {'icon': Icons.description_outlined, 'title': 'Pengajuan Digital', 'desc': 'Buat dan kirim usulan KAK & LPJ tanpa dokumen fisik.', 'color': const Color(0xFF00BCD4), 'bg': const Color(0xFFE0F7FA)},
      {'icon': Icons.edit_note_outlined, 'title': 'Revisi Terstruktur', 'desc': 'Setiap revisi tercatat dengan komentar jelas dari verifikator.', 'color': const Color(0xFF8B5CF6), 'bg': const Color(0xFFF5F3FF)},
      {'icon': Icons.track_changes_outlined, 'title': 'Pelacakan Langsung', 'desc': 'Lihat status usulan kapan saja dari validasi hingga persetujuan.', 'color': const Color(0xFFF59E0B), 'bg': const Color(0xFFFFFBEB)},
      {'icon': Icons.picture_as_pdf_outlined, 'title': 'Dokumen Otomatis', 'desc': 'SIGAP menghasilkan KAK dan surat resmi dalam format PDF.', 'color': const Color(0xFFEF4444), 'bg': const Color(0xFFFEF2F2)},
      {'icon': Icons.notifications_outlined, 'title': 'Notifikasi Instan', 'desc': 'Pemberitahuan otomatis setiap ada pembaruan atau revisi.', 'color': const Color(0xFF10B981), 'bg': const Color(0xFFECFDF5)},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(24, 48, 24, 48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _sectionBadge('Fitur Utama'),
          const SizedBox(height: 10),
          const Text(
            'Semua Proses, Satu Sistem.',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), fontFamily: 'Figtree'),
          ),
          const SizedBox(height: 6),
          const Text(
            'SIGAP membantu setiap peran dari pengusul hingga pimpinan.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 24),
          ...features.map((f) => _buildFeatureRow(f)),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(Map<String, dynamic> f) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: f['bg'] as Color, borderRadius: BorderRadius.circular(12)),
            child: Icon(f['icon'] as IconData, color: f['color'] as Color, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(f['title'] as String,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 14, fontFamily: 'Figtree')),
                const SizedBox(height: 2),
                Text(f['desc'] as String,
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── ROLES ───────────────────────────────────────────────────────────────────
  Widget _buildRoles() {
    final roles = [
      {'icon': Icons.laptop_mac_outlined, 'title': 'Pengusul', 'desc': 'Mengusulkan KAK & LPJ langsung melalui sistem digital.'},
      {'icon': Icons.verified_outlined, 'title': 'Verifikator', 'desc': 'Verifikasi dokumen usulan dari persyaratan hingga data.'},
      {'icon': Icons.star_outline, 'title': 'WD2 & PPK', 'desc': 'Memberikan persetujuan akhir sebelum usulan dieksekusi.'},
      {'icon': Icons.account_balance_wallet_outlined, 'title': 'Bendahara', 'desc': 'Pencairan dana dan validasi transaksi keuangan LPJ.'},
      {'icon': Icons.visibility_outlined, 'title': 'Rektorat', 'desc': 'Memantau seluruh aktivitas untuk transparansi dan akuntabilitas.'},
    ];

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 48, 24, 48),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        border: Border(top: BorderSide(color: const Color(0xFFE2E8F0))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _sectionBadge('Peran'),
          const SizedBox(height: 10),
          const Text(
            'Siapa yang Menggunakan SIGAP?',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), fontFamily: 'Figtree'),
          ),
          const SizedBox(height: 6),
          const Text(
            'Siap digunakan dengan peran berbeda sesuai alur kerja kampus.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 24),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
            childAspectRatio: 1.3,
            children: roles.map((r) => Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(r['icon'] as IconData, color: const Color(0xFF00BCD4), size: 26),
                  const SizedBox(height: 8),
                  Text(r['title'] as String,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A), fontFamily: 'Figtree')),
                  const SizedBox(height: 4),
                  Text(r['desc'] as String,
                      style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), height: 1.4)),
                ],
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  // ─── FAQ ────────────────────────────────────────────────────────────────────
  Widget _buildFaq() {
    final faqs = [
      {'q': 'Siapa yang bisa menggunakan SIGAP?', 'a': 'SIGAP digunakan oleh civitas akademika PNJ: Pengusul (Dosen/Tendik), Verifikator, PPK, WD2, Bendahara, dan Rektorat.'},
      {'q': 'Bagaimana cara mengajukan KAK?', 'a': 'Login sebagai Pengusul, buka menu KAK, isi formulir digital, dan kirim untuk verifikasi.'},
      {'q': 'Apakah saya bisa memantau status usulan?', 'a': 'Tentu! Fitur Pelacakan Langsung memungkinkan Anda melihat status terkini — diverifikasi, disetujui, atau perlu revisi.'},
      {'q': 'Format dokumen apa yang dihasilkan?', 'a': 'Sistem menghasilkan dokumen formal KAK dan LPJ dalam format PDF yang siap cetak.'},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(24, 48, 24, 48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _sectionBadge('FAQ'),
          const SizedBox(height: 10),
          const Text(
            'Frequently Asked Questions',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), fontFamily: 'Figtree'),
          ),
          const SizedBox(height: 6),
          const Text('Punya pertanyaan? Kami siap bantu.',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          ...faqs.asMap().entries.map((e) => _buildFaqItem(e.key, e.value['q']!, e.value['a']!)),
        ],
      ),
    );
  }

  Widget _buildFaqItem(int idx, String q, String a) {
    final isOpen = _faqExpanded[idx];
    return GestureDetector(
      onTap: () => setState(() => _faqExpanded[idx] = !isOpen),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isOpen ? const Color(0xFF00BCD4) : const Color(0xFFE2E8F0)),
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  Expanded(
                    child: Text(q,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A), fontFamily: 'Figtree')),
                  ),
                  Icon(isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      color: const Color(0xFF00BCD4)),
                ],
              ),
            ),
            if (isOpen)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                child: Text(a,
                    style: const TextStyle(color: Color(0xFF475569), fontSize: 12, height: 1.6)),
              ),
          ],
        ),
      ),
    );
  }

  // ─── CONTACT ────────────────────────────────────────────────────────────────
  Widget _buildContact() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 48, 24, 48),
      color: const Color(0xFFF8FAFC),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _sectionBadge('Kontak'),
          const SizedBox(height: 10),
          const Text('Hubungi Tim SIGAP',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), fontFamily: 'Figtree')),
          const SizedBox(height: 6),
          const Text('Ada pertanyaan atau butuh bantuan? Tim kami siap membantu Anda.',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.5)),
          const SizedBox(height: 24),
          _buildContactRow(Icons.email_outlined, 'Alamat Email', 'Sigap@pnj.ac.id'),
          const SizedBox(height: 12),
          _buildContactRow(Icons.phone_outlined, 'Nomor Telepon', '+6234 088 963'),
        ],
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFE0F7FA),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF00BCD4), size: 20),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
              const SizedBox(height: 2),
              Text(value,
                  style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 14)),
            ],
          ),
        ],
      ),
    );
  }

  // ─── FOOTER ─────────────────────────────────────────────────────────────────
  Widget _buildFooter() {
    return Container(
      color: const Color(0xFF0F172A),
      padding: const EdgeInsets.all(28),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(color: const Color(0xFF00BCD4), borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.bolt, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 10),
              const Text('SIGAP PNJ',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, fontFamily: 'Figtree')),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Sistem Informasi Gerbang Administrasi Pengajuan\nPoliteknik Negeri Jakarta',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF64748B), fontSize: 12, height: 1.6),
          ),
          const SizedBox(height: 20),
          const Divider(color: Color(0xFF1E293B)),
          const SizedBox(height: 12),
          const Text('© 2025 SIGAP PNJ. All rights reserved.',
              style: TextStyle(color: Color(0xFF475569), fontSize: 11)),
        ],
      ),
    );
  }

  Widget _sectionBadge(String label) {
    return Container(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0xFFE0F7FA),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label,
            style: const TextStyle(color: Color(0xFF0097A7), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
      ),
    );
  }
}


