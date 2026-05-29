import 'package:dio/dio.dart';
import '../models/lpj_model.dart';

class LpjService {
  final Dio dio;

  LpjService(this.dio);

  /// Get list of LPJ items
  Future<List<LpjListItem>> getLpjList({
    String? search,
    String? statusFilter,
  }) async {
    try {
      final params = <String, dynamic>{};
      if (search != null && search.isNotEmpty) {
        params['search'] = search;
      }
      if (statusFilter != null && statusFilter.isNotEmpty) {
        params['status_filter'] = statusFilter;
      }

      final response = await dio.get(
        '/lpj',
        queryParameters: params,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data
            .map((item) => LpjListItem.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to load LPJ list');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Get LPJ detail for a specific kegiatan
  Future<LpjDetail> getLpjDetail(String kegiatanId) async {
    try {
      final response = await dio.get(
        '/lpj/$kegiatanId',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        return LpjDetail.fromJson(response.data['data'] ?? response.data);
      }
      throw Exception('Failed to load LPJ detail');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Submit LPJ with realization data and evidence files
  Future<void> submitLpj({
    required String kegiatanId,
    required List<Map<String, dynamic>> realizasiData,
    List<String>? buktiFilePaths,
  }) async {
    try {
      final formData = FormData();

      // Add realization data
      for (int i = 0; i < realizasiData.length; i++) {
        final item = realizasiData[i];
        formData.fields.add(
          MapEntry(
            'realisasi[$i][anggaran_id]',
            item['anggaran_id'].toString(),
          ),
        );
        formData.fields.add(
          MapEntry('realisasi[$i][volume1]', item['volume1']?.toString() ?? ''),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[$i][satuan1_id]',
            item['satuan1_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry('realisasi[$i][volume2]', item['volume2']?.toString() ?? ''),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[$i][satuan2_id]',
            item['satuan2_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry('realisasi[$i][volume3]', item['volume3']?.toString() ?? ''),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[$i][satuan3_id]',
            item['satuan3_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[$i][harga_satuan]',
            item['harga_satuan']?.toString() ?? '',
          ),
        );
      }

      // Add files
      if (buktiFilePaths != null && buktiFilePaths.isNotEmpty) {
        for (int i = 0; i < buktiFilePaths.length; i++) {
          final file = await MultipartFile.fromFile(
            buktiFilePaths[i],
            filename: buktiFilePaths[i].split('/').last,
          );
          formData.files.add(MapEntry('bukti_files[$i]', file));
        }
      }

      final response = await dio.post(
        '/kegiatan/$kegiatanId/lpj/submit',
        data: formData,
        options: Options(
          headers: {'Accept': 'application/json'},
          contentType: 'multipart/form-data',
        ),
      );

      if (response.statusCode != 201 && response.statusCode != 200) {
        throw Exception('Failed to submit LPJ');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Approve LPJ (Bendahara)
  Future<void> approveLpj(String kegiatanId) async {
    try {
      final response = await dio.post(
        '/kegiatan/$kegiatanId/lpj/approve',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to approve LPJ');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Request revision for LPJ (Bendahara)
  Future<void> reviseLpj({
    required String kegiatanId,
    required String catatan,
  }) async {
    try {
      final response = await dio.post(
        '/kegiatan/$kegiatanId/lpj/revise',
        data: {'catatan': catatan},
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to request revision');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Resubmit LPJ after revision (Pengusul)
  Future<void> resubmitLpj({
    required String kegiatanId,
    required List<Map<String, dynamic>> realizasiData,
    List<String>? buktiFilePaths,
  }) async {
    try {
      final formData = FormData();

      // Add realization data
      for (int i = 0; i < realizasiData.length; i++) {
        final item = realizasiData[i];
        formData.fields.add(
          MapEntry(
            'realisasi[$i][anggaran_id]',
            item['anggaran_id'].toString(),
          ),
        );
        formData.fields.add(
          MapEntry('realisasi[$i][volume1]', item['volume1']?.toString() ?? ''),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[$i][satuan1_id]',
            item['satuan1_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry('realisasi[$i][volume2]', item['volume2']?.toString() ?? ''),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[$i][satuan2_id]',
            item['satuan2_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry('realisasi[$i][volume3]', item['volume3']?.toString() ?? ''),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[$i][satuan3_id]',
            item['satuan3_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[$i][harga_satuan]',
            item['harga_satuan']?.toString() ?? '',
          ),
        );
      }

      // Add files
      if (buktiFilePaths != null && buktiFilePaths.isNotEmpty) {
        for (int i = 0; i < buktiFilePaths.length; i++) {
          final file = await MultipartFile.fromFile(
            buktiFilePaths[i],
            filename: buktiFilePaths[i].split('/').last,
          );
          formData.files.add(MapEntry('bukti_files[$i]', file));
        }
      }

      final response = await dio.post(
        '/kegiatan/$kegiatanId/lpj/resubmit',
        data: formData,
        options: Options(
          headers: {'Accept': 'application/json'},
          contentType: 'multipart/form-data',
        ),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to resubmit LPJ');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Complete LPJ (Bendahara)
  Future<void> completeLpj(String kegiatanId) async {
    try {
      final response = await dio.post(
        '/kegiatan/$kegiatanId/lpj/complete',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to complete LPJ');
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
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
