import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/dashboard_provider.dart';
import '../services/dashboard_service.dart';
import '../services/chatbot_service.dart';
import 'sigap_bottom_navigation_bar.dart';

// Screens
import '../screens/dashboard/pengusul_dashboard_screen.dart';
import '../screens/dashboard/verifikator_dashboard_screen.dart';
import '../screens/dashboard/ppk_dashboard_screen.dart';
import '../screens/dashboard/bendahara_dashboard_screen.dart';
import '../screens/dashboard/direktor_dashboard_screen.dart';
import '../screens/admin/admin_dashboard_page.dart';
import '../screens/pengusul/kak_list_page.dart';
import '../screens/pengusul/kegiatan_page.dart';
import '../screens/pengusul/lpj_list_page.dart';
import '../screens/verifikator/verifikator_kak_list_page.dart';
import '../screens/kegiatan_monitoring_page.dart';
import '../screens/ppk/ppk_kegiatan_list_page.dart';
import '../screens/bendahara/pencairan_page.dart';
import '../screens/admin/user_management_page.dart';
import '../screens/profile_page.dart';

class AppShell extends StatefulWidget {
  final int roleId;
  const AppShell({super.key, required this.roleId});

  @override
  State<AppShell> createState() => AppShellState();
}

class AppShellState extends State<AppShell> {
  static AppShellState? activeInstance;
  int _selectedIndex = 0;

  int get selectedIndex => _selectedIndex;

  void setSelectedIndex(int index) {
    setState(() {
      _selectedIndex = index;
    });
    _updateChatbotVisibility(index);
  }

  @override
  void initState() {
    super.initState();
    activeInstance = this;
    // Move chatbot above navbar
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final chatbotService = context.read<ChatbotService>();
      chatbotService.setBottomPadding(100);
      _updateChatbotVisibility(_selectedIndex);
    });
  }

  void _updateChatbotVisibility(int index) {
    final chatbotService = context.read<ChatbotService>();
    
    // Default visibility
    bool shouldHide = false;
    
    // We target role 3 (Pengusul) specifically for KAK and Profile hiding
    // as requested by the user.
    if (widget.roleId == 3) {
      if (index == 1) { // KAK tab for Pengusul
        shouldHide = true;
      } else if (index == 4) { // Profil tab for Pengusul
        shouldHide = true;
      }
    } else {
      // For other roles, typically the last tab is Profile
      final destinations = _getDestinations();
      if (index == destinations.length - 1) {
        shouldHide = true;
      }
    }
    
    chatbotService.setVisible(!shouldHide);
  }

  @override
  void dispose() {
    if (activeInstance == this) {
      activeInstance = null;
    }
    // Reset chatbot padding when leaving shell
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ChatbotService>().setBottomPadding(20);
        context.read<ChatbotService>().setVisible(true);
      }
    });
    super.dispose();
  }

  // Build the pages and destinations based on role
  List<Widget> _getPages(BuildContext context) {
    switch (widget.roleId) {
      case 3: // Pengusul
        return [
          ChangeNotifierProvider(
            create: (_) => PengusulDashboardProvider(DashboardService(context.read())),
            child: const PengusulDashboardScreen(),
          ),
          const KakListPage(isTab: true),
          const KegiatanPage(),
          const LpjListPage(),
          const ProfilePage(),
        ];
      case 2: // Verifikator
        return [
          ChangeNotifierProvider(
            create: (_) => VerifikatorDashboardProvider(DashboardService(context.read())),
            child: const VerifikatorDashboardScreen(),
          ),
          const VerifikatorKakListPage(),
          const KegiatanMonitoringPage(isTab: true),
          const ProfilePage(),
        ];
      case 4: // PPK
        return [
          ChangeNotifierProvider<BaseDashboardProvider>(
            create: (_) => PpkDashboardProvider(DashboardService(context.read())),
            child: const PpkDashboardScreen(),
          ),
          const PpkKegiatanListPage(isTab: true),
          const KegiatanMonitoringPage(isTab: true),
          const ProfilePage(),
        ];
      case 5: // Wadir
        return [
          ChangeNotifierProvider<BaseDashboardProvider>(
            create: (_) => WadirDashboardProvider(DashboardService(context.read())),
            child: const PpkDashboardScreen(),
          ),
          const PpkKegiatanListPage(isTab: true),
          const KegiatanMonitoringPage(isTab: true),
          const ProfilePage(),
        ];
      case 6: // Bendahara
        return [
          ChangeNotifierProvider(
            create: (_) => BendaharaDashboardProvider(DashboardService(context.read())),
            child: const BendaharaDashboardScreen(),
          ),
          const PencairanPage(),
          const LpjListPage(),
          const ProfilePage(),
        ];
      case 7: // Direktur / Rektorat
        return [
          ChangeNotifierProvider(
            create: (_) => DirektorDashboardProvider(DashboardService(context.read())),
            child: const DirektorDashboardScreen(),
          ),
          const KegiatanMonitoringPage(isTab: true),
          const ProfilePage(),
        ];
      case 1: // Admin
        return [
          const AdminDashboardPage(),
          const UserManagementPage(),
          const KegiatanMonitoringPage(isTab: true),
          const ProfilePage(),
        ];
      default:
        return [
          const Center(child: Text('Dashboard')),
          const ProfilePage(),
        ];
    }
  }

  List<NavigationDestination> _getDestinations() {
    switch (widget.roleId) {
      case 3: // Pengusul
        return const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded, color: AppTheme.primary),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.description_outlined),
            selectedIcon: Icon(Icons.description_rounded, color: AppTheme.primary),
            label: 'KAK',
          ),
          NavigationDestination(
            icon: Icon(Icons.task_alt_outlined),
            selectedIcon: Icon(Icons.task_alt_rounded, color: AppTheme.primary),
            label: 'Kegiatan',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long_rounded, color: AppTheme.primary),
            label: 'LPJ',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded, color: AppTheme.primary),
            label: 'Profil',
          ),
        ];
      case 2: // Verifikator
        return const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded, color: AppTheme.primary),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.rate_review_outlined),
            selectedIcon: Icon(Icons.rate_review_rounded, color: AppTheme.primary),
            label: 'Review KAK',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics_rounded, color: AppTheme.primary),
            label: 'Monitoring',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded, color: AppTheme.primary),
            label: 'Profil',
          ),
        ];
      case 4: // PPK
      case 5: // Wadir
        return const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded, color: AppTheme.primary),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.task_outlined),
            selectedIcon: Icon(Icons.task_rounded, color: AppTheme.primary),
            label: 'Kegiatan',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics_rounded, color: AppTheme.primary),
            label: 'Monitoring',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded, color: AppTheme.primary),
            label: 'Profil',
          ),
        ];
      case 6: // Bendahara
        return const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded, color: AppTheme.primary),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.payments_outlined),
            selectedIcon: Icon(Icons.payments_rounded, color: AppTheme.primary),
            label: 'Pencairan',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long_rounded, color: AppTheme.primary),
            label: 'LPJ',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded, color: AppTheme.primary),
            label: 'Profil',
          ),
        ];
      case 7: // Direktur
        return const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded, color: AppTheme.primary),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics_rounded, color: AppTheme.primary),
            label: 'Monitoring',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded, color: AppTheme.primary),
            label: 'Profil',
          ),
        ];
      case 1: // Admin
        return const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded, color: AppTheme.primary),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people_rounded, color: AppTheme.primary),
            label: 'Pengguna',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics_rounded, color: AppTheme.primary),
            label: 'Monitoring',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded, color: AppTheme.primary),
            label: 'Profil',
          ),
        ];
      default:
        return const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded, color: AppTheme.primary),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded, color: AppTheme.primary),
            label: 'Profil',
          ),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = _getPages(context);

    if (_selectedIndex >= pages.length) {
      _selectedIndex = 0;
    }

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: pages,
      ),
      bottomNavigationBar: SigapBottomNavigationBar(
        selectedIndex: _selectedIndex,
        roleId: widget.roleId,
        onDestinationSelected: (index) {
          setSelectedIndex(index);
        },
      ),
    );
  }
}
