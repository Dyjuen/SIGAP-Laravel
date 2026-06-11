import 'package:dio/dio.dart';
import '../models/dashboard_model.dart';

class DashboardService {
  final Dio dio;

  DashboardService(this.dio);

  /// Fetch Pengusul Dashboard
  Future<DashboardResponse> getPengusulDashboard() async {
    try {
      // Get stats and recent items using existing routes
      final statsResponse = await dio.get(
        '/pengusul/stats',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      final itemsResponse = await dio.get(
        '/pengusul/recent-kaks',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (statsResponse.statusCode == 200 && itemsResponse.statusCode == 200) {
        // Combine stats and items into a single DashboardResponse
        final combined = {
          'stats': statsResponse.data,
          'recent_kaks': itemsResponse.data ?? [],
        };
        return DashboardResponse.fromJson(combined);
      }
      throw Exception('Failed to load Pengusul dashboard');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Verifikator Dashboard
  Future<DashboardResponse> getVerifikatorDashboard() async {
    try {
      final response = await dio.get(
        '/verifikator/dashboard',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return DashboardResponse.fromJson(response.data);
      }
      throw Exception('Failed to load Verifikator dashboard');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch PPK Dashboard
  Future<DashboardResponse> getPpkDashboard() async {
    try {
      final response = await dio.get(
        '/ppk/dashboard',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return DashboardResponse.fromJson(response.data);
      }
      throw Exception('Failed to load PPK dashboard');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Wadir Dashboard
  Future<DashboardResponse> getWadirDashboard() async {
    try {
      final response = await dio.get(
        '/wadir/dashboard',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return DashboardResponse.fromJson(response.data);
      }
      throw Exception('Failed to load Wadir dashboard');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Bendahara Dashboard
  Future<DashboardResponse> getBendaharaDashboard() async {
    try {
      final response = await dio.get(
        '/bendahara/dashboard',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return DashboardResponse.fromJson(response.data);
      }
      throw Exception('Failed to load Bendahara dashboard');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Direktur Dashboard (full payload with TOPSIS, trends, overview)
  Future<DirektorDashboardData> getDirektorDashboardFull(String period) async {
    try {
      final response = await dio.get(
        '/direktur/dashboard',
        queryParameters: {'period': period},
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return DirektorDashboardData.fromJson(
            response.data as Map<String, dynamic>);
      }
      throw Exception('Failed to load Direktur dashboard');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Direktur Dashboard (legacy — returns DashboardResponse for compat)
  Future<DashboardResponse> getDirektorDashboard() async {
    try {
      final response = await dio.get(
        '/direktur/dashboard',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return DashboardResponse.fromJson(response.data);
      }
      throw Exception('Failed to load Direktur dashboard');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Get dashboard based on role
  Future<DashboardResponse> getDashboardByRole(String roleName) async {
    switch (roleName.toLowerCase()) {
      case 'pengusul':
        return getPengusulDashboard();
      case 'verifikator':
        return getVerifikatorDashboard();
      case 'ppk':
        return getPpkDashboard();
      case 'bendahara':
        return getBendaharaDashboard();
      case 'direktur':
      case 'rektorat':
      case 'wadir':
        return getWadirDashboard();
      default:
        throw Exception('Role tidak dikenal: $roleName');
    }
  }

  /// Error handling for DioException
  String _handleDioException(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        return data['message'] ?? 'Terjadi kesalahan saat memuat dashboard';
      }
      return 'Error ${e.response?.statusCode}: ${e.response?.statusMessage}';
    } else if (e.type == DioExceptionType.connectionTimeout) {
      return 'Koneksi timeout. Periksa internet Anda.';
    } else if (e.type == DioExceptionType.receiveTimeout) {
      return 'Server tidak merespons. Coba lagi.';
    } else {
      return e.message ?? 'Terjadi kesalahan';
    }
  }
}
