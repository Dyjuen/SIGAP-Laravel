import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/screens/pengusul/kak_list_page.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:mobile/services/chatbot_service.dart';

class MockHttpClient implements HttpClient {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #openUrl) {
      return Future.value(MockHttpClientRequest());
    }
    return Future.value();
  }
}

class MockHttpClientRequest implements HttpClientRequest {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #close) {
      return Future.delayed(
        const Duration(milliseconds: 50),
        () => MockHttpClientResponse(jsonEncode({
          "current_page": 1,
          "data": [
            {
              "kak_id": 42,
              "nama_kegiatan": "Kegiatan Uji Coba KAK",
              "status_id": 1,
              "status_nama": "Draft",
              "tipe": "Akademik",
              "updated_at": "30 May 2026",
              "tanggal_mulai": "30 May 2026",
              "tanggal_selesai": "31 May 2026"
            }
          ],
          "total": 1
        })),
      );
    }
    if (invocation.memberName == #headers) {
      return MockHttpHeaders();
    }
    return Future.value();
  }
}

class MockHttpHeaders implements HttpHeaders {
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

class MockHttpClientResponse implements HttpClientResponse {
  final String body;
  MockHttpClientResponse(this.body);

  @override
  int get statusCode => 200;

  @override
  int get contentLength => utf8.encode(body).length;

  @override
  bool get isRedirect => false;

  @override
  bool get persistentConnection => true;

  @override
  String get reasonPhrase => 'OK';

  @override
  List<RedirectInfo> get redirects => const <RedirectInfo>[];

  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #headers) {
      return MockHttpHeaders();
    }
    return null;
  }

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int> event)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    final List<int> bytes = utf8.encode(body);
    return Stream<List<int>>.fromIterable([bytes]).listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }
}

class TestHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return MockHttpClient();
  }
}

void main() {
  setUpAll(() {
    SharedPreferences.setMockInitialValues({});
    HttpOverrides.global = TestHttpOverrides();
  });

  tearDownAll(() {
    HttpOverrides.global = null;
  });

  testWidgets('KakListPage displays paginated items from backend', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider<ChatbotService>(
        create: (_) => ChatbotService(),
        child: const MaterialApp(
          home: KakListPage(),
        ),
      ),
    );

    // Initial load
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Wait for the simulated API response
    await tester.pump(const Duration(milliseconds: 100));
    await tester.pump();

    // Verify it parses the paginated data structure and renders the card
    expect(find.text('Kegiatan Uji Coba KAK'), findsOneWidget);
    expect(find.text('Akademik'), findsOneWidget);
    expect(find.text('Draft'), findsNWidgets(2));
  });
}
