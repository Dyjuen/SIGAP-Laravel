import 'package:dio/dio.dart';
import '../models/pencairan_model.dart';

class PencairanService {
  final Dio dio;

  PencairanService(this.dio);

  /// Get list of activities ready for disbursement
  Future<List<PencairanItem>> getPencairanList() async {
    try {
      final response = await dio.get(
        '/pencairan',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data ?? [];
        return data
            .map((item) => PencairanItem.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Gagal memuat daftar pencairan');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Store a new disbursement transaction
  Future<void> storePencairan({
    required String kegiatanId,
    required double nominal,
    String? keterangan,
  }) async {
    try {
      final response = await dio.post(
        '/kegiatan/$kegiatanId/pencairan',
        data: {
          'nominal_pencairan': nominal,
          if (keterangan != null && keterangan.isNotEmpty) 'keterangan': keterangan,
        },
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Gagal menyimpan pencairan');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Complete the disbursement phase for a kegiatan
  Future<void> selesaiPencairan(String kegiatanId) async {
    try {
      final response = await dio.post(
        '/kegiatan/$kegiatanId/pencairan/selesai',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Gagal menyelesaikan proses pencairan');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Get sisa dana (remaining balance) for a kegiatan
  Future<Map<String, dynamic>> getSisaDana(String kegiatanId) async {
    try {
      final response = await dio.get(
        '/kegiatan/$kegiatanId/pencairan/sisa-dana',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Gagal mengambil data sisa dana');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Handle Dio exceptions and return user-friendly messages
  String _handleDioException(DioException e) {
    if (e.type == DioExceptionType.badResponse) {
      if (e.response?.data is Map) {
        final data = e.response?.data;
        // Check for specific validation errors structure
        if (data['errors'] != null && data['errors'] is Map) {
          final errors = data['errors'] as Map;
          if (errors.isNotEmpty) {
            final firstErrorList = errors.values.first;
            if (firstErrorList is List && firstErrorList.isNotEmpty) {
              return firstErrorList.first.toString();
            }
          }
        }
        return data['message'] ?? 'Permintaan gagal';
      }
      return 'Kesalahan server: ${e.response?.statusCode}';
    }
    return e.message ?? 'Terjadi kesalahan koneksi';
  }
}
