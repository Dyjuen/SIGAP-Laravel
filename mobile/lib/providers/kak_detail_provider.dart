import 'package:flutter/foundation.dart';
import '../models/kak_model.dart';
import '../services/kak_service.dart';

class KakDetailProvider extends ChangeNotifier {
  final KakService kakService;

  KakDetail? _kakDetail;
  bool _isLoading = false;
  String? _errorMessage;

  KakDetailProvider(this.kakService);

  // Getters
  KakDetail? get kakDetail => _kakDetail;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isError => _errorMessage != null;
  bool get hasData => _kakDetail != null;

  /// Load KAK detail by ID
  Future<void> loadKakDetail(String kakId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _kakDetail = await kakService.getKakDetail(kakId);
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
      _kakDetail = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Update KAK details
  Future<bool> updateKak(String kakId, Map<String, dynamic> kakData) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _kakDetail = await kakService.updateKak(kakId, kakData);
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Submit KAK for review (change status)
  Future<bool> submitKak() async {
    if (_kakDetail == null) return false;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _kakDetail = await kakService.submitKak(_kakDetail!.kakId);
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Delete KAK (only for draft)
  Future<bool> deleteKak() async {
    if (_kakDetail == null) return false;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await kakService.deleteKak(_kakDetail!.kakId);
      _kakDetail = null;
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Retry loading
  Future<void> retry(String kakId) async {
    await loadKakDetail(kakId);
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Clear all data
  void clear() {
    _kakDetail = null;
    _errorMessage = null;
    _isLoading = false;
    notifyListeners();
  }
}
