import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import 'landing_page.dart';
import '../widgets/sigap_logo.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  String _roleTitle(String roleName) {
    switch (roleName.toLowerCase()) {
      case 'pengusul':
        return 'Pengusul Kegiatan';
      case 'verifikator':
        return 'Verifikator';
      case 'ppk':
        return 'PPK';
      case 'wadir':
        return 'Wadir';
      case 'bendahara':
        return 'Bendahara';
      case 'rektorat':
        return 'Rektorat';
      case 'admin':
        return 'Administrator';
      default:
        return roleName;
    }
  }

  String _roleDescription(String roleName) {
    switch (roleName.toLowerCase()) {
      case 'pengusul':
        return 'Mengelola KAK, kegiatan, dan LPJ milik sendiri.';
      case 'verifikator':
        return 'Melakukan review dan verifikasi KAK.';
      case 'ppk':
        return 'Memeriksa dan menyetujui kegiatan.';
      case 'wadir':
        return 'Memberi persetujuan administratif kegiatan.';
      case 'bendahara':
        return 'Mengelola pencairan dana dan LPJ.';
      case 'rektorat':
        return 'Melihat ringkasan dan status proses administrasi.';
      case 'admin':
        return 'Mengelola pengguna, panduan, dan master data.';
      default:
        return 'Akun dengan hak akses khusus di SIGAP PNJ.';
    }
  }

  String _roleBadgeLabel(String roleName) {
    switch (roleName.toLowerCase()) {
      case 'pengusul':
        return 'Akses Pengusul';
      case 'verifikator':
        return 'Akses Verifikator';
      case 'ppk':
        return 'Akses PPK';
      case 'wadir':
        return 'Akses Wadir';
      case 'bendahara':
        return 'Akses Bendahara';
      case 'rektorat':
        return 'Akses Rektorat';
      case 'admin':
        return 'Akses Admin';
      default:
        return roleName;
    }
  }

  String _initials(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList();
    if (parts.isEmpty) {
      return 'S';
    }
    final first = parts.first[0];
    final last = parts.length > 1 ? parts.last[0] : '';
    return '$first$last'.toUpperCase();
  }

  Future<void> _logout(BuildContext context) async {
    final authProvider = context.read<AuthProvider>();
    await authProvider.logout();
    if (!context.mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LandingPage()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final user = authProvider.user;

        if (user == null) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(color: Color(0xFF00BCD4)),
            ),
          );
        }

        final roleName = user.roleName;
        final roleTitle = _roleTitle(roleName);
        final roleDescription = _roleDescription(roleName);
        final roleBadgeLabel = _roleBadgeLabel(roleName);
        final initials = _initials(user.namaLengkap);

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: const SigapLogo(
              width: 90,
              height: 24,
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit, color: Color(0xFF00BCD4)),
                onPressed: () {},
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Column(
                    children: [
                      Stack(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFF00BCD4),
                                width: 3,
                              ),
                            ),
                            child: CircleAvatar(
                              radius: 56,
                              backgroundColor: const Color(0xFFE2E8F0),
                              child: Text(
                                initials,
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF334155),
                                  fontFamily: 'Figtree',
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            right: 8,
                            bottom: 8,
                            child: Container(
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                color: const Color(0xFF00BCD4),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white,
                                  width: 3,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user.namaLengkap,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0F172A),
                          fontFamily: 'Figtree',
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 13,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE0F7FA),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          roleBadgeLabel,
                          style: const TextStyle(
                            color: Color(0xFF0097A7),
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                            fontFamily: 'Figtree',
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        roleDescription,
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 13,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  'Informasi Akun',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A),
                    fontFamily: 'Figtree',
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(20.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.01),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _buildProfileField(
                        icon: Icons.person_outline,
                        label: 'Username',
                        value: user.username,
                      ),
                      const Divider(color: Color(0xFFF1F5F9), height: 32),
                      _buildProfileField(
                        icon: Icons.badge_outlined,
                        label: 'Peran Akses',
                        value: roleTitle,
                      ),
                      const Divider(color: Color(0xFFF1F5F9), height: 32),
                      _buildProfileField(
                        icon: Icons.email_outlined,
                        label: 'Email Instansi',
                        value: user.email,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton.icon(
                    onPressed: authProvider.isLoading
                        ? null
                        : () => _logout(context),
                    icon: authProvider.isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Color(0xFFEF4444),
                            ),
                          )
                        : const Icon(
                            Icons.logout_rounded,
                            color: Color(0xFFEF4444),
                          ),
                    label: const Text(
                      'Keluar Sesi',
                      style: TextStyle(
                        color: Color(0xFFEF4444),
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        fontFamily: 'Figtree',
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFFCA5A5)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfileField({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF33C8DA), size: 22),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  color: Color(0xFF334155),
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  fontFamily: 'Figtree',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
