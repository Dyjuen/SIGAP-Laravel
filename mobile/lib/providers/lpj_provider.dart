import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
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
    String? realisasiTglMulai,
    String? realisasiTglSelesai,
    int? spkKesesuaianOutput,
    Map<String, List<PlatformFile>>? buktiFiles,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final multipartFiles = <String, List<MultipartFile>>{};

      if (buktiFiles != null) {
        for (final entry in buktiFiles.entries) {
          final files = <MultipartFile>[];
          for (final f in entry.value) {
            if (kIsWeb) {
              if (f.bytes != null) {
                files.add(
                  MultipartFile.fromBytes(
                    f.bytes!,
                    filename: f.name,
                  ),
                );
              }
            } else {
              if (f.path != null) {
                files.add(
                  await MultipartFile.fromFile(
                    f.path!,
                    filename: f.name,
                  ),
                );
              }
            }
          }
          if (files.isNotEmpty) {
            multipartFiles[entry.key] = files;
          }
        }
      }

      await _lpjService.submitLpj(
        kegiatanId: kegiatanId,
        realizasiData: realizasiData,
        realisasiTglMulai: realisasiTglMulai,
        realisasiTglSelesai: realisasiTglSelesai,
        spkKesesuaianOutput: spkKesesuaianOutput,
        buktiFiles: multipartFiles.isEmpty ? null : multipartFiles,
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
    String? catatan,
    List<Map<String, dynamic>>? anggaranComments,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _lpjService.reviseLpj(
        kegiatanId: kegiatanId,
        catatanUmum: catatan,
        anggaranComments: anggaranComments,
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
    String? realisasiTglMulai,
    String? realisasiTglSelesai,
    int? spkKesesuaianOutput,
    Map<String, List<PlatformFile>>? buktiFiles,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final multipartFiles = <String, List<MultipartFile>>{};

      if (buktiFiles != null) {
        for (final entry in buktiFiles.entries) {
          final files = <MultipartFile>[];
          for (final f in entry.value) {
            if (kIsWeb) {
              if (f.bytes != null) {
                files.add(
                  MultipartFile.fromBytes(
                    f.bytes!,
                    filename: f.name,
                  ),
                );
              }
            } else {
              if (f.path != null) {
                files.add(
                  await MultipartFile.fromFile(
                    f.path!,
                    filename: f.name,
                  ),
                );
              }
            }
          }
          if (files.isNotEmpty) {
            multipartFiles[entry.key] = files;
          }
        }
      }

      await _lpjService.resubmitLpj(
        kegiatanId: kegiatanId,
        realizasiData: realizasiData,
        realisasiTglMulai: realisasiTglMulai,
        realisasiTglSelesai: realisasiTglSelesai,
        spkKesesuaianOutput: spkKesesuaianOutput,
        buktiFiles: multipartFiles.isEmpty ? null : multipartFiles,
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
