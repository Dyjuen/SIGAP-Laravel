import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/landing_page.dart';
import 'screens/dashboard_page.dart';
import 'screens/login_page.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
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
      home: _isCheckingAuth
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : Consumer<AuthProvider>(
              builder: (context, authProvider, _) {
                // If authenticated, go to Dashboard.
                // Else, show LandingPage which could have a button to navigate to Login
                if (authProvider.isAuthenticated) {
                  return const DashboardPage();
                }
                return const MainNavigationWrapper();
              },
            ),
    );
  }
}

/// A simple wrapper that combines LandingPage with an easy way to go to login.
class MainNavigationWrapper extends StatelessWidget {
  const MainNavigationWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: const LandingPage(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginPage()));
        },
        label: const Text('Login'),
        icon: const Icon(Icons.login),
        backgroundColor: const Color(0xFF33C8DA),
        foregroundColor: Colors.white,
      ),
    );
  }
}
