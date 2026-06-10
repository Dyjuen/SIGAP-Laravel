import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/screens/verifikator/verifikator_approval_page.dart';
import 'package:mobile/services/kak_service.dart';
import 'package:mobile/services/master_data_service.dart';
import 'package:mobile/models/kak_model.dart';
import 'package:mobile/providers/kak_detail_provider.dart';
import 'package:provider/provider.dart';

class FakeKakService extends KakService {
  FakeKakService() : super(Dio());

  KakDetail? mockDetail;
  bool shouldFailDetail = false;
  
  Map<String, dynamic>? lastApproveData;
  String? lastRejectCatatan;
  Map<String, dynamic>? lastReviseCatatanFields;
  String? lastReviseCatatanUmum;

  bool delayDetail = false;

  @override
  Future<KakDetail> getKakDetail(String kakId) async {
    if (delayDetail) {
      await Future.delayed(const Duration(milliseconds: 100));
    }
    if (shouldFailDetail) {
      throw Exception('Gagal memuat detail KAK');
    }
    return mockDetail ?? KakDetail(
      kakId: kakId,
      namaKegiatan: 'Kegiatan Test',
      deskripsiKegiatan: 'Deskripsi Test',
      metodePelaksanaan: 'Metode Test',
      tanggalMulai: '2026-05-30',
      tanggalSelesai: '2026-06-05',
      lokasi: 'Lobi Utama PNJ',
      sasaranUtama: 'Mahasiswa',
      kurunWaktuPelaksanaan: '6 Hari',
      statusId: 2,
      statusNama: 'Review Verifikator',
      updatedAt: '2026-05-30',
      manfaat: [],
      tahapan: [],
      indikatorKinerja: [],
      targetIku: [],
      rab: [],
      approvals: [],
    );
  }

  @override
  Future<void> approveKak(String kakId, Map<String, dynamic> budgetData) async {
    lastApproveData = budgetData;
  }

  @override
  Future<void> rejectKak(String kakId, String catatan) async {
    lastRejectCatatan = catatan;
  }

  @override
  Future<void> reviseKak(String kakId, String? catatan, Map<String, String>? catatanFields, Map<String, dynamic>? anak) async {
    lastReviseCatatanUmum = catatan;
    lastReviseCatatanFields = catatanFields;
  }
}

class FakeMasterDataService extends MasterDataService {
  FakeMasterDataService() : super(Dio());

  @override
  Future<List<dynamic>> getMataAnggaran() async {
    return [
      {
        'mata_anggaran_id': 1,
        'kode_anggaran': 'APBN-2026',
        'nama_sumber_dana': 'APBN 2026',
        'tahun_anggaran': 2026,
        'total_pagu': 500000000.0,
      }
    ];
  }
}

void main() {
  late FakeKakService fakeKakService;
  late FakeMasterDataService fakeMasterDataService;

  setUp(() {
    fakeKakService = FakeKakService();
    fakeMasterDataService = FakeMasterDataService();
  });

  Widget buildTestWidget() {
    return MultiProvider(
      providers: [
        Provider<KakService>.value(value: fakeKakService),
        Provider<MasterDataService>.value(value: fakeMasterDataService),
        ChangeNotifierProvider<KakDetailProvider>(
          create: (context) => KakDetailProvider(context.read<KakService>()),
        ),
      ],
      child: const MaterialApp(
        home: VerifikatorApprovalPage(kakId: 123),
      ),
    );
  }

  testWidgets('shows loading state initially', (WidgetTester tester) async {
    fakeKakService.delayDetail = true;
    await tester.pumpWidget(buildTestWidget());
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    
    // Complete the delayed future
    await tester.pump(const Duration(milliseconds: 100));
    await tester.pumpAndSettle();
  });

  testWidgets('shows error and lets retry when load fails', (WidgetTester tester) async {
    fakeKakService.shouldFailDetail = true;
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    expect(find.textContaining('Gagal memuat detail KAK'), findsOneWidget);
    expect(find.text('Coba Lagi'), findsOneWidget);

    fakeKakService.shouldFailDetail = false;
    await tester.tap(find.text('Coba Lagi'));
    await tester.pumpAndSettle();

    expect(find.text('Kegiatan Test'), findsNWidgets(2));
  });

  testWidgets('shows details and buttons when loaded successfully', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    expect(find.text('Kegiatan Test'), findsNWidgets(2));
    expect(find.text('Setujui KAK'), findsOneWidget);
    expect(find.text('Minta Revisi'), findsOneWidget);
    expect(find.text('Tolak KAK'), findsOneWidget);
  });

  testWidgets('reject dialog validates and calls reject API', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Tolak KAK'));
    await tester.pumpAndSettle();

    // Check dialog is shown
    expect(find.text('Tolak KAK'), findsNWidgets(2)); // Title and original button
    
    // Tap reject without entering anything
    await tester.tap(find.widgetWithText(FilledButton, 'Tolak'));
    await tester.pumpAndSettle();

    // Should stay open and not call API
    expect(fakeKakService.lastRejectCatatan, isNull);

    // Enter short reason (< 5 chars)
    await tester.enterText(find.byType(TextField).last, 'no');
    await tester.tap(find.widgetWithText(FilledButton, 'Tolak'));
    await tester.pumpAndSettle();

    // Should stay open and not call API
    expect(fakeKakService.lastRejectCatatan, isNull);

    // Enter valid reason (>= 5 chars)
    await tester.enterText(find.byType(TextField).last, 'Alasan penolakan valid');
    await tester.tap(find.widgetWithText(FilledButton, 'Tolak'));
    await tester.pumpAndSettle();

    // Should call API
    expect(fakeKakService.lastRejectCatatan, 'Alasan penolakan valid');
  });

  testWidgets('approve bottom sheet supports list selection', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Setujui KAK'));
    await tester.pumpAndSettle();

    expect(find.text('Setujui KAK - Anggaran'), findsOneWidget);
    expect(find.text('Pilih dari Daftar'), findsOneWidget);

    // Dropdown is rendered. Tap to open.
    await tester.tap(find.byType(DropdownButtonFormField<int>));
    await tester.pumpAndSettle();

    // Select the seeded item
    await tester.tap(find.textContaining('APBN-2026').last);
    await tester.pumpAndSettle();

    // Tap confirm approval
    await tester.tap(find.widgetWithText(FilledButton, 'Setujui KAK').last);
    await tester.pumpAndSettle();

    expect(fakeKakService.lastApproveData, isNotNull);
    expect(fakeKakService.lastApproveData!['mata_anggaran_id'], 1);
  });

  testWidgets('approve bottom sheet supports manual entry', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Setujui KAK'));
    await tester.pumpAndSettle();

    // Tap 'Masukkan Manual' ChoiceChip
    await tester.tap(find.text('Masukkan Manual'));
    await tester.pumpAndSettle();

    // Verify manual input fields are rendered
    expect(find.widgetWithText(TextFormField, 'Kode Anggaran'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Nama Sumber Dana'), findsOneWidget);

    // Enter values
    await tester.enterText(find.widgetWithText(TextFormField, 'Kode Anggaran'), 'MANUAL-2026');
    await tester.enterText(find.widgetWithText(TextFormField, 'Nama Sumber Dana'), 'Sumber Manual');
    await tester.enterText(find.widgetWithText(TextFormField, 'Tahun Anggaran'), '2026');
    await tester.enterText(find.widgetWithText(TextFormField, 'Total Pagu'), '250000000');
    await tester.pumpAndSettle();

    // Submit
    await tester.tap(find.widgetWithText(FilledButton, 'Setujui KAK').last);
    await tester.pumpAndSettle();

    expect(fakeKakService.lastApproveData, isNotNull);
    expect(fakeKakService.lastApproveData!['kode_anggaran'], 'MANUAL-2026');
    expect(fakeKakService.lastApproveData!['nama_sumber_dana'], 'Sumber Manual');
    expect(fakeKakService.lastApproveData!['tahun_anggaran'], 2026);
    expect(fakeKakService.lastApproveData!['total_pagu'], 250000000.0);
  });
}
