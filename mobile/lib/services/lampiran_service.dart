import 'package:dio/dio.dart';
import '../models/lampiran_model.dart';

class LampiranService {
  final Dio dio;

  LampiranService(this.dio);

  /// Fetch all lampiran for a specific anggaran (budget item)
  Future<List<LampiranModel>> getLampiranByAnggaran(String anggaranId) async {
    try {
      final response = await dio.get(
        '/lampiran/anggaran/$anggaranId',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data
            .map((item) => LampiranModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to load lampiran');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Get lampiran detail by ID
  Future<LampiranModel> getLampiranDetail(String lampiranId) async {
    try {
      final response = await dio.get(
        '/lampiran/$lampiranId',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return LampiranModel.fromJson(response.data['data'] ?? response.data);
      }
      throw Exception('Failed to load lampiran detail');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Upload a new lampiran file
  /// Returns the created lampiran model
  Future<LampiranModel> uploadLampiran({
    required String anggaranId,
    required String filePath,
    required String fileName,
    String? catatan,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          filePath,
          filename: fileName,
        ),
        if (catatan != null && catatan.isNotEmpty) 'catatan': catatan,
      });

      final response = await dio.post(
        '/lampiran/anggaran/$anggaranId',
        data: formData,
        options: Options(
          headers: {'Accept': 'application/json'},
          contentType: 'multipart/form-data',
        ),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return LampiranModel.fromJson(response.data['data'] ?? response.data);
      }
      throw Exception('Failed to upload lampiran');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Resubmit lampiran after revision
  Future<LampiranModel> resubmitLampiran({
    required String lampiranId,
    required String filePath,
    required String fileName,
    String? catatan,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          filePath,
          filename: fileName,
        ),
        if (catatan != null && catatan.isNotEmpty) 'catatan': catatan,
      });

      final response = await dio.post(
        '/lampiran/$lampiranId/resubmit',
        data: formData,
        options: Options(
          headers: {'Accept': 'application/json'},
          contentType: 'multipart/form-data',
        ),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return LampiranModel.fromJson(response.data['data'] ?? response.data);
      }
      throw Exception('Failed to resubmit lampiran');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Delete/archive a lampiran
  Future<void> deleteLampiran(String lampiranId) async {
    try {
      final response = await dio.delete(
        '/lampiran/$lampiranId',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete lampiran');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Save reviewer notes and request revision
  Future<LampiranModel> saveCatatan({
    required String lampiranId,
    required String catatanReviewer,
  }) async {
    try {
      final response = await dio.post(
        '/lampiran/$lampiranId/catatan',
        data: {
          'catatan_reviewer': catatanReviewer,
        },
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return LampiranModel.fromJson(response.data['data'] ?? response.data);
      }
      throw Exception('Failed to save catatan');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Approve a lampiran
  Future<LampiranModel> approveLampiran(String lampiranId) async {
    try {
      final response = await dio.post(
        '/lampiran/$lampiranId/approve',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return LampiranModel.fromJson(response.data['data'] ?? response.data);
      }
      throw Exception('Failed to approve lampiran');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Get lampiran approval history
  Future<List<LampiranModel>> getLampiranHistory(String lampiranId) async {
    try {
      final response = await dio.get(
        '/lampiran/$lampiranId/history',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data
            .map((item) => LampiranModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to load lampiran history');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Get download URL for a lampiran file
  String getDownloadUrl(String lampiranId) {
    return '${dio.options.baseUrl}/lampiran/$lampiranId/stream';
  }

  /// Handle Dio exceptions
  String _handleDioException(DioException e) {
    if (e.type == DioExceptionType.badResponse) {
      if (e.response?.data is Map) {
        final message = e.response?.data['message'] ?? 'Request failed';
        return message;
      }
      return 'Server error: ${e.response?.statusCode}';
    }
    return e.message ?? 'An error occurred';
  }
}
