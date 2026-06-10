import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import '../models/notifikasi_model.dart';
import '../services/notification_service.dart';

class NotificationProvider with ChangeNotifier {
  final NotificationService _service;

  NotificationProvider(this._service);

  List<NotifikasiModel> _notifications = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<NotifikasiModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  int get unreadCount => _notifications.where((n) => n.isRead == 0).length;

  Future<void> fetchNotifications() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _notifications = await _service.getNotifications();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> markAsRead(int notificationId) async {
    try {
      await _service.markAsRead(notificationId);
      
      final index = _notifications.indexWhere((n) => n.notifikasiId == notificationId);
      if (index != -1) {
        final current = _notifications[index];
        _notifications[index] = NotifikasiModel(
          notifikasiId: current.notifikasiId,
          penerimaUserId: current.penerimaUserId,
          pesan: current.pesan,
          linkTujuan: current.linkTujuan,
          isRead: 1,
          createdAt: current.createdAt,
        );
        notifyListeners();
      }
      return true;
    } catch (e) {
      developer.log("Error marking notification as read: $e");
      return false;
    }
  }

  Future<bool> markAllAsRead() async {
    try {
      await _service.markAllAsRead();
      
      _notifications = _notifications.map((n) {
        if (n.isRead == 0) {
          return NotifikasiModel(
            notifikasiId: n.notifikasiId,
            penerimaUserId: n.penerimaUserId,
            pesan: n.pesan,
            linkTujuan: n.linkTujuan,
            isRead: 1,
            createdAt: n.createdAt,
          );
        }
        return n;
      }).toList();
      notifyListeners();
      return true;
    } catch (e) {
      developer.log("Error marking all notifications as read: $e");
      return false;
    }
  }
}
