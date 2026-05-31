import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../providers/auth_provider.dart';
import '../screens/landing_page.dart';
import '../screens/pengusul/kak_create_page.dart';
import '../screens/pengusul/kak_list_page.dart';

class DashboardDrawer extends StatelessWidget {
  final int roleId;

  const DashboardDrawer({super.key, required this.roleId});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.user;

    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
          // Header Drawer
          Container(
            padding: const EdgeInsets.fromLTRB(20, 56, 20, 20),
            color: const Color(0xFF33C8DA),
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SvgPicture.asset(
                  'assets/images/logoauth.svg',
                  width: 40,
                  height: 40,
                  // Jika ingin icon berwarna putih:
                  // colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                ),
                const SizedBox(height: 12),
                Text(
                  user?.namaLengkap ?? '-',
                  style: GoogleFonts.figtree(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  user?.roleName ?? '-',
                  style: GoogleFonts.figtree(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),

          // Nav Items based on Role
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                _drawerItem(
                  context,
                  Icons.dashboard_rounded,
                  'Dashboard',
                  onTap: () {
                    Navigator.pop(context); // Close drawer
                  },
                ),
                ..._getRoleMenu(context, roleId),
                const Divider(height: 1),
                // Logout di bawah
                _drawerItem(
                  context,
                  Icons.logout_rounded,
                  'Keluar',
                  isLogout: true,
                  onTap: () async {
                    await _handleLogout(context, authProvider);
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _getRoleMenu(BuildContext context, int role) {
    switch (role) {
      case 2: // Pengusul
        return [
          _drawerItem(
            context,
            Icons.add_box_rounded,
            'Buat KAK',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const KakCreatePage()),
              );
            },
          ),
          _drawerItem(
            context,
            Icons.list_alt_rounded,
            'Daftar KAK',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const KakListPage()),
              );
            },
          ),
          _drawerItem(
            context,
            Icons.task_rounded,
            'LPJ Saya',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate to LPJ Saya
            },
          ),
        ];
      case 3: // Verifikator
        return [
          _drawerItem(
            context,
            Icons.rule_rounded,
            'Antrian Verifikasi',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate
            },
          ),
          _drawerItem(
            context,
            Icons.history_rounded,
            'Riwayat',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate
            },
          ),
        ];
      case 4: // PPK
      case 7: // Wadir 2
        return [
          _drawerItem(
            context,
            Icons.assignment_rounded,
            'Daftar Kegiatan',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate
            },
          ),
          _drawerItem(
            context,
            Icons.fact_check_rounded,
            'Persetujuan',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate
            },
          ),
        ];
      case 5: // Bendahara
        return [
          _drawerItem(
            context,
            Icons.payments_rounded,
            'Pencairan Dana',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate
            },
          ),
          _drawerItem(
            context,
            Icons.receipt_long_rounded,
            'LPJ',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate
            },
          ),
        ];
      case 6: // Direktur/Admin
        return [
          _drawerItem(
            context,
            Icons.group_rounded,
            'Manajemen User',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate
            },
          ),
          _drawerItem(
            context,
            Icons.analytics_rounded,
            'Monitoring',
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate
            },
          ),
        ];
      default:
        return [];
    }
  }

  Widget _drawerItem(
    BuildContext context,
    IconData icon,
    String label, {
    required VoidCallback onTap,
    bool isLogout = false,
  }) {
    final color = isLogout ? Colors.red : const Color(0xFF1F2937);
    return ListTile(
      leading: Icon(icon, color: color, size: 22),
      title: Text(
        label,
        style: GoogleFonts.figtree(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
    );
  }

  Future<void> _handleLogout(BuildContext context, AuthProvider provider) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Keluar?', style: GoogleFonts.figtree(fontWeight: FontWeight.bold)),
        content: Text('Anda yakin ingin keluar dari akun?', style: GoogleFonts.figtree()),
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
                title: Text('Keluar?', style: GoogleFonts.figtree(fontWeight: FontWeight.bold)),
                content: Text('Anda yakin ingin keluar dari akun?', style: GoogleFonts.figtree()),
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
          },
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
