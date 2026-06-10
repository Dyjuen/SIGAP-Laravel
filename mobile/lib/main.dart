import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'firebase_options.dart';
import 'services/fcm_service.dart';
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
import 'services/pencairan_service.dart';
import 'services/chatbot_service.dart';
import 'widgets/gita_chatbot_widget.dart';
import 'providers/pencairan_provider.dart';
import 'core/navigator_key.dart';
import 'screens/landing_page.dart';
import 'screens/dashboard_router.dart';
import 'screens/pengusul/lpj_list_page.dart';
import 'screens/bendahara/pencairan_page.dart';
import 'services/notification_service.dart';
import 'providers/notification_provider.dart';

String _getBaseUrl() {
  // Gunakan URL produksi langsung
  return 'https://sigap-laravel.wattaway.id/api';
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint("Gagal menginisialisasi Firebase: $e");
  }

  await initializeDateFormatting('id_ID', null);

  // Initialize Dio with base options
  final dio = Dio(
    BaseOptions(
      baseUrl: _getBaseUrl(),
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
        Provider<PencairanService>(
          create: (context) => PencairanService(context.read<Dio>()),
        ),
        Provider<NotificationService>(
          create: (context) => NotificationService(context.read<Dio>()),
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
        ChangeNotifierProvider<PencairanProvider>(
          create: (context) =>
              PencairanProvider(context.read<PencairanService>()),
        ),
        ChangeNotifierProvider<NotificationProvider>(
          create: (context) => NotificationProvider(context.read<NotificationService>()),
        ),
        ChangeNotifierProvider(create: (_) => ChatbotService()),
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
    
    // Inisialisasi FcmService setelah status auth diketahui
    final fcm = FcmService();
    await fcm.initialize();
    if (authProvider.isAuthenticated) {
      await fcm.registerToken();
    }
    
    setState(() {
      _isCheckingAuth = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      title: 'SIGAP PNJ',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF33C8DA),
          primary: const Color(0xFF33C8DA),
          onPrimary: Colors.white,
          secondary: const Color(0xFF2BA9B8),
          surface: Colors.white,
          onSurface: const Color(0xFF1F2937),
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          elevation: 0,
          scrolledUnderElevation: 0,
          surfaceTintColor: Colors.transparent,
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.dark,
            statusBarBrightness: Brightness.light,
          ),
        ),
      ),
      routes: {
        '/lpj': (context) => const LpjListPage(),
        '/bendahara/pencairan': (context) => const PencairanPage(),
      },
      builder: (context, child) {
        return Stack(
          children: [
            if (child != null) child,
            const GitaChatbotWidget(),
          ],
        );
      },
      home: _isCheckingAuth
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : Consumer<AuthProvider>(
              builder: (context, authProvider, _) {
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
