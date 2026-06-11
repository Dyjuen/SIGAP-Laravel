import 'package:flutter/foundation.dart';
import '../models/panduan_model.dart';
import '../services/panduan_service.dart';

class PanduanProvider with ChangeNotifier {
  final PanduanService _panduanService;
  List<Panduan> _panduans = [];
  bool _isLoading = false;
  String? _errorMessage;

  PanduanProvider(this._panduanService);

  List<Panduan> get panduans => _panduans;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadPanduans() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _panduans = await _panduanService.getPanduans();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
