import 'package:dio/dio.dart';

class PengajuanService {
  final Dio dio;

  PengajuanService(this.dio);

  Future<Map<String, dynamic>> createPengajuan(
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await dio.post(
        '/pengajuan',
        data: data,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        if (response.data is Map<String, dynamic>)
          return response.data as Map<String, dynamic>;
        return {'success': true};
      }

      throw Exception('Failed to create pengajuan');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  String _handleDioException(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        return data['message'] ?? 'Terjadi kesalahan saat membuat pengajuan';
      }
      return 'Error ${e.response?.statusCode}: ${e.response?.statusMessage}';
    }
    return e.message ?? 'Terjadi kesalahan jaringan';
  }
}
