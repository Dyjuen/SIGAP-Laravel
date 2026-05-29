import 'package:flutter/foundation.dart';
import '../models/dashboard_model.dart';
import '../services/monitoring_service.dart';

class MonitoringProvider extends ChangeNotifier {
  final MonitoringService monitoringService;

  List<DashboardItem> _allItems = [];
  List<DashboardItem> _filteredItems = [];
  String _selectedFilter = 'Semua';
  String _searchQuery = '';
  bool _isLoading = false;
  String? _errorMessage;

  MonitoringProvider(this.monitoringService);

  // Getters
  List<DashboardItem> get items => _filteredItems;
  String get selectedFilter => _selectedFilter;
  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isError => _errorMessage != null;

  /// Load all KAKs for monitoring
  Future<void> loadItems() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _allItems = await monitoringService.getAllKaks();
      _applyFiltersAndSearch();
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
      _allItems = [];
      _filteredItems = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Set search query and reapply filters
  void setSearchQuery(String query) {
    _searchQuery = query;
    _applyFiltersAndSearch();
    notifyListeners();
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

    // Then apply search filter
    if (_searchQuery.isNotEmpty) {
      items = items
          .where(
            (item) =>
                item.nama.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                (item.id.toLowerCase().contains(_searchQuery.toLowerCase())),
          )
          .toList();
    }

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
