import 'package:flutter/material.dart';
import '../models/dashboard_model.dart';
import '../services/dashboard_service.dart';

/// Base Dashboard Provider
class BaseDashboardProvider extends ChangeNotifier {
  final DashboardService dashboardService;

  bool _isLoading = false;
  bool _isError = false;
  String _errorMessage = '';
  DashboardResponse? _dashboardData;

  BaseDashboardProvider(this.dashboardService);

  // Getters
  bool get isLoading => _isLoading;
  bool get isError => _isError;
  String get errorMessage => _errorMessage;
  DashboardResponse? get dashboardData => _dashboardData;

  DashboardStats? get stats => _dashboardData?.stats;
  List<DashboardItem> get items => _dashboardData?.items ?? [];
  List<dynamic> get byJurusan => _dashboardData?.byJurusan ?? [];

  /// Load dashboard data - to be overridden by subclasses
  Future<void> loadDashboard() async {
    _setLoading(true);
    _clearError();
    notifyListeners();
  }

  /// Protected methods
  void _setLoading(bool value) {
    _isLoading = value;
  }

  void _setError(String message) {
    _isError = true;
    _errorMessage = message;
  }

  void _clearError() {
    _isError = false;
    _errorMessage = '';
  }

  void _setData(DashboardResponse data) {
    _dashboardData = data;
  }

  /// Generic load helper
  Future<void> _loadFromService(
    Future<DashboardResponse> Function() serviceCall,
  ) async {
    try {
      _setLoading(true);
      _clearError();
      notifyListeners();

      final data = await serviceCall();
      _setData(data);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      notifyListeners();
    }
  }
}

/// Pengusul Dashboard Provider
class PengusulDashboardProvider extends BaseDashboardProvider {
  PengusulDashboardProvider(super.dashboardService);

  @override
  Future<void> loadDashboard() async {
    await _loadFromService(() => dashboardService.getPengusulDashboard());
  }
}

/// Verifikator Dashboard Provider
class VerifikatorDashboardProvider extends BaseDashboardProvider {
  VerifikatorDashboardProvider(super.dashboardService);

  @override
  Future<void> loadDashboard() async {
    await _loadFromService(() => dashboardService.getVerifikatorDashboard());
  }
}

/// PPK Dashboard Provider
class PpkDashboardProvider extends BaseDashboardProvider {
  PpkDashboardProvider(super.dashboardService);

  @override
  Future<void> loadDashboard() async {
    await _loadFromService(() => dashboardService.getPpkDashboard());
  }
}

/// Wadir Dashboard Provider
class WadirDashboardProvider extends BaseDashboardProvider {
  WadirDashboardProvider(super.dashboardService);

  @override
  Future<void> loadDashboard() async {
    await _loadFromService(() => dashboardService.getWadirDashboard());
  }
}

/// Bendahara Dashboard Provider
class BendaharaDashboardProvider extends BaseDashboardProvider {
  BendaharaDashboardProvider(super.dashboardService);

  @override
  Future<void> loadDashboard() async {
    await _loadFromService(() => dashboardService.getBendaharaDashboard());
  }
}

/// Direktur Dashboard Provider — Full (with TOPSIS, trends, overview, period)
class DirektorDashboardProvider extends BaseDashboardProvider {
  String _selectedPeriod = 'year';
  DirektorDashboardData? _direktorData;

  DirektorDashboardProvider(super.dashboardService);

  String get selectedPeriod => _selectedPeriod;
  DirektorDashboardData? get direktorData => _direktorData;

  @override
  Future<void> loadDashboard() async {
    await _loadDirektorFull(_selectedPeriod);
  }

  Future<void> changePeriod(String period) async {
    _selectedPeriod = period;
    await _loadDirektorFull(period);
  }

  Future<void> _loadDirektorFull(String period) async {
    _isLoading = true;
    _isError = false;
    _errorMessage = '';
    notifyListeners();

    try {
      final data = await dashboardService.getDirektorDashboardFull(period);
      _direktorData = data;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isError = true;
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
}


/// Universal Dashboard Provider (loads based on role)
class UniversalDashboardProvider extends BaseDashboardProvider {
  final String roleName;

  UniversalDashboardProvider({
    required this.roleName,
    required DashboardService dashboardService,
  }) : super(dashboardService);

  @override
  Future<void> loadDashboard() async {
    await _loadFromService(() => dashboardService.getDashboardByRole(roleName));
  }

  /// Refresh dashboard data
  Future<void> refreshDashboard() async {
    await loadDashboard();
  }
}
