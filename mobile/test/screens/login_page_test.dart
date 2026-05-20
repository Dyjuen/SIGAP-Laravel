import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/screens/login_page.dart';
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';

void main() {
  testWidgets('LoginPage displays username and password fields', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: const MaterialApp(
          home: LoginPage(),
        ),
      ),
    );

    // Verify fields are present
    expect(find.byType(TextField), findsNWidgets(2));
    expect(find.text('Username'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Masuk'), findsOneWidget);
  });
}
