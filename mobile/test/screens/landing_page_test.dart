import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/screens/landing_page.dart';

void main() {
  testWidgets('LandingPage displays title and main sections', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LandingPage()));
    await tester.pump(); // allow animation frame

    // Navbar brand
    expect(find.text('SIGAP PNJ'), findsWidgets);

    // Hero headline (new text)
    expect(
      find.textContaining('Sistem Informasi Gerbang Administrasi'),
      findsWidgets,
    );

    // Sections exist
    expect(find.text('Semua Proses, Satu Sistem.'), findsOneWidget);
    expect(find.text('Frequently Asked Questions'), findsOneWidget);
    expect(find.text('Hubungi Tim SIGAP'), findsOneWidget);
  });
}
