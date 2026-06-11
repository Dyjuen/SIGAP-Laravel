import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class MasterDataService {
  final Dio dio;

  MasterDataService(this.dio);

  /// Fetch Tipe Kegiatan (Activity Type)
  Future<List<dynamic>> getTipeKegiatan() async {
    try {
      final response = await dio.get(
        '/master/tipe-kegiatan',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map<String, dynamic> && data.containsKey('data')) {
          return data['data'] as List<dynamic>;
        }
        return data as List<dynamic>;
      }
      throw Exception('Failed to load tipe kegiatan');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Mata Anggaran (Budget Source)
  Future<List<dynamic>> getMataAnggaran() async {
    try {
      final response = await dio.get(
        '/master/mata-anggaran',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map<String, dynamic> && data.containsKey('data')) {
          return data['data'] as List<dynamic>;
        }
        return data as List<dynamic>;
      }
      throw Exception('Failed to load mata anggaran');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Kategori Belanja (Expense Category)
  Future<List<dynamic>> getKategoriBelanja() async {
    try {
      final response = await dio.get(
        '/master/kategori-belanja',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map<String, dynamic> && data.containsKey('data')) {
          return data['data'] as List<dynamic>;
        }
        return data as List<dynamic>;
      }
      throw Exception('Failed to load kategori belanja');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Satuan (Unit)
  Future<List<dynamic>> getSatuan() async {
    try {
      final response = await dio.get(
        '/master/satuan',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map<String, dynamic> && data.containsKey('data')) {
          return data['data'] as List<dynamic>;
        }
        return data as List<dynamic>;
      }
      throw Exception('Failed to load satuan');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch IKU (Key Performance Indicators)
  Future<List<dynamic>> getIku() async {
    try {
      final response = await dio.get(
        '/master/iku',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map<String, dynamic> && data.containsKey('data')) {
          return data['data'] as List<dynamic>;
        }
        return data as List<dynamic>;
      }
      throw Exception('Failed to load IKU');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Fetch Roles
  Future<List<dynamic>> getRoles() async {
    try {
      final response = await dio.get(
        '/admin/master/roles',
        options: Options(headers: {'Accept': 'application/json'}),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        debugPrint('DEBUG: API Roles Response: $data');
        
        // Structure is: { "items": { "data": [...] } }
        if (data is Map<String, dynamic> && 
            data.containsKey('items') && 
            data['items'] is Map<String, dynamic> && 
            (data['items'] as Map<String, dynamic>).containsKey('data')) {
          return (data['items'] as Map<String, dynamic>)['data'] as List<dynamic>;
        }
        
        // Fallback for unexpected structures
        debugPrint('DEBUG: Unexpected API structure. Cannot extract list of roles.');
        return [];
      }
      throw Exception('Failed to load roles');
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  /// Error handling for DioException
  String _handleDioException(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        return data['message'] ?? 'Terjadi kesalahan saat memuat data master';
      }
      return 'Error ${e.response?.statusCode}: ${e.response?.statusMessage}';
    }
    return e.message ?? 'Terjadi kesalahan jaringan';
  }
}
