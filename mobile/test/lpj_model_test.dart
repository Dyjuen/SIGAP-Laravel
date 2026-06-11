import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/lpj_model.dart';

void main() {
  group('LpjDetail Model Test', () {
    final Map<String, dynamic> json = {
      'kegiatan_id': '1',
      'kak_id': '10',
      'nama_kegiatan': 'Test Activity',
      'lpj_status': 'Completed',
      'realisasi_tgl_mulai': '2023-10-01',
      'realisasi_tgl_selesai': '2023-10-05',
      'anggaran_items': [],
      'approval_status': 'Approved',
    };

    test('should parse realisasi dates from json', () {
      final lpj = LpjDetail.fromJson(json);

      expect(lpj.realisasiTglMulai, '2023-10-01');
      expect(lpj.realisasiTglSelesai, '2023-10-05');
    });

    test('should convert realisasi dates to json', () {
      final lpj = LpjDetail.fromJson(json);
      final resultJson = lpj.toJson();

      expect(resultJson['realisasi_tgl_mulai'], '2023-10-01');
      expect(resultJson['realisasi_tgl_selesai'], '2023-10-05');
    });

    test('should handle null realisasi dates', () {
      final Map<String, dynamic> jsonNull = {
        'kegiatan_id': '1',
        'kak_id': '10',
        'nama_kegiatan': 'Test Activity',
        'lpj_status': 'Draft',
        'realisasi_tgl_mulai': null,
        'realisasi_tgl_selesai': null,
        'anggaran_items': [],
        'approval_status': 'Pending',
      };

      final lpj = LpjDetail.fromJson(jsonNull);

      expect(lpj.realisasiTglMulai, isNull);
      expect(lpj.realisasiTglSelesai, isNull);
      
      final resultJson = lpj.toJson();
      expect(resultJson['realisasi_tgl_mulai'], isNull);
      expect(resultJson['realisasi_tgl_selesai'], isNull);
    });
  });
}
