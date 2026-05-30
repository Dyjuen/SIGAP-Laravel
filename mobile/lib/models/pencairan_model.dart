// Pencairan (Disbursement) Models

class PencairanItem {
  final String kegiatanId;
  final String kakId;
  final String namaKegiatan;
  final String pelaksanaManual;
  final String penanggungJawabManual;
  final String? catatanWadir2;
  final double totalAnggaranDiusulkan;
  final double danaDicairkan;
  final double sisaDana;

  PencairanItem({
    required this.kegiatanId,
    required this.kakId,
    required this.namaKegiatan,
    required this.pelaksanaManual,
    required this.penanggungJawabManual,
    this.catatanWadir2,
    required this.totalAnggaranDiusulkan,
    required this.danaDicairkan,
    required this.sisaDana,
  });

  factory PencairanItem.fromJson(Map<String, dynamic> json) {
    return PencairanItem(
      kegiatanId: json['kegiatan_id']?.toString() ?? '',
      kakId: json['kak_id']?.toString() ?? '',
      namaKegiatan: json['nama_kegiatan'] ?? '',
      pelaksanaManual: json['pelaksana_manual'] ?? '',
      penanggungJawabManual: json['penanggung_jawab_manual'] ?? '',
      catatanWadir2: json['catatan_wadir2'],
      totalAnggaranDiusulkan: _parseDouble(json['total_anggaran_diusulkan']),
      danaDicairkan: _parseDouble(json['dana_dicairkan']),
      sisaDana: _parseDouble(json['sisa_dana']),
    );
  }

  Map<String, dynamic> toJson() => {
    'kegiatan_id': kegiatanId,
    'kak_id': kakId,
    'nama_kegiatan': namaKegiatan,
    'pelaksana_manual': pelaksanaManual,
    'penanggung_jawab_manual': penanggungJawabManual,
    'catatan_wadir2': catatanWadir2,
    'total_anggaran_diusulkan': totalAnggaranDiusulkan,
    'dana_dicairkan': danaDicairkan,
    'sisa_dana': sisaDana,
  };

  double get disbursementPercent =>
      totalAnggaranDiusulkan > 0 ? (danaDicairkan / totalAnggaranDiusulkan) * 100 : 0;

  bool get isFullyDisbursed => sisaDana <= 0;
}

double _parseDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is double) return value;
  if (value is int) return value.toDouble();
  if (value is String) {
    return double.tryParse(value.replaceAll(',', '.')) ?? 0.0;
  }
  return 0.0;
}
