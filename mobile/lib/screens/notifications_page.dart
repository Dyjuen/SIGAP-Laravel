import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../core/app_theme.dart';
import '../models/notifikasi_model.dart';
import '../providers/notification_provider.dart';
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
        title: Text(
          'Notifikasi',
          style: GoogleFonts.figtree(
            fontWeight: FontWeight.bold,
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

                return InkWell(
                  onTap: () => _onNotificationTap(context, notif),
                  borderRadius: BorderRadius.circular(16),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: isUnread ? const Color(0xFFEDFBFD) : Colors.white,
                      border: Border.all(
                        color: isUnread
                            ? colorScheme.primary.withOpacity(0.3)
                            : const Color(0xFFE2E8F0),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: isUnread
                                ? colorScheme.primary.withOpacity(0.12)
                                : const Color(0xFFF1F5F9),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isUnread
                                ? Icons.mark_chat_unread_outlined
                                : Icons.mark_chat_read_outlined,
                            size: 20,
                            color: isUnread ? colorScheme.primary : const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                notif.pesan,
                                style: GoogleFonts.figtree(
                                  fontSize: 14,
                                  fontWeight: isUnread ? FontWeight.bold : FontWeight.w500,
                                  color: const Color(0xFF1E293B),
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _formatDateTime(notif.createdAt),
                                    style: GoogleFonts.figtree(
                                      fontSize: 12,
                                      fontWeight: isUnread ? FontWeight.w600 : FontWeight.normal,
                                      color: isUnread
                                          ? colorScheme.primary
                                          : const Color(0xFF94A3B8),
                                    ),
                                  ),
                                  if (isUnread)
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        color: colorScheme.primary,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
