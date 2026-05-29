import 'package:dio/dio.dart';
import '../models/kak_model.dart';

class KakService {
  final Dio dio;

  KakService(this.dio);

  /// Fetch KAK detail by ID from `/api/kak/{id}`
  Future<KakDetail> getKakDetail(String kakId) async {
    try {
      final response = await dio.get(
        '/kak/$kakId',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return KakDetail.fromJson(response.data);
      }
      throw Exception('Failed to load KAK detail');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch all KAKs with optional search
  Future<List<KakDetail>> getAllKaks({String? search}) async {
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
        final List<dynamic> data = response.data ?? [];
        return data
            .map((item) => KakDetail.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to load KAKs');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Create new KAK (Pengusul only)
  /// Expected request structure from store method
  Future<KakDetail> createKak(Map<String, dynamic> kakData) async {
    try {
      final response = await dio.post(
        '/kak',
        data: kakData,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return KakDetail.fromJson(response.data);
      }
      throw Exception('Failed to create KAK');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Update KAK (Pengusul - only draft KAKs)
  Future<KakDetail> updateKak(
    String kakId,
    Map<String, dynamic> kakData,
  ) async {
    try {
      final response = await dio.put(
        '/kak/$kakId',
        data: kakData,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return KakDetail.fromJson(response.data);
      }
      throw Exception('Failed to update KAK');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Submit KAK for review (Pengusul)
  Future<KakDetail> submitKak(String kakId) async {
    try {
      final response = await dio.post(
        '/kak/$kakId/submit',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return KakDetail.fromJson(response.data);
      }
      throw Exception('Failed to submit KAK');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Delete KAK (Pengusul - only draft KAKs)
  Future<void> deleteKak(String kakId) async {
    try {
      final response = await dio.delete(
        '/kak/$kakId',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Failed to delete KAK');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Approve KAK (Verifikator only)
  Future<void> approveKak(String kakId) async {
    try {
      final response = await dio.post(
        '/kak/$kakId/approve',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to approve KAK');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Reject KAK (Verifikator only)
  Future<void> rejectKak(String kakId, String catatan) async {
    try {
      final response = await dio.post(
        '/kak/$kakId/reject',
        data: {'catatan': catatan},
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to reject KAK');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Request Revision (Verifikator only)
  Future<void> reviseKak(
    String kakId,
    String? catatan,
    Map<String, String>? catatanFields,
  ) async {
    try {
      final data = <String, dynamic>{'catatan': catatan};
      if (catatanFields != null) {
        data['catatan_kak'] = catatanFields;
      }

      final response = await dio.post(
        '/kak/$kakId/revise',
        data: data,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to request revision');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Resubmit Revised KAK (Pengusul only)
  Future<void> resubmitKak(String kakId) async {
    try {
      final response = await dio.post(
        '/kak/$kakId/resubmit',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to resubmit KAK');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Error handling for DioException
  String _handleDioException(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        return data['message'] ?? 'Terjadi kesalahan saat memuat KAK detail';
      }
      return 'Error ${e.response?.statusCode}: ${e.response?.statusMessage}';
    }
    return e.message ?? 'Terjadi kesalahan jaringan';
  }
}
