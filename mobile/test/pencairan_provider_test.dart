import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/pencairan_model.dart';
import 'package:mobile/providers/pencairan_provider.dart';
import 'package:mobile/services/pencairan_service.dart';

class FakePencairanService extends PencairanService {
  FakePencairanService() : super(Dio());

  List<PencairanItem> mockList = [];
  bool shouldFailList = false;
  bool shouldFailStore = false;
  bool shouldFailSelesai = false;

  String? lastStoreKegiatanId;
  double? lastStoreNominal;
  String? lastStoreKeterangan;
  String? lastSelesaiKegiatanId;

  @override
  Future<List<PencairanItem>> getPencairanList() async {
    if (shouldFailList) {
      throw Exception('Gagal memuat list');
    }
    return mockList;
  }

  @override
  Future<void> storePencairan({
    required String kegiatanId,
    required double nominal,
    String? keterangan,
  }) async {
    if (shouldFailStore) {
      throw Exception('Gagal mencatat pencairan');
    }
    lastStoreKegiatanId = kegiatanId;
    lastStoreNominal = nominal;
    lastStoreKeterangan = keterangan;
    
    // Simulate updating list on success
    mockList = mockList.map((item) {
      if (item.kegiatanId == kegiatanId) {
        final newDisbursed = item.danaDicairkan + nominal;
        return PencairanItem(
          kegiatanId: item.kegiatanId,
          kakId: item.kakId,
          namaKegiatan: item.namaKegiatan,
          pelaksanaManual: item.pelaksanaManual,
          penanggungJawabManual: item.penanggungJawabManual,
          catatanWadir2: item.catatanWadir2,
          totalAnggaranDiusulkan: item.totalAnggaranDiusulkan,
          danaDicairkan: newDisbursed,
          sisaDana: item.totalAnggaranDiusulkan - newDisbursed,
        );
      }
      return item;
    }).toList();
  }

  @override
  Future<void> selesaiPencairan(String kegiatanId) async {
    if (shouldFailSelesai) {
      throw Exception('Gagal menyelesaikan');
    }
    lastSelesaiKegiatanId = kegiatanId;
    // Simulate removing from list on completion
    mockList.removeWhere((item) => item.kegiatanId == kegiatanId);
  }
}

void main() {
  late FakePencairanService fakeService;
  late PencairanProvider provider;

  final testItem = PencairanItem(
    kegiatanId: '1',
    kakId: '10',
    namaKegiatan: 'Seminar Nasional',
    pelaksanaManual: 'Pelaksana A',
    penanggungJawabManual: 'PJ B',
    catatanWadir2: 'Catatan Wadir 2',
    totalAnggaranDiusulkan: 10000000.0,
    danaDicairkan: 4000000.0,
    sisaDana: 6000000.0,
  );

  setUp(() {
    fakeService = FakePencairanService();
    provider = PencairanProvider(fakeService);
    fakeService.mockList = [testItem];
  });

  group('PencairanProvider Tests', () {
    test('initial state is correct', () {
      expect(provider.items, isEmpty);
      expect(provider.isLoading, isFalse);
      expect(provider.isSubmitting, isFalse);
      expect(provider.errorMessage, isNull);
    });

    test('fetchList success updates items and clears error', () async {
      await provider.fetchList();
      
      expect(provider.items.length, 1);
      expect(provider.items.first.namaKegiatan, 'Seminar Nasional');
      expect(provider.isLoading, isFalse);
      expect(provider.errorMessage, isNull);
    });

    test('fetchList failure sets errorMessage', () async {
      fakeService.shouldFailList = true;
      
      await provider.fetchList();
      
      expect(provider.items, isEmpty);
      expect(provider.isLoading, isFalse);
      expect(provider.errorMessage, contains('Gagal memuat list'));
    });

    test('storePencairan success refreshes list', () async {
      // Fetch list first
      await provider.fetchList();
      expect(provider.items.first.danaDicairkan, 4000000.0);

      final success = await provider.storePencairan(
        kegiatanId: '1',
        nominal: 2000000.0,
        keterangan: 'Cairkan 2 juta',
      );

      expect(success, isTrue);
      expect(fakeService.lastStoreKegiatanId, '1');
      expect(fakeService.lastStoreNominal, 2000000.0);
      expect(fakeService.lastStoreKeterangan, 'Cairkan 2 juta');
      
      // Verification of refreshed items
      expect(provider.items.first.danaDicairkan, 6000000.0);
      expect(provider.items.first.sisaDana, 4000000.0);
      expect(provider.isSubmitting, isFalse);
    });

    test('storePencairan failure sets errorMessage and returns false', () async {
      fakeService.shouldFailStore = true;

      final success = await provider.storePencairan(
        kegiatanId: '1',
        nominal: 2000000.0,
      );

      expect(success, isFalse);
      expect(provider.errorMessage, contains('Gagal mencatat pencairan'));
      expect(provider.isSubmitting, isFalse);
    });

    test('selesaiPencairan success refreshes list and removes item', () async {
      // Fetch list first
      await provider.fetchList();
      expect(provider.items.length, 1);

      final success = await provider.selesaiPencairan('1');

      expect(success, isTrue);
      expect(fakeService.lastSelesaiKegiatanId, '1');
      expect(provider.items, isEmpty);
      expect(provider.isSubmitting, isFalse);
    });

    test('selesaiPencairan failure sets errorMessage and returns false', () async {
      fakeService.shouldFailSelesai = true;

      final success = await provider.selesaiPencairan('1');

      expect(success, isFalse);
      expect(provider.errorMessage, contains('Gagal menyelesaikan'));
      expect(provider.isSubmitting, isFalse);
    });
  });
}
