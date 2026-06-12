import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../core/app_theme.dart';
import '../models/notifikasi_model.dart';
import '../providers/auth_provider.dart';
import '../providers/notification_provider.dart';
import '../widgets/app_shell.dart';
import '../widgets/sigap_bottom_navigation_bar.dart';
import 'kak_detail_page.dart';
import 'lpj_detail_page.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  Map<String, dynamic> _getNotifTheme(String pesan) {
    final msg = pesan.toLowerCase();
    if (msg.contains('setuju') || msg.contains('acc') || msg.contains('terima') || msg.contains('cair') || msg.contains('pencairan') || msg.contains('selesai')) {
      return {
        'color': const Color(0xFF10B981), // Emerald green
        'bg': const Color(0xFFECFDF5),
        'label': 'Disetujui',
      };
    }
    if (msg.contains('tolak') || msg.contains('revisi') || msg.contains('perbaiki') || msg.contains('salah') || msg.contains('ditolak') || msg.contains('kurang')) {
      return {
        'color': const Color(0xFFEF4444), // Red
        'bg': const Color(0xFFFEF2F2),
        'label': 'Revisi/Ditolak',
      };
    }
    if (msg.contains('baru') || msg.contains('pengajuan') || msg.contains('upload') || msg.contains('kirim') || msg.contains('tambah') || msg.contains('buat')) {
      return {
        'color': const Color(0xFF3B82F6), // Blue
        'bg': const Color(0xFFEFF6FF),
        'label': 'Pengajuan',
      };
    }
    return {
      'color': const Color(0xFF33C8DA), // Primary Cyan/Teal
      'bg': const Color(0xFFEDFBFD),
      'label': 'Informasi',
    };
  }

  String _formatDateTime(String rawDate) {
    try {
      final parsedDate = DateTime.parse(rawDate).toLocal();
      final now = DateTime.now();
      final difference = now.difference(parsedDate);

      if (difference.inMinutes < 60) {
        return '${difference.inMinutes} menit yang lalu';
      } else if (difference.inHours < 24) {
        return '${difference.inHours} jam yang lalu';
      } else if (difference.inDays == 1) {
        return 'Kemarin';
      } else if (difference.inDays < 7) {
        return '${difference.inDays} hari yang lalu';
      } else {
        return DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(parsedDate);
      }
    } catch (_) {
      return rawDate;
    }
  }

  void _onNotificationTap(BuildContext context, NotifikasiModel notif) async {
    // Mark as read
    if (notif.isRead == 0) {
      await context.read<NotificationProvider>().markAsRead(notif.notifikasiId);
    }

    if (!context.mounted) return;

    // Route based on link_tujuan
    final link = notif.linkTujuan;
    if (link == null || link.isEmpty) return;

    final uri = Uri.parse(link);
    final segments = uri.pathSegments;

    try {
      if (segments.length >= 2 && segments[0] == 'kak') {
        final kakId = segments[1];
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => KakDetailPage(kakId: kakId),
          ),
        );
      } else if (segments.length >= 2 && segments[0] == 'kegiatan') {
        final kegiatanId = int.tryParse(segments[1]);
        if (kegiatanId != null) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => LpjDetailPage(kegiatanId: kegiatanId),
            ),
          );
        }
      } else if (segments.length >= 3 && segments[0] == 'lpj' && segments[1] == 'review') {
        final kegiatanId = int.tryParse(segments[2]);
        if (kegiatanId != null) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => LpjDetailPage(kegiatanId: kegiatanId),
            ),
          );
        }
      } else if (segments.length >= 1 && segments[0] == 'lpj') {
        Navigator.pushNamed(context, '/lpj');
      }
    } catch (e) {
      debugPrint("Gagal melakukan navigasi notifikasi: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        centerTitle: false,
        title: Text(
          'Notifikasi',
          style: GoogleFonts.figtree(
            fontWeight: FontWeight.w800,
            fontSize: 20,
            color: const Color(0xFF0F172A),
          ),
        ),
        actions: [
          Consumer<NotificationProvider>(
            builder: (context, provider, _) {
              if (provider.unreadCount == 0) return const SizedBox.shrink();
              return TextButton(
                onPressed: () => provider.markAllAsRead(),
                child: Text(
                  'Tandai Semua Dibaca',
                  style: GoogleFonts.figtree(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: colorScheme.primary,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Consumer<NotificationProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && provider.notifications.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF33C8DA),
              ),
            );
          }

          if (provider.errorMessage != null && provider.notifications.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 48,
                      color: Colors.redAccent,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Gagal Memuat Notifikasi',
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      provider.errorMessage!,
                      style: GoogleFonts.figtree(
                        fontSize: 14,
                        color: const Color(0xFF64748B),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => provider.fetchNotifications(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: colorScheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Coba Lagi',
                        style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          if (provider.notifications.isEmpty) {
            return RefreshIndicator(
              onRefresh: provider.fetchNotifications,
              color: const Color(0xFF33C8DA),
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.7,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: colorScheme.primary.withOpacity(0.08),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.notifications_none_outlined,
                              size: 64,
                              color: colorScheme.primary,
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            'Belum Ada Notifikasi',
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Pemberitahuan tentang aktivitas dan anggaran Anda\nakan muncul di sini.',
                            style: GoogleFonts.figtree(
                              fontSize: 14,
                              color: const Color(0xFF64748B),
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: provider.fetchNotifications,
            color: const Color(0xFF33C8DA),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: provider.notifications.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final notif = provider.notifications[index];
                final isUnread = notif.isRead == 0;
                final theme = _getNotifTheme(notif.pesan);
                final Color stateColor = theme['color'] as Color;
                final String stateLabel = theme['label'] as String;

                return InkWell(
                  onTap: () => _onNotificationTap(context, notif),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isUnread ? const Color(0xFFEDFBFD) : Colors.white,
                      border: Border.all(
                        color: isUnread
                            ? const Color(0xFF33C8DA).withValues(alpha: 0.3)
                            : const Color(0xFFE2E8F0),
                        width: 1.2,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Left accent indicator line
                            Container(
                              width: 5,
                              color: stateColor,
                            ),
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Custom Circular S logo with state color
                                    Container(
                                      width: 42,
                                      height: 42,
                                      padding: const EdgeInsets.all(9),
                                      decoration: BoxDecoration(
                                        color: isUnread
                                            ? stateColor.withValues(alpha: 0.12)
                                            : const Color(0xFFF1F5F9),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: isUnread
                                              ? stateColor.withValues(alpha: 0.2)
                                              : const Color(0xFFE2E8F0),
                                          width: 1,
                                        ),
                                      ),
                                      child: SvgPicture.asset(
                                        'assets/images/logoauth.svg',
                                        colorFilter: ColorFilter.mode(
                                          isUnread ? stateColor : const Color(0xFF64748B),
                                          BlendMode.srcIn,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              // Modern pill badge for state
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: stateColor.withValues(alpha: 0.1),
                                                  borderRadius: BorderRadius.circular(6),
                                                  border: Border.all(
                                                    color: stateColor.withValues(alpha: 0.15),
                                                    width: 1,
                                                  ),
                                                ),
                                                child: Text(
                                                  stateLabel,
                                                  style: GoogleFonts.figtree(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w900,
                                                    color: stateColor,
                                                    letterSpacing: 0.2,
                                                  ),
                                                ),
                                              ),
                                              // Unread glowing dot
                                              if (isUnread)
                                                Container(
                                                  width: 8,
                                                  height: 8,
                                                  decoration: const BoxDecoration(
                                                    color: Color(0xFF33C8DA),
                                                    shape: BoxShape.circle,
                                                    boxShadow: [
                                                      BoxShadow(
                                                        color: Color(0xFF33C8DA),
                                                        blurRadius: 4,
                                                        spreadRadius: 1,
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            notif.pesan,
                                            style: GoogleFonts.figtree(
                                              fontSize: 13,
                                              fontWeight: isUnread ? FontWeight.w800 : FontWeight.w600,
                                              color: const Color(0xFF1E293B),
                                              height: 1.45,
                                            ),
                                          ),
                                          const SizedBox(height: 10),
                                          Text(
                                            _formatDateTime(notif.createdAt),
                                            style: GoogleFonts.figtree(
                                              fontSize: 11,
                                              fontWeight: isUnread ? FontWeight.bold : FontWeight.w500,
                                              color: isUnread
                                                  ? const Color(0xFF33C8DA)
                                                  : const Color(0xFF94A3B8),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      bottomNavigationBar: Navigator.of(context).canPop()
          ? SigapBottomNavigationBar(
              selectedIndex: AppShellState.activeInstance?.selectedIndex ?? 0,
              roleId: Provider.of<AuthProvider>(context, listen: false).user?.roleId ?? 3,
              onDestinationSelected: (index) {
                if (AppShellState.activeInstance != null) {
                  AppShellState.activeInstance!.setSelectedIndex(index);
                }
                Navigator.of(context).pop();
              },
            )
          : null,
    );
  }
}
