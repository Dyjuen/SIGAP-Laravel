import 'package:flutter/material.dart';
import '../services/master_data_service.dart';

class MasterDataProvider extends ChangeNotifier {
  final MasterDataService _service;
  bool _isLoading = false;
  String? _error;

  MasterDataProvider(this._service);

  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> store(String type, Map<String, dynamic> data) async {
    _setLoading(true);
    try {
      await _service.store(type, data);
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      rethrow;
    }
  }

  Future<void> update(String type, String id, Map<String, dynamic> data) async {
    _setLoading(true);
    try {
      await _service.update(type, id, data);
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      rethrow;
    }
  }

  Future<void> delete(String type, String id) async {
    _setLoading(true);
    try {
      await _service.delete(type, id);
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      rethrow;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String? value) {
    _error = value;
    notifyListeners();
  }
}
