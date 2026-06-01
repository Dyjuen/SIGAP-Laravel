// KAK Detail Models - Complete with all database fields

class KakManfaat {
  final String manfaatId;
  final String manfaat;
  final String? catatan;

  KakManfaat({required this.manfaatId, required this.manfaat, this.catatan});

  factory KakManfaat.fromJson(Map<String, dynamic> json) {
    return KakManfaat(
      manfaatId: json['manfaat_id']?.toString() ?? '',
      manfaat: json['manfaat'] ?? '',
      catatan: json['catatan_manfaat'],
    );
  }

  Map<String, dynamic> toJson() => {
    'manfaat_id': manfaatId,
    'manfaat': manfaat,
    'catatan_manfaat': catatan,
  };
}

class KakTahapan {
  final String tahapanId;
  final String namaTahapan;
  final int urutan;
  final String? catatanVerifikator;

  KakTahapan({
    required this.tahapanId,
    required this.namaTahapan,
    required this.urutan,
    this.catatanVerifikator,
  });

  factory KakTahapan.fromJson(Map<String, dynamic> json) {
    return KakTahapan(
      tahapanId: json['tahapan_id']?.toString() ?? '',
      namaTahapan: json['nama_tahapan'] ?? '',
      urutan: json['urutan'] ?? 0,
      catatanVerifikator: json['catatan_verifikator'],
    );
  }

  Map<String, dynamic> toJson() => {
    'tahapan_id': tahapanId,
    'nama_tahapan': namaTahapan,
    'urutan': urutan,
    'catatan_verifikator': catatanVerifikator,
  };
}

class KakIndikatorKinerja {
  final String targetId;
  final String bulanIndikator;
  final String deskripsiTarget;
  final double persentaseTarget;
  final String? catatanVerifikator;

  KakIndikatorKinerja({
    required this.targetId,
    required this.bulanIndikator,
    required this.deskripsiTarget,
    required this.persentaseTarget,
    this.catatanVerifikator,
  });

  factory KakIndikatorKinerja.fromJson(Map<String, dynamic> json) {
    return KakIndikatorKinerja(
      targetId: json['target_id']?.toString() ?? '',
      bulanIndikator: json['bulan_indikator'] ?? '',
      deskripsiTarget: json['deskripsi_target'] ?? '',
      persentaseTarget: _parseDouble(json['persentase_target']),
      catatanVerifikator: json['catatan_verifikator'],
    );
  }

  Map<String, dynamic> toJson() => {
    'target_id': targetId,
    'bulan_indikator': bulanIndikator,
    'deskripsi_target': deskripsiTarget,
    'persentase_target': persentaseTarget,
    'catatan_verifikator': catatanVerifikator,
  };
}

class KakTargetIku {
  final String ikuId;
  final String ikuNama;
  final String? kodeIku;
  final String target;
  final String? satuanId;
  final String? satuanNama;
  final String? catatanVerifikator;

  KakTargetIku({
    required this.ikuId,
    required this.ikuNama,
    this.kodeIku,
    required this.target,
    this.satuanId,
    this.satuanNama,
    this.catatanVerifikator,
  });

  factory KakTargetIku.fromJson(Map<String, dynamic> json) {
    return KakTargetIku(
      ikuId: json['iku_id']?.toString() ?? '',
      ikuNama: json['iku']?['nama_iku'] ?? json['nama_iku'] ?? '',
      kodeIku: json['iku']?['kode_iku'] ?? json['kode_iku'],
      target: json['target']?.toString() ?? '',
      satuanId: json['satuan_id']?.toString(),
      satuanNama: json['satuan']?['nama_satuan'] ?? json['nama_satuan'],
      catatanVerifikator: json['catatan_verifikator'],
    );
  }

  Map<String, dynamic> toJson() => {
    'iku_id': ikuId,
    'nama_iku': ikuNama,
    'kode_iku': kodeIku,
    'target': target,
    'satuan_id': satuanId,
    'nama_satuan': satuanNama,
    'catatan_verifikator': catatanVerifikator,
  };
}

class KakRab {
  final String anggaranId;
  final String uraian;
  final double? volume1;
  final int? satuan1Id;
  final String? satuan1Nama;
  final double? volume2;
  final int? satuan2Id;
  final String? satuan2Nama;
  final double? volume3;
  final int? satuan3Id;
  final String? satuan3Nama;
  final double? hargaSatuan;
  final double? jumlahDiusulkan;
  final String? catatanVerifikator;

  KakRab({
    required this.anggaranId,
    required this.uraian,
    this.volume1,
    this.satuan1Id,
    this.satuan1Nama,
    this.volume2,
    this.satuan2Id,
    this.satuan2Nama,
    this.volume3,
    this.satuan3Id,
    this.satuan3Nama,
    this.hargaSatuan,
    this.jumlahDiusulkan,
    this.catatanVerifikator,
  });

  factory KakRab.fromJson(Map<String, dynamic> json) {
    return KakRab(
      anggaranId: json['anggaran_id']?.toString() ?? '',
      uraian: json['uraian'] ?? '',
      volume1: _parseDoubleOrNull(json['volume1']),
      satuan1Id: json['satuan1_id'] != null ? int.tryParse(json['satuan1_id'].toString()) : null,
      satuan1Nama: json['satuan1_nama'] ?? (json['satuan1'] is Map ? json['satuan1']['nama_satuan'] : null),
      volume2: _parseDoubleOrNull(json['volume2']),
      satuan2Id: json['satuan2_id'] != null ? int.tryParse(json['satuan2_id'].toString()) : null,
      satuan2Nama: json['satuan2_nama'] ?? (json['satuan2'] is Map ? json['satuan2']['nama_satuan'] : null),
      volume3: _parseDoubleOrNull(json['volume3']),
      satuan3Id: json['satuan3_id'] != null ? int.tryParse(json['satuan3_id'].toString()) : null,
      satuan3Nama: json['satuan3_nama'] ?? (json['satuan3'] is Map ? json['satuan3']['nama_satuan'] : null),
      hargaSatuan: _parseDoubleOrNull(json['harga_satuan']),
      jumlahDiusulkan: _parseDoubleOrNull(json['jumlah_diusulkan']),
      catatanVerifikator: json['catatan_verifikator'],
    );
  }

  Map<String, dynamic> toJson() => {
    'anggaran_id': anggaranId,
    'uraian': uraian,
    'volume1': volume1,
    'satuan1_id': satuan1Id,
    'volume2': volume2,
    'satuan2_id': satuan2Id,
    'volume3': volume3,
    'satuan3_id': satuan3Id,
    'harga_satuan': hargaSatuan,
    'jumlah_diusulkan': jumlahDiusulkan,
    'catatan_verifikator': catatanVerifikator,
  };
}

class KakApproval {
  final String approverNama;
  final String status;
  final String? catatan;
  final String? tanggal;

  KakApproval({
    required this.approverNama,
    required this.status,
    this.catatan,
    this.tanggal,
  });

  factory KakApproval.fromJson(Map<String, dynamic> json) {
    return KakApproval(
      approverNama: json['approver_nama'] ?? 'Unknown',
      status: json['status'] ?? '',
      catatan: json['catatan'],
      tanggal: json['tanggal'],
    );
  }

  Map<String, dynamic> toJson() => {
    'approver_nama': approverNama,
    'status': status,
    'catatan': catatan,
    'tanggal': tanggal,
  };
}

// Complete KAK Detail Model with ALL fields from database
class KakDetail {
  // Basic Info
  final String kakId;
  final String namaKegiatan;
  final String deskripsiKegiatan;
  final String metodePelaksanaan;
  final String tanggalMulai;
  final String tanggalSelesai;
  final String lokasi;
  final String sasaranUtama;
  final String kurunWaktuPelaksanaan;

  // Status & Type
  final int statusId;
  final String statusNama;
  final int? tipeKegiatanId;
  final String? tipe;

  // Pengusul Info
  final String? pengusulNama;
  final String updatedAt;
  final String? catatanNamaKegiatan;
  final String? catatanDeskripsiKegiatan;
  final String? catatanTipeKegiatan;
  final String? catatanSasaranUtama;
  final String? catatanMetodePelaksanaan;
  final String? catatanLokasi;
  final String? catatanTanggal;

  // Child Collections
  final List<KakManfaat> manfaat;
  final List<KakTahapan> tahapan;
  final List<KakIndikatorKinerja> indikatorKinerja;
  final List<KakTargetIku> targetIku;
  final List<KakRab> rab;
  final List<KakApproval> approvals;

  KakDetail({
    required this.kakId,
    required this.namaKegiatan,
    required this.deskripsiKegiatan,
    required this.metodePelaksanaan,
    required this.tanggalMulai,
    required this.tanggalSelesai,
    required this.lokasi,
    required this.sasaranUtama,
    required this.kurunWaktuPelaksanaan,
    required this.statusId,
    required this.statusNama,
    this.tipeKegiatanId,
    this.tipe,
    this.pengusulNama,
    required this.updatedAt,
    this.catatanNamaKegiatan,
    this.catatanDeskripsiKegiatan,
    this.catatanTipeKegiatan,
    this.catatanSasaranUtama,
    this.catatanMetodePelaksanaan,
    this.catatanLokasi,
    this.catatanTanggal,
    required this.manfaat,
    required this.tahapan,
    required this.indikatorKinerja,
    required this.targetIku,
    required this.rab,
    required this.approvals,
  });

  factory KakDetail.fromJson(Map<String, dynamic> json) {
    return KakDetail(
      kakId: json['kak_id']?.toString() ?? '',
      namaKegiatan: json['nama_kegiatan'] ?? '',
      deskripsiKegiatan: json['deskripsi_kegiatan'] ?? '',
      metodePelaksanaan: json['metode_pelaksanaan'] ?? '',
      tanggalMulai: json['tanggal_mulai'] ?? '',
      tanggalSelesai: json['tanggal_selesai'] ?? '',
      lokasi: json['lokasi'] ?? '',
      sasaranUtama: json['sasaran_utama'] ?? '',
      kurunWaktuPelaksanaan: json['kurun_waktu_pelaksanaan'] ?? '',
      statusId: json['status_id'] ?? 0,
      statusNama: json['status_nama'] ?? 'Draft',
      tipeKegiatanId: json['tipe_kegiatan_id'],
      tipe: json['tipe'],
      pengusulNama: json['pengusul_nama'],
      updatedAt: json['updated_at'] ?? '',
      catatanNamaKegiatan: json['catatan_nama_kegiatan'],
      catatanDeskripsiKegiatan: json['catatan_deskripsi_kegiatan'],
      catatanTipeKegiatan: json['catatan_tipe_kegiatan'],
      catatanSasaranUtama: json['catatan_sasaran_utama'],
      catatanMetodePelaksanaan: json['catatan_metode_pelaksanaan'],
      catatanLokasi: json['catatan_lokasi'],
      catatanTanggal: json['catatan_tanggal'],
      manfaat:
          (json['manfaat'] as List?)
              ?.map((e) => KakManfaat.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      tahapan:
          (json['tahapan'] as List?)
              ?.map((e) => KakTahapan.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      indikatorKinerja:
          (json['indikator_kinerja'] as List?)
              ?.map(
                (e) => KakIndikatorKinerja.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
      targetIku:
          (json['target_iku'] as List?)
              ?.map((e) => KakTargetIku.fromJson(e as Map<String, dynamic>))
              .toList() ??
          (json['ikus'] as List?)
              ?.map((e) => KakTargetIku.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      rab:
          (json['rab'] as List?)
              ?.map((e) => KakRab.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      approvals:
          (json['approvals'] as List?)
              ?.map((e) => KakApproval.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'kak_id': kakId,
    'nama_kegiatan': namaKegiatan,
    'deskripsi_kegiatan': deskripsiKegiatan,
    'metode_pelaksanaan': metodePelaksanaan,
    'tanggal_mulai': tanggalMulai,
    'tanggal_selesai': tanggalSelesai,
    'lokasi': lokasi,
    'sasaran_utama': sasaranUtama,
    'kurun_waktu_pelaksanaan': kurunWaktuPelaksanaan,
    'status_id': statusId,
    'status_nama': statusNama,
    'tipe_kegiatan_id': tipeKegiatanId,
    'tipe': tipe,
    'pengusul_nama': pengusulNama,
    'updated_at': updatedAt,
    'manfaat': manfaat.map((e) => e.toJson()).toList(),
    'tahapan': tahapan.map((e) => e.toJson()).toList(),
    'indikator_kinerja': indikatorKinerja.map((e) => e.toJson()).toList(),
    'target_iku': targetIku.map((e) => e.toJson()).toList(),
    'rab': rab.map((e) => e.toJson()).toList(),
    'approvals': approvals.map((e) => e.toJson()).toList(),
  };

  // Helper to get total budget
  double getTotalBudget() {
    return rab.fold(0, (sum, item) => sum + (item.jumlahDiusulkan ?? 0));
  }

  // Helper to check if KAK is editable
  bool isEditable() {
    return statusId == 1; // Only draft KAKs can be edited
  }
}

// Helpers for safe parsing of numbers which might come as Strings from JSON
double? _parseDoubleOrNull(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value);
  return null;
}

double _parseDouble(dynamic value) {
  return _parseDoubleOrNull(value) ?? 0.0;
}
