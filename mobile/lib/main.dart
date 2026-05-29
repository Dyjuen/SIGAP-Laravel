import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'providers/auth_provider.dart';
import 'providers/monitoring_provider.dart';
import 'providers/kak_detail_provider.dart';
import 'providers/lampiran_provider.dart';
import 'providers/lpj_provider.dart';
import 'services/dashboard_service.dart';
import 'services/monitoring_service.dart';
import 'services/kak_service.dart';
import 'services/master_data_service.dart';
import 'services/lampiran_service.dart';
import 'services/lpj_service.dart';
import 'screens/landing_page.dart';
import 'screens/dashboard_router.dart';
import 'screens/pengusul/lpj_list_page.dart';
import 'screens/pengusul/lpj_form_page.dart';


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id_ID', null);

  // Initialize Dio with base options
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://127.0.0.1:8000/api',
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      contentType: 'application/json',
      headers: {'Accept': 'application/json'},
    ),
  );

  // Add interceptor to attach token to all requests
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ),
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        Provider<Dio>(create: (_) => dio),
        Provider<DashboardService>(
          create: (context) => DashboardService(context.read<Dio>()),
        ),
        Provider<MonitoringService>(
          create: (context) => MonitoringService(context.read<Dio>()),
        ),
        Provider<KakService>(
          create: (context) => KakService(context.read<Dio>()),
        ),
        Provider<MasterDataService>(
          create: (context) => MasterDataService(context.read<Dio>()),
        ),
        Provider<LampiranService>(
          create: (context) => LampiranService(context.read<Dio>()),
        ),
        Provider<LpjService>(
          create: (context) => LpjService(context.read<Dio>()),
        ),
        ChangeNotifierProvider<MonitoringProvider>(
          create: (context) =>
              MonitoringProvider(context.read<MonitoringService>()),
        ),
        ChangeNotifierProvider<KakDetailProvider>(
          create: (context) => KakDetailProvider(context.read<KakService>()),
        ),
        ChangeNotifierProvider<LampiranProvider>(
          create: (context) =>
              LampiranProvider(context.read<LampiranService>()),
        ),
        ChangeNotifierProvider<LpjProvider>(
          create: (context) => LpjProvider(context.read<LpjService>()),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _isCheckingAuth = true;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  void _checkAuth() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.checkAuthStatus();
    setState(() {
      _isCheckingAuth = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SIGAP PNJ',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF33C8DA)),
        useMaterial3: true,
      ),
      routes: {
        '/lpj': (context) => const LpjListPage(),
      },
      home: _isCheckingAuth
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : Consumer<AuthProvider>(
              builder: (context, authProvider, _) {
                // If authenticated, go to Dashboard.
                // Else, show LandingPage which could have a button to navigate to Login
                if (authProvider.isAuthenticated) {
                  return const DashboardRouter();
                }
                return const MainNavigationWrapper();
              },
            ),
    );
  }
}

/// A simple wrapper that renders LandingPage.
class MainNavigationWrapper extends StatelessWidget {
  const MainNavigationWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return const LandingPage();
  }
}
