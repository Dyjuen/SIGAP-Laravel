import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_theme.dart';
import 'master/admin_master_list_page.dart';
import 'spk_page.dart';

class AdminMasterPage extends StatelessWidget {
  const AdminMasterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Master Data',
          style: GoogleFonts.figtree(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
        centerTitle: false,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header label
          Text(
            'Referensi Sistem',
            style: GoogleFonts.figtree(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: AppTheme.primary,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Kelola data referensi yang digunakan di seluruh sistem SIGAP.',
            style: GoogleFonts.figtree(
              fontSize: 13,
              color: const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 20),

          // Master data cards grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
            childAspectRatio: 1.55,
            children: [
              _MasterCard(
                icon: Icons.category_rounded,
                label: 'Tipe Kegiatan',
                subtitle: 'Jenis-jenis kegiatan',
                color: const Color(0xFF6366F1),
                tint: const Color(0xFFEEF2FF),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AdminMasterListPage(
                      type: 'tipe-kegiatan',
                      title: 'Tipe Kegiatan',
                    ),
                  ),
                ),
              ),
              _MasterCard(
                icon: Icons.account_balance_wallet_outlined,
                label: 'Mata Anggaran',
                subtitle: 'Sumber dan kode anggaran',
                color: const Color(0xFF10B981),
                tint: const Color(0xFFD1FAE5),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AdminMasterListPage(
                      type: 'mata-anggaran',
                      title: 'Mata Anggaran',
                    ),
                  ),
                ),
              ),
              _MasterCard(
                icon: Icons.receipt_long_rounded,
                label: 'Kategori Belanja',
                subtitle: 'Klasifikasi RAB',
                color: const Color(0xFFF59E0B),
                tint: const Color(0xFFFEF3C7),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AdminMasterListPage(
                      type: 'kategori-belanja',
                      title: 'Kategori Belanja',
                    ),
                  ),
                ),
              ),
              _MasterCard(
                icon: Icons.straighten_rounded,
                label: 'Satuan',
                subtitle: 'Unit pengukuran volume',
                color: const Color(0xFFEC4899),
                tint: const Color(0xFFFCE7F3),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AdminMasterListPage(
                      type: 'satuan',
                      title: 'Satuan',
                    ),
                  ),
                ),
              ),
              _MasterCard(
                icon: Icons.flag_rounded,
                label: 'IKU',
                subtitle: 'Indikator Kinerja Utama',
                color: const Color(0xFF33C8DA),
                tint: const Color(0xFFE0F7FA),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AdminMasterListPage(
                      type: 'iku',
                      title: 'IKU',
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // SPK section divider
          Row(
            children: [
              Text(
                'Evaluasi & Keputusan',
                style: GoogleFonts.figtree(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primary,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(child: Container(height: 1, color: const Color(0xFFE2E8F0))),
            ],
          ),
          const SizedBox(height: 14),

          // SPK full-width card
          _SpkCard(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SpkPage()),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ─── Master data grid card ────────────────────────────────────────────────────

class _MasterCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final Color tint;
  final VoidCallback onTap;

  const _MasterCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.tint,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: tint,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, size: 20, color: color),
                  ),
                  const Spacer(),
                  Text(
                    label,
                    style: GoogleFonts.figtree(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF0F172A),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.figtree(
                      fontSize: 11,
                      color: const Color(0xFF94A3B8),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── SPK wide card ────────────────────────────────────────────────────────────

class _SpkCard extends StatelessWidget {
  final VoidCallback onTap;
  const _SpkCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF33C8DA), Color(0xFF2BA9B8)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF33C8DA).withValues(alpha: 0.3),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(18),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.bar_chart_rounded,
                      size: 28,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Parameter SPK',
                          style: GoogleFonts.figtree(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Konfigurasi bobot, konstrain, dan lihat hasil evaluasi kinerja kegiatan.',
                          style: GoogleFonts.figtree(
                            fontSize: 12,
                            color: Colors.white.withValues(alpha: 0.85),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 16,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
