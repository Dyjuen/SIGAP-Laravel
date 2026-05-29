import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;

  User? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;
  bool get isLoading => _isLoading;

  Future<bool> checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.containsKey('auth_token') && prefs.containsKey('user_data')) {
      _token = prefs.getString('auth_token');
      final userData = jsonDecode(prefs.getString('user_data')!);
      _user = User.fromJson(userData);
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<String?> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.post('/login', {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _user = User.fromJson(data['user']);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));

        _isLoading = false;
        notifyListeners();
        return null; // Success
      } else {
        final data = jsonDecode(response.body);
        _isLoading = false;
        notifyListeners();
        return data['message'] ?? 'Login gagal';
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return 'Terjadi kesalahan koneksi.';
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.post('/logout', {});
    } catch (e) {
      // Ignore network errors on logout, just clear local state
    }

    _token = null;
    _user = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');

    _isLoading = false;
    notifyListeners();
  }
}
