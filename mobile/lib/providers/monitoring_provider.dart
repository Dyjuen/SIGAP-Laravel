import 'package:flutter/foundation.dart';
import '../models/monitoring_model.dart';
import '../services/monitoring_service.dart';

class MonitoringProvider extends ChangeNotifier {
  final MonitoringService monitoringService;

  List<MonitoringItem> _allItems = [];
  List<MonitoringItem> _filteredItems = [];
  MonitoringStats _stats = const MonitoringStats(
    total: 0,
    running: 0,
    completed: 0,
  );
  String _selectedFilter = 'Semua';
  String _searchQuery = '';
  bool _isLoading = false;
  String? _errorMessage;

  MonitoringProvider(this.monitoringService);

  // Getters
  List<MonitoringItem> get items => _filteredItems;
  MonitoringStats get stats => _stats;
  String get selectedFilter => _selectedFilter;
  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isError => _errorMessage != null;

  /// Load monitoring data from API.
  Future<void> loadItems() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await monitoringService.getMonitoring(
        search: _searchQuery.isEmpty ? null : _searchQuery,
      );
      _allItems = response.items;
      _stats = response.stats;
      _applyFiltersAndSearch();
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
      _allItems = [];
      _filteredItems = [];
      _stats = const MonitoringStats(total: 0, running: 0, completed: 0);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Set search query and reapply filters
  Future<void> setSearchQuery(String query) async {
    _searchQuery = query;
    await loadItems();
  }

  /// Set selected status filter and reapply filters
  void setSelectedFilter(String filter) {
    _selectedFilter = filter;
    _applyFiltersAndSearch();
    notifyListeners();
  }

  /// Apply both search and filter
  void _applyFiltersAndSearch() {
    // First apply status filter
    var items = monitoringService.filterByStatus(_allItems, _selectedFilter);

    _filteredItems = items;
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Retry loading items
  Future<void> retry() async {
    await loadItems();
  }
}
