import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/screens/landing_page.dart';
import 'package:provider/provider.dart';
import 'package:mobile/services/chatbot_service.dart';
import 'package:mobile/widgets/sigap_logo.dart';

void main() {
  testWidgets('LandingPage displays title and main sections', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider<ChatbotService>(
        create: (_) => ChatbotService(),
        child: const MaterialApp(home: LandingPage()),
      ),
    );
    await tester.pump(); // allow animation frame

    // Navbar brand
    expect(find.byType(SigapLogo), findsWidgets);

    // Hero headline (new text)
    expect(
      find.textContaining('Sistem Informasi Gerbang Administrasi'),
      findsWidgets,
    );

    // Sections exist
    expect(find.text('LAYANAN UNGGULAN'), findsOneWidget);
    expect(find.text('Frequently Asked Questions'), findsOneWidget);
    expect(find.text('TANYA JAWAB'), findsOneWidget);
  });
}
