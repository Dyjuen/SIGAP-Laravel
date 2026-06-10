import 'package:dio/dio.dart';
import '../models/notifikasi_model.dart';

class NotificationService {
  final Dio dio;

  NotificationService(this.dio);

  /**
   * Fetch paginated notifications for the authenticated user.
   */
  Future<List<NotifikasiModel>> getNotifications() async {
    try {
      final response = await dio.get(
        '/notifications',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final dynamic rawData = response.data;
        if (rawData is Map<String, dynamic>) {
          final List<dynamic> dataList = rawData['data'] ?? [];
          return dataList.map((json) => NotifikasiModel.fromJson(json)).toList();
        }
        return [];
      }
      throw Exception('Gagal memuat notifikasi.');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /**
   * Mark a single notification as read.
   */
  Future<void> markAsRead(int notificationId) async {
    try {
      final response = await dio.post(
        '/notifications/$notificationId/read',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Gagal menandai notifikasi dibaca.');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /**
   * Mark all unread notifications as read.
   */
  Future<void> markAllAsRead() async {
    try {
      final response = await dio.post(
        '/notifications/read-all',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Gagal menandai semua notifikasi dibaca.');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  String _handleDioException(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        return data['message'] ?? 'Terjadi kesalahan pada server.';
      }
      return 'Error ${e.response?.statusCode}: ${e.response?.statusMessage}';
    }
    return e.message ?? 'Terjadi kesalahan jaringan.';
  }
}
