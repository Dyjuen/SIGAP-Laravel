import 'package:dio/dio.dart';
import '../models/dashboard_model.dart';

class MonitoringService {
  final Dio dio;

  MonitoringService(this.dio);

  /// Fetch all KAKs for monitoring
  Future<List<DashboardItem>> getAllKaks({
    String? search,
    String? statusFilter,
  }) async {
    try {
      final params = <String, dynamic>{};
      if (search != null && search.isNotEmpty) {
        params['search'] = search;
      }

      final response = await dio.get(
        '/kak',
        queryParameters: params,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final dynamic rawData = response.data;
        final List<dynamic> data;
        if (rawData is Map && rawData.containsKey('data')) {
          data = rawData['data'] as List<dynamic>;
        } else if (rawData is List) {
          data = rawData;
        } else {
          data = [];
        }
        return data.map((item) {
          return DashboardItem(
            id: item['kak_id']?.toString() ?? '',
            nama: item['nama_kegiatan'] ?? '',
            pengusulNama: item['pengusul_nama'],
            tipe: item['tipe'],
            status: item['status_nama'] ?? 'Draft',
            tanggalMulai: item['tanggal_mulai'],
            tanggalSelesai: item['tanggal_selesai'],
            createdAt: item['updated_at'],
          );
        }).toList();
      }
      throw Exception('Failed to load KAKs');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Filter items by status
  List<DashboardItem> filterByStatus(
    List<DashboardItem> items,
    String? statusFilter,
  ) {
    if (statusFilter == null || statusFilter == 'Semua') {
      return items;
    }

    final statusMap = {
      'Menunggu': ['Draft', 'Review'],
      'Disetujui': ['Approved'],
      'Ditolak': ['Rejected'],
      'Proses': ['Processing'],
    };

    final statuses = statusMap[statusFilter] ?? [];
    return items.where((item) => statuses.contains(item.status)).toList();
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
