import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/app_shell.dart';
import 'landing_page.dart';

class DashboardRouter extends StatelessWidget {
  const DashboardRouter({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    if (user == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF33C8DA)),
        ),
      );
    }

    if (user.roleId >= 1 && user.roleId <= 7) {
      return AppShell(roleId: user.roleId);
    }

    // Role belum didukung di aplikasi mobile
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.phone_android_outlined,
                size: 64,
                color: Color(0xFFCBD5E1),
              ),
              const SizedBox(height: 24),
              Text(
                'Halo, ${user.namaLengkap}!',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                  fontFamily: 'Figtree',
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Peran "${user.roleName}" belum tersedia di aplikasi mobile.\nSilakan gunakan versi web SIGAP PNJ.',
                style: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 14,
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton(
                  onPressed: () async {
                    await authProvider.logout();
                    if (context.mounted) {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (_) => const LandingPage(),
                        ),
                      );
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Keluar',
                    style: TextStyle(
                      color: Color(0xFF475569),
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

