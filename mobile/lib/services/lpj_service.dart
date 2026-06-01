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
    Map<String, List<String>>? buktiFiles,
    int? spkWaktu,
    int? spkOutput,
  }) async {
    try {
      final formData = FormData();

      // Add realization data
      for (int i = 0; i < realizasiData.length; i++) {
        final item = realizasiData[i];
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][volume1]',
            item['volume1']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][satuan1_id]',
            item['satuan1_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][volume2]',
            item['volume2']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][satuan2_id]',
            item['satuan2_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][volume3]',
            item['volume3']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][satuan3_id]',
            item['satuan3_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][harga_satuan]',
            item['harga_satuan']?.toString() ?? '',
          ),
        );
      }

      // Add SPK fields
      if (spkWaktu != null) {
        formData.fields.add(MapEntry('spk_kesesuaian_waktu', spkWaktu.toString()));
      }
      if (spkOutput != null) {
        formData.fields.add(MapEntry('spk_kesesuaian_output', spkOutput.toString()));
      }

      // Add files
      if (buktiFiles != null && buktiFiles.isNotEmpty) {
        for (final entry in buktiFiles.entries) {
          final anggaranId = entry.key;
          final paths = entry.value;
          for (final path in paths) {
            final file = await MultipartFile.fromFile(
              path,
              filename: path.split('/').last,
            );
            formData.files.add(MapEntry('bukti[$anggaranId][]', file));
          }
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
  Future<bool> reviseLpj({
    required String kegiatanId,
    String? catatanUmum,
    List<Map<String, dynamic>>? anggaranComments,
    List<Map<String, dynamic>>? lampiranComments,
  }) async {
    try {
      final payload = <String, dynamic>{};
      if (catatanUmum != null) {
        payload['catatan'] = catatanUmum;
      }
      if (anggaranComments != null) {
        payload['anggaran_comments'] = anggaranComments;
      }
      if (lampiranComments != null) {
        payload['lampiran_comments'] = lampiranComments;
      }

      final response = await dio.post(
        '/kegiatan/$kegiatanId/lpj/revise',
        data: payload,
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to request revision');
      }
      return true;
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Resubmit LPJ after revision (Pengusul)
  Future<void> resubmitLpj({
    required String kegiatanId,
    required List<Map<String, dynamic>> realizasiData,
    Map<String, List<String>>? buktiFiles,
    int? spkWaktu,
    int? spkOutput,
  }) async {
    try {
      final formData = FormData();

      // Add realization data
      for (int i = 0; i < realizasiData.length; i++) {
        final item = realizasiData[i];
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][volume1]',
            item['volume1']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][satuan1_id]',
            item['satuan1_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][volume2]',
            item['volume2']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][satuan2_id]',
            item['satuan2_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][volume3]',
            item['volume3']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][satuan3_id]',
            item['satuan3_id']?.toString() ?? '',
          ),
        );
        formData.fields.add(
          MapEntry(
            'realisasi[${item['anggaran_id']}][harga_satuan]',
            item['harga_satuan']?.toString() ?? '',
          ),
        );
      }

      // Add SPK fields
      if (spkWaktu != null) {
        formData.fields.add(MapEntry('spk_kesesuaian_waktu', spkWaktu.toString()));
      }
      if (spkOutput != null) {
        formData.fields.add(MapEntry('spk_kesesuaian_output', spkOutput.toString()));
      }

      // Add files
      if (buktiFiles != null && buktiFiles.isNotEmpty) {
        for (final entry in buktiFiles.entries) {
          final anggaranId = entry.key;
          final paths = entry.value;
          for (final path in paths) {
            final file = await MultipartFile.fromFile(
              path,
              filename: path.split('/').last,
            );
            formData.files.add(MapEntry('bukti[$anggaranId][]', file));
          }
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
