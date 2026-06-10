import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:mobile/models/notifikasi_model.dart';
import 'package:mobile/providers/notification_provider.dart';
import 'package:mobile/services/notification_service.dart';

class FakeNotificationService extends NotificationService {
  FakeNotificationService() : super(Dio());

  List<NotifikasiModel> mockList = [];
  bool shouldFailList = false;
  bool shouldFailMarkRead = false;
  bool shouldFailMarkAllRead = false;

  int? lastMarkedId;

  @override
  Future<List<NotifikasiModel>> getNotifications() async {
    if (shouldFailList) {
      throw Exception('Gagal memuat notifikasi');
    }
    return mockList;
  }

  @override
  Future<void> markAsRead(int notificationId) async {
    if (shouldFailMarkRead) {
      throw Exception('Gagal menandai dibaca');
    }
    lastMarkedId = notificationId;
  }

  @override
  Future<void> markAllAsRead() async {
    if (shouldFailMarkAllRead) {
      throw Exception('Gagal menandai semua dibaca');
    }
  }
}

void main() {
  late FakeNotificationService fakeService;
  late NotificationProvider provider;

  final testNotif1 = NotifikasiModel(
    notifikasiId: 1,
    penerimaUserId: 10,
    pesan: 'Notif 1',
    isRead: 0,
    createdAt: '2026-06-10T12:00:00Z',
  );

  final testNotif2 = NotifikasiModel(
    notifikasiId: 2,
    penerimaUserId: 10,
    pesan: 'Notif 2',
    isRead: 1,
    createdAt: '2026-06-10T12:05:00Z',
  );

  setUp(() {
    fakeService = FakeNotificationService();
    provider = NotificationProvider(fakeService);
    fakeService.mockList = [testNotif1, testNotif2];
  });

  group('NotificationProvider Tests', () {
    test('initial state is correct', () {
      expect(provider.notifications, isEmpty);
      expect(provider.isLoading, isFalse);
      expect(provider.unreadCount, 0);
      expect(provider.errorMessage, isNull);
    });

    test('fetchNotifications success updates list and unread count', () async {
      await provider.fetchNotifications();

      expect(provider.notifications.length, 2);
      expect(provider.unreadCount, 1);
      expect(provider.isLoading, isFalse);
      expect(provider.errorMessage, isNull);
    });

    test('fetchNotifications failure sets error message', () async {
      fakeService.shouldFailList = true;

      await provider.fetchNotifications();

      expect(provider.notifications, isEmpty);
      expect(provider.isLoading, isFalse);
      expect(provider.errorMessage, contains('Gagal memuat notifikasi'));
    });

    test('markAsRead success updates local read status', () async {
      await provider.fetchNotifications();
      expect(provider.unreadCount, 1);

      final success = await provider.markAsRead(1);

      expect(success, isTrue);
      expect(fakeService.lastMarkedId, 1);
      expect(provider.unreadCount, 0);
      expect(provider.notifications.first.isRead, 1);
    });

    test('markAllAsRead success marks all as read', () async {
      await provider.fetchNotifications();
      expect(provider.unreadCount, 1);

      final success = await provider.markAllAsRead();

      expect(success, isTrue);
      expect(provider.unreadCount, 0);
      expect(provider.notifications.every((n) => n.isRead == 1), isTrue);
    });
  });
}
