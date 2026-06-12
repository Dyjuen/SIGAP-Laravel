import 'dart:developer' as developer;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../core/navigator_key.dart';
import '../screens/kak_detail_page.dart';
import '../screens/lpj_detail_page.dart';
import 'api_service.dart';

class FcmService {
  static final FcmService _instance = FcmService._internal();
  factory FcmService() => _instance;
  FcmService._internal();

  FirebaseMessaging? _messagingInstance;
  FirebaseMessaging get _messaging {
    _messagingInstance ??= FirebaseMessaging.instance;
    return _messagingInstance!;
  }

  @visibleForTesting
  set messagingInstance(FirebaseMessaging mockInstance) {
    _messagingInstance = mockInstance;
  }

  final FlutterLocalNotificationsPlugin _localNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    // Check if Firebase is initialized (skip in tests where Firebase is not configured)
    try {
      if (Firebase.apps.isEmpty) {
        developer.log("Firebase is not initialized. Skipping FcmService initialization.");
        return;
      }
    } catch (e) {
      developer.log("Error checking Firebase initialization: $e");
      return;
    }

    try {
      // 1. Request Permission
      await requestPermission();

      // 2. Configure Foreground Presentation Options
      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 3. Initialize Flutter Local Notifications for Foreground Handling
      const AndroidInitializationSettings initializationSettingsAndroid =
          AndroidInitializationSettings('@mipmap/yes');

      const InitializationSettings initializationSettings =
          InitializationSettings(android: initializationSettingsAndroid);

      await _localNotificationsPlugin.initialize(
        initializationSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          _handleNotificationClick(response.payload);
        },
      );

      // 4. Create Notification Channel for Android
      const AndroidNotificationChannel channel = AndroidNotificationChannel(
        'sigap_push_notifications', // id
        'SIGAP Push Notifications', // title
        description: 'Digunakan untuk update alur kerja SIGAP PNJ.', // description
        importance: Importance.max,
      );

      await _localNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);

      // 5. Setup Handlers
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        developer.log("FCM Message received in foreground: ${message.messageId}");
        _showLocalNotification(message, channel);
      });

      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        developer.log("FCM Notification clicked: ${message.messageId}");
        _handleRemoteMessageClick(message);
      });

      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        developer.log("App launched from terminated state via FCM: ${initialMessage.messageId}");
        Future.delayed(const Duration(milliseconds: 500), () {
          _handleRemoteMessageClick(initialMessage);
        });
      }

      _isInitialized = true;
      developer.log("FcmService initialized successfully.");
    } catch (e) {
      developer.log("Error initializing FcmService: $e");
    }
  }

  Future<void> requestPermission() async {
    try {
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      developer.log('User notification permission status: ${settings.authorizationStatus}');
    } catch (e) {
      developer.log('Error requesting notification permission: $e');
    }
  }

  Future<String?> getToken() async {
    try {
      return await _messaging.getToken();
    } catch (e) {
      developer.log('Error getting FCM token: $e');
      return null;
    }
  }

  Future<void> registerToken() async {
    final token = await getToken();
    if (token == null) {
      developer.log("FCM Token is null, skipping registration.");
      return;
    }

    try {
      final response = await ApiService.post('/device-token', {
        'token': token,
        'platform': 'android',
      });

      if (response.statusCode == 200) {
        developer.log("FCM token successfully registered to server.");
      } else {
        developer.log("Failed to register FCM token. Server returned ${response.statusCode}");
      }
    } catch (e) {
      developer.log("Error registering FCM token: $e");
    }
  }

  Future<void> unregisterToken() async {
    final token = await getToken();
    if (token == null) return;

    try {
      final response = await ApiService.delete('/device-token', body: {
        'token': token,
      });

      if (response.statusCode == 200) {
        developer.log("FCM token successfully unregistered from server.");
      } else {
        developer.log("Failed to unregister FCM token. Server returned ${response.statusCode}");
      }
    } catch (e) {
      developer.log("Error unregistering FCM token: $e");
    }
  }

  void _showLocalNotification(RemoteMessage message, AndroidNotificationChannel channel) {
    RemoteNotification? notification = message.notification;
    AndroidNotification? android = message.notification?.android;

    if (notification != null) {
      final String payload = message.data['link_tujuan'] ?? '';

      _localNotificationsPlugin.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            channel.id,
            channel.name,
            channelDescription: channel.description,
            icon: '@mipmap/yes',
            importance: Importance.max,
            priority: Priority.high,
          ),
        ),
        payload: payload,
      );
    }
  }

  void _handleRemoteMessageClick(RemoteMessage message) {
    final String? linkTujuan = message.data['link_tujuan'];
    _handleNotificationClick(linkTujuan);
  }

  void _handleNotificationClick(String? linkTujuan) {
    if (linkTujuan == null || linkTujuan.isEmpty) return;

    developer.log("Handling navigation for link: $linkTujuan");

    // Check if user is authenticated
    final BuildContext? navContext = navigatorKey.currentContext;
    if (navContext == null) return;

    final uri = Uri.parse(linkTujuan);
    final segments = uri.pathSegments;

    try {
      if (segments.length >= 2 && segments[0] == 'kak') {
        final kakId = segments[1];
        Navigator.push(
          navContext,
          MaterialPageRoute(
            builder: (context) => KakDetailPage(kakId: kakId),
          ),
        );
      } else if (segments.length >= 2 && segments[0] == 'kegiatan') {
        final kegiatanId = int.tryParse(segments[1]);
        if (kegiatanId != null) {
          Navigator.push(
            navContext,
            MaterialPageRoute(
              builder: (context) => LpjDetailPage(kegiatanId: kegiatanId),
            ),
          );
        }
      } else if (segments.length >= 3 && segments[0] == 'lpj' && segments[1] == 'review') {
        final kegiatanId = int.tryParse(segments[2]);
        if (kegiatanId != null) {
          Navigator.push(
            navContext,
            MaterialPageRoute(
              builder: (context) => LpjDetailPage(kegiatanId: kegiatanId),
            ),
          );
        }
      } else if (segments.length >= 1 && segments[0] == 'lpj') {
        Navigator.pushNamed(navContext, '/lpj');
      }
    } catch (e) {
      developer.log("Error during dynamic navigation from push notification: $e");
    }
  }
}

// Background handler function must be top-level and annotated with @pragma('vm:entry-point')
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  developer.log("Handling background message: ${message.messageId}");
}
