import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/screens/landing_page.dart';

void main() {
  testWidgets('LandingPage displays title and main sections', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MaterialApp(
      home: LandingPage(),
    ));

    // Verify that the title is present.
    expect(find.text('SIGAP PNJ'), findsOneWidget);
    expect(find.text('Semua Proses, Satu Sistem.'), findsOneWidget);
    
    // Verify that Hero, Features, Roles, FAQ, and Contact sections are present.
    expect(find.text('Siapa yang Menggunakan SIGAP?'), findsOneWidget);
    expect(find.text('Frequently asked questions'), findsOneWidget);
    expect(find.text('Hubungi Tim SIGAP'), findsOneWidget);
  });
}
