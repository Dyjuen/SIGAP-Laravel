import 'package:dio/dio.dart';
import '../models/monitoring_model.dart';

class MonitoringService {
  final Dio dio;

  MonitoringService(this.dio);

  /// Fetch monitoring data from the same endpoint used by web.
  Future<MonitoringResponse> getMonitoring({String? search}) async {
    try {
      final params = <String, dynamic>{};
      if (search != null && search.isNotEmpty) {
        params['search'] = search;
      }

      final response = await dio.get(
        '/kegiatan/monitoring',
        queryParameters: params,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final dynamic rawData = response.data;
        if (rawData is Map<String, dynamic>) {
          return MonitoringResponse.fromJson(rawData);
        }
        return const MonitoringResponse(
          items: [],
          stats: MonitoringStats(total: 0, running: 0, completed: 0),
        );
      }
      throw Exception('Failed to load monitoring data');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Filter items by status
  List<MonitoringItem> filterByStatus(
    List<MonitoringItem> items,
    String? statusFilter,
  ) {
    if (statusFilter == null || statusFilter == 'Semua') {
      return items;
    }

    if (statusFilter == 'Sedang Berjalan') {
      return items.where((item) => item.status < 6).toList();
    }
    if (statusFilter == 'Telah Selesai') {
      return items.where((item) => item.status >= 6).toList();
    }
    return items;
  }

  /// Get status background color (Dart hex format)
  String getStatusBackgroundColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'DISETUJUI':
        return '0xFFE8F5E9'; // Green
      case 'REVIEW':
      case 'PENDING':
      case 'MENUNGGU':
        return '0xFFFFF3E0'; // Orange
      case 'REJECTED':
      case 'DITOLAK':
        return '0xFFFFEBEE'; // Red
      case 'PROCESSING':
      case 'PROSES':
        return '0xFFE3F2FD'; // Blue
      default:
        return '0xFFF5F5F5'; // Gray
    }
  }

  /// Get status text color (Dart hex format)
  String getStatusTextColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'DISETUJUI':
        return '0xFF2E7D32'; // Green
      case 'REVIEW':
      case 'PENDING':
      case 'MENUNGGU':
        return '0xFFE65100'; // Orange
      case 'REJECTED':
      case 'DITOLAK':
        return '0xFFC62828'; // Red
      case 'PROCESSING':
      case 'PROSES':
        return '0xFF1565C0'; // Blue
      default:
        return '0xFF666666'; // Gray
    }
  }

  /// Error handling for DioException
  String _handleDioException(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        return data['message'] ??
            'Terjadi kesalahan saat memuat data monitoring';
      }
      return 'Error ${e.response?.statusCode}: ${e.response?.statusMessage}';
    }
    return e.message ?? 'Terjadi kesalahan jaringan';
  }
}
