import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // ─────────────────────────────────────────────────────────────────────────
  // KONFIGURASI URL SERVER LARAVEL
  //
  // Emulator Android    → pakai 10.0.2.2 (sudah otomatis)
  // Perangkat fisik     → ganti IP_SERVER di bawah dengan IP lokal PC kamu
  //                       (cek dengan `ipconfig` di Windows, cari IPv4)
  //
  // Contoh: static const _physicalDeviceIp = '192.168.1.5';
  // ─────────────────────────────────────────────────────────────────────────
  static String get baseUrl {
    // Gunakan URL produksi langsung
    return 'https://sigap.laravel.wattaway.id/api';
  }

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<http.Response> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final headers = await _getHeaders();
    return http
        .post(
          Uri.parse('$baseUrl$endpoint'),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));
  }

  static Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    return http
        .get(Uri.parse('$baseUrl$endpoint'), headers: headers)
        .timeout(const Duration(seconds: 15));
  }

  static Future<http.Response> put(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final headers = await _getHeaders();
    return http
        .put(
          Uri.parse('$baseUrl$endpoint'),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));
  }

  static Future<http.Response> delete(
    String endpoint, {
    Map<String, dynamic>? body,
  }) async {
    final headers = await _getHeaders();
    return http
        .delete(
          Uri.parse('$baseUrl$endpoint'),
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(const Duration(seconds: 15));
  }
}
