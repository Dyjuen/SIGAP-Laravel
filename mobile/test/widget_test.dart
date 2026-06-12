// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile/main.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/services/chatbot_service.dart';
import 'package:video_player_platform_interface/video_player_platform_interface.dart';

class FakeChatbotService extends ChangeNotifier implements ChatbotService {
  @override
  List<Map<String, String>> get messages => [];
  @override
  bool get isLoading => false;
  @override
  bool get isVisible => false;
  @override
  double get bottomPadding => 20.0;

  @override
  void setVisible(bool visible) {}
  @override
  void setBottomPadding(double padding) {}
  @override
  Future<void> sendMessage(String text) async {}
  @override
  void clearHistory() {}
}

class FakeVideoPlayerPlatform extends VideoPlayerPlatform {
  @override
  Future<void> init() async {}

  @override
  Future<int?> create(DataSource dataSource) async {
    return 1;
  }

  @override
  Future<void> dispose(int textureId) async {}

  @override
  Future<void> play(int textureId) async {}

  @override
  Future<void> pause(int textureId) async {}

  @override
  Stream<VideoEvent> videoEventsFor(int textureId) {
    return const Stream.empty();
  }

  @override
  Future<void> setLooping(int textureId, bool looping) async {}

  @override
  Future<void> setVolume(int textureId, double volume) async {}

  @override
  Future<void> setPlaybackSpeed(int textureId, double speed) async {}

  @override
  Future<void> seekTo(int textureId, Duration position) async {}

  @override
  Future<Duration> getPosition(int textureId) async {
    return Duration.zero;
  }

  @override
  Widget buildView(int textureId) {
    return const SizedBox.shrink();
  }
}

void main() {
  setUp(() {
    VideoPlayerPlatform.instance = FakeVideoPlayerPlatform();
  });

  testWidgets('MyApp renders loading state initially', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider<ChatbotService>(create: (_) => FakeChatbotService()),
        ],
        child: const MyApp(),
      ),
    );

    // Verify that the CircularProgressIndicator is displayed during auth check
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
