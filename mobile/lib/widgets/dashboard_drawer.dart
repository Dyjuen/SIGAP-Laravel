import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';
import '../screens/landing_page.dart';
import '../screens/pengusul/kak_list_page.dart';
import '../screens/pengusul/kegiatan_page.dart';
import '../screens/kegiatan_monitoring_page.dart';
import '../screens/pengusul/lpj_list_page.dart';
import '../screens/verifikator/verifikator_kak_list_page.dart';
import '../screens/bendahara/pencairan_page.dart';
import '../screens/admin/user_management_page.dart';
import '../screens/placeholder_page.dart';

class DashboardDrawer extends StatelessWidget {
  final int roleId;

  const DashboardDrawer({super.key, required this.roleId});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.user;

    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              width: double.infinity,
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  SvgPicture.asset(
                    'assets/images/logoland.svg',
                    height: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SIGAP PNJ',
                          style: GoogleFonts.figtree(
                            color: const Color(0xFF0F172A),
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          'Navigasi Aplikasi',
                          style: GoogleFonts.figtree(
                            color: const Color(0xFF64748B),
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _drawerItem(
                    context,
                    Icons.dashboard_rounded,
                    'Dashboard',
                    onTap: () => Navigator.pop(context),
                  ),
                  ..._getRoleMenu(context, roleId),
                ],
              ),
            ),
            _buildProfileFooter(context, authProvider, user),
          ],
        ),
      ),
    );
  }

  List<Widget> _getRoleMenu(BuildContext context, int role) {
    final menu = <Widget>[];

    if ([1, 2, 3, 6, 7].contains(role)) {
      menu.add(
        _drawerItem(
          context,
          Icons.file_copy_rounded,
          'Kegiatan (KAK)',
          onTap: () => _openKakPage(context, role),
        ),
      );
    }

    if ([1, 3, 4, 5].contains(role)) {
      menu.addAll([
        _drawerItem(
          context,
          Icons.task_alt_rounded,
          'Kegiatan',
          onTap: () => _openPage(context, const KegiatanPage()),
        ),
        _drawerItem(
          context,
          Icons.visibility_rounded,
          'Pemantauan Kegiatan',
          onTap: () => _openPage(context, const KegiatanMonitoringPage()),
        ),
      ]);
    }

    if ([1, 6].contains(role)) {
      menu.add(
        _drawerItem(
          context,
          Icons.payments_rounded,
          'Pencairan Dana',
          onTap: () => _openPage(context, const PencairanPage()),
        ),
      );
    }

    if ([1, 3, 6].contains(role)) {
      menu.add(
        _drawerItem(
          context,
          Icons.receipt_long_rounded,
          'LPJ',
          onTap: () => _openPage(context, const LpjListPage()),
        ),
      );
    }

    if (role == 1) {
      menu.addAll([
        _drawerItem(
          context,
          Icons.group_rounded,
          'Manajemen Akun',
          onTap: () => _openPage(context, const UserManagementPage()),
        ),
        _drawerItem(
          context,
          Icons.menu_book_rounded,
          'Manajemen Panduan',
          onTap: () => _openPage(
            context,
            const PlaceholderPage(title: 'Manajemen Panduan'),
          ),
        ),
        _drawerItem(
          context,
          Icons.history_rounded,
          'Riwayat Aktivitas',
          onTap: () => _openPage(
            context,
            const PlaceholderPage(title: 'Riwayat Aktivitas'),
          ),
        ),
        _masterDataTile(context),
      ]);
    }

    return menu;
  }

  Widget _masterDataTile(BuildContext context) {
    final titles = [
      'Role & Izin',
      'Mata Anggaran',
      'Kategori Belanja',
      'Satuan',
      'Tipe Kegiatan',
      'Status Kegiatan',
      'IKU',
      'Manajemen SPK',
    ];

    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 20),
        childrenPadding: const EdgeInsets.only(left: 12, right: 12, bottom: 8),
        iconColor: const Color(0xFF33C8DA),
        collapsedIconColor: const Color(0xFF64748B),
        leading: const Icon(Icons.storage_rounded, size: 22),
        title: Text(
          'Master Data',
          style: GoogleFonts.figtree(
            color: const Color(0xFF1F2937),
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
        children: titles
            .map(
              (title) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: ListTile(
                  dense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  title: Text(
                    title,
                    style: GoogleFonts.figtree(
                      color: const Color(0xFF475569),
                      fontWeight: FontWeight.w500,
                      fontSize: 13,
                    ),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  onTap: () => _openPage(
                    context,
                    PlaceholderPage(title: title),
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  void _openKakPage(BuildContext context, int role) {
    _openPage(
      context,
      [2, 7].contains(role)
          ? const VerifikatorKakListPage()
          : const KakListPage(),
    );
  }

  void _openPage(BuildContext context, Widget page) {
    Navigator.pop(context);
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => page),
    );
  }

  Widget _buildProfileFooter(
    BuildContext context,
    AuthProvider provider,
    User? user,
  ) {
    if (user == null) {
      return const SizedBox.shrink();
    }

    final initials = _initials(user.namaLengkap);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF33C8DA),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Text(
                  initials,
                  style: GoogleFonts.figtree(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.namaLengkap,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.figtree(
                        color: const Color(0xFF0F172A),
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      user.roleName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.figtree(
                        color: const Color(0xFF64748B),
                        fontWeight: FontWeight.w500,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            user.email,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.figtree(
              color: const Color(0xFF64748B),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async => _handleLogout(context, provider),
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: const Text('Keluar'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Color(0xFFFECACA)),
                backgroundColor: const Color(0xFFFFF1F2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _initials(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList();

    if (parts.isEmpty) {
      return 'U';
    }

    return parts.take(2).map((part) => part[0]).join().toUpperCase();
  }

  Widget _drawerItem(
    BuildContext context,
    IconData icon,
    String label, {
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF1F2937), size: 22),
      title: Text(
        label,
        style: GoogleFonts.figtree(
          color: const Color(0xFF1F2937),
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
    );
  }

  Future<void> _handleLogout(
    BuildContext context,
    AuthProvider provider,
  ) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Keluar?',
          style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Anda yakin ingin keluar dari akun?',
          style: GoogleFonts.figtree(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Keluar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true && context.mounted) {
      await provider.logout();
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LandingPage()),
        (route) => false,
      );
    }
  }
}

class DashboardAppBar extends StatelessWidget implements PreferredSizeWidget {
  const DashboardAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      foregroundColor: const Color(0xFF1F2937),
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: true,
      title: SvgPicture.asset('assets/images/logoland.svg', height: 28),
      actions: [
        IconButton(
          icon: const Icon(Icons.logout_rounded),
          color: Colors.red,
          tooltip: 'Keluar',
          onPressed: () async {
            final provider = context.read<AuthProvider>();
            final confirm = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                title: Text(
                  'Keluar?',
                  style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
                ),
                content: Text(
                  'Anda yakin ingin keluar dari akun?',
                  style: GoogleFonts.figtree(),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx, false),
                    child: const Text('Batal'),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                    onPressed: () => Navigator.pop(ctx, true),
                    child: const Text(
                      'Keluar',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            );

            if (confirm == true && context.mounted) {
              await provider.logout();
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LandingPage()),
                (route) => false,
              );
            }
          },
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
