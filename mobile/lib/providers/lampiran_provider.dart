import 'package:flutter/material.dart';
import '../models/lampiran_model.dart';
import '../services/lampiran_service.dart';

class LampiranProvider with ChangeNotifier {
  final LampiranService _lampiranService;

  List<LampiranModel> _lampiran = [];
  LampiranModel? _selectedLampiran;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isUploading = false;
  double _uploadProgress = 0.0;

  LampiranProvider(this._lampiranService);

  // Getters
  List<LampiranModel> get lampiran => _lampiran;
  LampiranModel? get selectedLampiran => _selectedLampiran;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isUploading => _isUploading;
  double get uploadProgress => _uploadProgress;

  /// Fetch lampiran for a specific anggaran
  Future<void> fetchLampiran(String anggaranId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _lampiran = await _lampiranService.getLampiranByAnggaran(anggaranId);
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get lampiran detail
  Future<void> getLampiranDetail(String lampiranId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _selectedLampiran =
          await _lampiranService.getLampiranDetail(lampiranId);
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Upload new lampiran
  Future<LampiranModel?> uploadLampiran({
    required String anggaranId,
    required String filePath,
    required String fileName,
    String? catatan,
  }) async {
    _isUploading = true;
    _uploadProgress = 0.0;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _lampiranService.uploadLampiran(
        anggaranId: anggaranId,
        filePath: filePath,
        fileName: fileName,
        catatan: catatan,
      );

      // Add to list if not already there
      if (!_lampiran.any((l) => l.lampiranId == result.lampiranId)) {
        _lampiran.add(result);
      }

      _errorMessage = null;
      _uploadProgress = 1.0;
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      return null;
    } finally {
      _isUploading = false;
      Future.delayed(const Duration(seconds: 1), () {
        _uploadProgress = 0.0;
        notifyListeners();
      });
      notifyListeners();
    }
  }

  /// Resubmit lampiran after revision
  Future<LampiranModel?> resubmitLampiran({
    required String lampiranId,
    required String filePath,
    required String fileName,
    String? catatan,
  }) async {
    _isUploading = true;
    _uploadProgress = 0.0;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _lampiranService.resubmitLampiran(
        lampiranId: lampiranId,
        filePath: filePath,
        fileName: fileName,
        catatan: catatan,
      );

      // Replace old lampiran with new one
      final index =
          _lampiran.indexWhere((l) => l.lampiranId == lampiranId);
      if (index != -1) {
        _lampiran[index] = result;
      } else {
        _lampiran.add(result);
      }

      _errorMessage = null;
      _uploadProgress = 1.0;
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      return null;
    } finally {
      _isUploading = false;
      Future.delayed(const Duration(seconds: 1), () {
        _uploadProgress = 0.0;
        notifyListeners();
      });
      notifyListeners();
    }
  }

  /// Delete lampiran
  Future<bool> deleteLampiran(String lampiranId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _lampiranService.deleteLampiran(lampiranId);

      _lampiran.removeWhere((l) => l.lampiranId == lampiranId);
      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save reviewer notes
  Future<bool> saveCatatan({
    required String lampiranId,
    required String catatanReviewer,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _lampiranService.saveCatatan(
        lampiranId: lampiranId,
        catatanReviewer: catatanReviewer,
      );

      // Update in list
      final index =
          _lampiran.indexWhere((l) => l.lampiranId == lampiranId);
      if (index != -1) {
        _lampiran[index] = result;
      }

      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Approve lampiran
  Future<bool> approveLampiran(String lampiranId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _lampiranService.approveLampiran(lampiranId);

      // Update in list
      final index =
          _lampiran.indexWhere((l) => l.lampiranId == lampiranId);
      if (index != -1) {
        _lampiran[index] = result;
      }

      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get lampiran history
  Future<List<LampiranModel>> getLampiranHistory(String lampiranId) async {
    try {
      return await _lampiranService.getLampiranHistory(lampiranId);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return [];
    }
  }

  /// Get download URL
  String getDownloadUrl(String lampiranId) {
    return _lampiranService.getDownloadUrl(lampiranId);
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Reset lampiran list
  void resetLampiran() {
    _lampiran = [];
    _selectedLampiran = null;
    _errorMessage = null;
    _isLoading = false;
    _isUploading = false;
    _uploadProgress = 0.0;
    notifyListeners();
  }
}
