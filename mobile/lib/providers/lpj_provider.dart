import 'package:flutter/material.dart';
import '../models/lpj_model.dart';
import '../services/lpj_service.dart';

class LpjProvider with ChangeNotifier {
  final LpjService _lpjService;

  List<LpjListItem> _lpjList = [];
  LpjDetail? _selectedLpj;
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  LpjProvider(this._lpjService);

  // Getters
  List<LpjListItem> get lpjList => _lpjList;
  LpjDetail? get selectedLpj => _selectedLpj;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  /// Fetch LPJ list
  Future<void> fetchLpjList({String? search, String? statusFilter}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _lpjList = await _lpjService.getLpjList(
        search: search,
        statusFilter: statusFilter,
      );
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get LPJ detail
  Future<void> getLpjDetail(String kegiatanId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _selectedLpj = await _lpjService.getLpjDetail(kegiatanId);
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Submit LPJ (Pengusul)
  Future<bool> submitLpj({
    required String kegiatanId,
    required List<Map<String, dynamic>> realizasiData,
    List<String>? buktiFilePaths,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _lpjService.submitLpj(
        kegiatanId: kegiatanId,
        realizasiData: realizasiData,
        buktiFilePaths: buktiFilePaths,
      );

      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Approve LPJ (Bendahara)
  Future<bool> approveLpj(String kegiatanId) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _lpjService.approveLpj(kegiatanId);

      // Refresh detail
      if (_selectedLpj?.kegiatanId == kegiatanId) {
        await getLpjDetail(kegiatanId);
      }

      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Request revision for LPJ (Bendahara)
  Future<bool> reviseLpj({
    required String kegiatanId,
    required String catatan,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final comments =
          _selectedLpj?.anggaranItems
              .map((item) {
                final anggaranId = int.tryParse(item.anggaranId);
                if (anggaranId == null) {
                  return null;
                }

                return {'id': anggaranId, 'catatan_reviewer': catatan};
              })
              .whereType<Map<String, dynamic>>()
              .toList() ??
          [];

      await _lpjService.reviseLpj(
        kegiatanId: kegiatanId,
        anggaranComments: comments,
      );

      // Refresh detail
      if (_selectedLpj?.kegiatanId == kegiatanId) {
        await getLpjDetail(kegiatanId);
      }

      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Resubmit LPJ after revision (Pengusul)
  Future<bool> resubmitLpj({
    required String kegiatanId,
    required List<Map<String, dynamic>> realizasiData,
    List<String>? buktiFilePaths,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _lpjService.resubmitLpj(
        kegiatanId: kegiatanId,
        realizasiData: realizasiData,
        buktiFilePaths: buktiFilePaths,
      );

      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Complete LPJ (Bendahara)
  Future<bool> completeLpj(String kegiatanId) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _lpjService.completeLpj(kegiatanId);

      // Refresh detail
      if (_selectedLpj?.kegiatanId == kegiatanId) {
        await getLpjDetail(kegiatanId);
      }

      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Reset LPJ state
  void resetLpj() {
    _lpjList = [];
    _selectedLpj = null;
    _errorMessage = null;
    _isLoading = false;
    _isSubmitting = false;
    notifyListeners();
  }
}
