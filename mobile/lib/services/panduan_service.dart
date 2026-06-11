import 'package:dio/dio.dart';
import '../models/panduan_model.dart';
import 'api_service.dart';

class PanduanService {
  final Dio _dio;

  PanduanService(this._dio);

  Future<List<Panduan>> getPanduans() async {
    final response = await _dio.get('${ApiService.baseUrl}/admin/panduan');
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data; // The backend returns the list directly
      return data.map((item) => Panduan.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load panduan');
    }
  }

  Future<void> storePanduan(Map<String, dynamic> data) async {
    final response = await _dio.post(
      '${ApiService.baseUrl}/admin/panduan',
      data: FormData.fromMap(data),
      options: Options(headers: {'Accept': 'application/json'}),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to store panduan');
    }
  }
}
