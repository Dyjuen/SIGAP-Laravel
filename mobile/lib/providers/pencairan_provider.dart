import 'package:flutter/material.dart';
import '../models/pencairan_model.dart';
import '../services/pencairan_service.dart';

class PencairanProvider with ChangeNotifier {
  final PencairanService _pencairanService;

  List<PencairanItem> _items = [];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  PencairanProvider(this._pencairanService);

  // Getters
  List<PencairanItem> get items => _items;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  /// Fetch list of activities ready for disbursement
  Future<void> fetchList() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _items = await _pencairanService.getPencairanList();
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Record a new disbursement transaction
  Future<bool> storePencairan({
    required String kegiatanId,
    required double nominal,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _pencairanService.storePencairan(
        kegiatanId: kegiatanId,
        nominal: nominal,
      );
      _errorMessage = null;
      // Refresh list to show updated totals/sisa
      await fetchList();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Complete the disbursement phase for a kegiatan
  Future<bool> selesaiPencairan(String kegiatanId) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _pencairanService.selesaiPencairan(kegiatanId);
      _errorMessage = null;
      // Refresh list (the kegiatan should now be removed from the list since it's no longer pending disbursement)
      await fetchList();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Get sisa dana for a kegiatan (optional utility helper)
  Future<double?> getSisaDana(String kegiatanId) async {
    _errorMessage = null;
    try {
      final data = await _pencairanService.getSisaDana(kegiatanId);
      return (data['sisa_dana'] as num?)?.toDouble();
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Reset provider state
  void reset() {
    _items = [];
    _errorMessage = null;
    _isLoading = false;
    _isSubmitting = false;
    notifyListeners();
  }
}
