import 'package:flutter/material.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'SIGAP PNJ',
          style: TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.w900,
            fontSize: 20,
            fontFamily: 'Figtree',
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, color: Color(0xFF00BCD4)),
            onPressed: () {},
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Avatar section
            Center(
              child: Column(
                children: [
                  Stack(
                    children: [
                      // Circular Photo Container with cyan ring border
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF00BCD4), width: 3),
                        ),
                        child: const CircleAvatar(
                          radius: 56,
                          backgroundColor: Color(0xFFE2E8F0),
                          child: Icon(Icons.person, size: 72, color: Color(0xFF94A3B8)),
                        ),
                      ),
                      // Solid cyan status dot badge on the right
                      Positioned(
                        right: 8,
                        bottom: 8,
                        child: Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            color: const Color(0xFF00BCD4),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Administrator Utama',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      fontFamily: 'Figtree',
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'NIP. 19850312 201012 1 002',
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Super Admin Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0F7FA),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Super Admin',
                      style: TextStyle(
                        color: Color(0xFF0097A7),
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                        fontFamily: 'Figtree',
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Informasi Akun Section Title
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

            // Account info card container
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
                    icon: Icons.email_outlined,
                    label: 'Email Instansi',
                    value: 'admin.utama@pnj.ac.id',
                  ),
                  const Divider(color: Color(0xFFF1F5F9), height: 32),
                  _buildProfileField(
                    icon: Icons.business_outlined,
                    label: 'Unit Kerja',
                    value: 'Bagian Administrasi Akademik',
                  ),
                  const Divider(color: Color(0xFFF1F5F9), height: 32),
                  _buildProfileField(
                    icon: Icons.phone_outlined,
                    label: 'Nomor Telepon',
                    value: '+62 812-3456-7890',
                  ),
                  const Divider(color: Color(0xFFF1F5F9), height: 32),
                  _buildProfileField(
                    icon: Icons.location_on_outlined,
                    label: 'Lokasi Kantor',
                    value: 'Gedung Direktorat, Lt. 2',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Pengaturan Section Title
            const Text(
              'Pengaturan',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: Color(0xFF0F172A),
                fontFamily: 'Figtree',
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),

            // Settings card link
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
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
                    child: const Icon(Icons.shield_outlined, color: Color(0xFF00BCD4)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Keamanan',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E293B),
                            fontSize: 15,
                            fontFamily: 'Figtree',
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Ganti kata sandi & otentikasi',
                          style: TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Color(0xFF64748B)),
                ],
              ),
            ),
          ],
        ),
      ),
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
        Icon(icon, color: const Color(0xFF00BCD4), size: 22),
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
