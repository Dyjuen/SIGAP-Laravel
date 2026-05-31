class LpjRealization {
  final String anggaranId;
  final String kakId;
  final String mataAnggaranNama;
  final String uraianKegiatan;
  final double volume;
  final String? satuanId;
  final double hargaSatuan;
  final double jumlahDiusulkan;
  final double? realisasiVolume1;
  final String? realisasiSatuan1Id;
  final double? realisasiVolume2;
  final String? realisasiSatuan2Id;
  final double? realisasiVolume3;
  final String? realisasiSatuan3Id;
  final double? realisasiHargaSatuan;
  final double realisasiJumlah;

  LpjRealization({
    required this.anggaranId,
    required this.kakId,
    required this.mataAnggaranNama,
    required this.uraianKegiatan,
    required this.volume,
    this.satuanId,
    required this.hargaSatuan,
    required this.jumlahDiusulkan,
    this.realisasiVolume1,
    this.realisasiSatuan1Id,
    this.realisasiVolume2,
    this.realisasiSatuan2Id,
    this.realisasiVolume3,
    this.realisasiSatuan3Id,
    this.realisasiHargaSatuan,
    required this.realisasiJumlah,
  });

  factory LpjRealization.fromJson(Map<String, dynamic> json) {
    return LpjRealization(
      anggaranId: json['anggaran_id']?.toString() ?? '',
      kakId: json['kak_id']?.toString() ?? '',
      mataAnggaranNama: json['mata_anggaran_nama'] ?? '',
      uraianKegiatan: json['uraian_kegiatan'] ?? '',
      volume: _parseDouble(json['volume']),
      satuanId: json['satuan_id']?.toString(),
      hargaSatuan: _parseDouble(json['harga_satuan']),
      jumlahDiusulkan: _parseDouble(json['jumlah_diusulkan']),
      realisasiVolume1: json['realisasi_volume1'] != null
          ? _parseDouble(json['realisasi_volume1'])
          : null,
      realisasiSatuan1Id: json['realisasi_satuan1_id']?.toString(),
      realisasiVolume2: json['realisasi_volume2'] != null
          ? _parseDouble(json['realisasi_volume2'])
          : null,
      realisasiSatuan2Id: json['realisasi_satuan2_id']?.toString(),
      realisasiVolume3: json['realisasi_volume3'] != null
          ? _parseDouble(json['realisasi_volume3'])
          : null,
      realisasiSatuan3Id: json['realisasi_satuan3_id']?.toString(),
      realisasiHargaSatuan: json['realisasi_harga_satuan'] != null
          ? _parseDouble(json['realisasi_harga_satuan'])
          : null,
      realisasiJumlah: _parseDouble(json['realisasi_jumlah']),
    );
  }

  Map<String, dynamic> toJson() => {
    'anggaran_id': anggaranId,
    'kak_id': kakId,
    'mata_anggaran_nama': mataAnggaranNama,
    'uraian_kegiatan': uraianKegiatan,
    'volume': volume,
    'satuan_id': satuanId,
    'harga_satuan': hargaSatuan,
    'jumlah_diusulkan': jumlahDiusulkan,
    'realisasi_volume1': realisasiVolume1,
    'realisasi_satuan1_id': realisasiSatuan1Id,
    'realisasi_volume2': realisasiVolume2,
    'realisasi_satuan2_id': realisasiSatuan2Id,
    'realisasi_volume3': realisasiVolume3,
    'realisasi_satuan3_id': realisasiSatuan3Id,
    'realisasi_harga_satuan': realisasiHargaSatuan,
    'realisasi_jumlah': realisasiJumlah,
  };

  double get percentageRealized {
    return jumlahDiusulkan > 0 ? (realisasiJumlah / jumlahDiusulkan) * 100 : 0;
  }
}

class LpjDetail {
  final String kegiatanId;
  final String kakId;
  final String namaKegiatan;
  final String lpjStatus;
  final String? lpjSubmittedAt;
  final String? lpjApprovedAt;
  final String? lpjCompletedAt;
  final String? tglBatasLpj;
  final int? spkKesesuaianWaktu;
  final int? spkKesesuaianOutput;
  final String? pengusulNama;
  final String? pengusulId;
  final List<LpjRealization> anggaranItems;
  final String approvalStatus;
  final String? approvalNotes;

  LpjDetail({
    required this.kegiatanId,
    required this.kakId,
    required this.namaKegiatan,
    required this.lpjStatus,
    this.lpjSubmittedAt,
    this.lpjApprovedAt,
    this.lpjCompletedAt,
    this.tglBatasLpj,
    this.spkKesesuaianWaktu,
    this.spkKesesuaianOutput,
    this.pengusulNama,
    this.pengusulId,
    required this.anggaranItems,
    required this.approvalStatus,
    this.approvalNotes,
  });

  factory LpjDetail.fromJson(Map<String, dynamic> json) {
    final anggaranList =
        (json['anggaran_items'] as List<dynamic>?)
            ?.map(
              (item) => LpjRealization.fromJson(item as Map<String, dynamic>),
            )
            .toList() ??
        [];

    return LpjDetail(
      kegiatanId: json['kegiatan_id']?.toString() ?? '',
      kakId: json['kak_id']?.toString() ?? '',
      namaKegiatan: json['nama_kegiatan'] ?? '',
      lpjStatus: json['lpj_status'] ?? 'Draft',
      lpjSubmittedAt: json['lpj_submitted_at']?.toString(),
      lpjApprovedAt: json['lpj_approved_at']?.toString(),
      lpjCompletedAt: json['lpj_completed_at']?.toString(),
      tglBatasLpj: json['tgl_batas_lpj']?.toString(),
      spkKesesuaianWaktu: json['spk_kesesuaian_waktu'] != null
          ? int.tryParse(json['spk_kesesuaian_waktu'].toString())
          : null,
      spkKesesuaianOutput: json['spk_kesesuaian_output'] != null
          ? int.tryParse(json['spk_kesesuaian_output'].toString())
          : null,
      pengusulNama: json['pengusul']?['nama_lengkap'],
      pengusulId: json['pengusul']?['user_id']?.toString(),
      anggaranItems: anggaranList,
      approvalStatus: json['approval_status'] ?? 'Pending',
      approvalNotes: json['approval_notes']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'kegiatan_id': kegiatanId,
    'kak_id': kakId,
    'nama_kegiatan': namaKegiatan,
    'lpj_status': lpjStatus,
    'lpj_submitted_at': lpjSubmittedAt,
    'lpj_approved_at': lpjApprovedAt,
    'lpj_completed_at': lpjCompletedAt,
    'tgl_batas_lpj': tglBatasLpj,
    'spk_kesesuaian_waktu': spkKesesuaianWaktu,
    'spk_kesesuaian_output': spkKesesuaianOutput,
    'pengusul': {'nama_lengkap': pengusulNama, 'user_id': pengusulId},
    'anggaran_items': anggaranItems.map((i) => i.toJson()).toList(),
    'approval_status': approvalStatus,
    'approval_notes': approvalNotes,
  };

  bool get isDraft => lpjStatus == 'Draft';
  bool get isSubmitted => lpjStatus == 'Submitted';
  bool get isApproved => lpjStatus == 'Approved';
  bool get isRevisionRequested => lpjStatus == 'Revision Requested';
  bool get isCompleted => lpjStatus == 'Completed';
  bool get canEditPengusul => isDraft || isRevisionRequested;

  double get totalAnggaranDiusulkan {
    return anggaranItems.fold(0, (sum, item) => sum + item.jumlahDiusulkan);
  }

  double get totalRealisasi {
    return anggaranItems.fold(0, (sum, item) => sum + item.realisasiJumlah);
  }

  double get averageRealizationPercent {
    if (anggaranItems.isEmpty) return 0;
    final totalPercent = anggaranItems.fold(
      0.0,
      (sum, item) => sum + item.percentageRealized,
    );
    return totalPercent / anggaranItems.length;
  }

  String get statusDisplay {
    switch (lpjStatus) {
      case 'Draft':
        return 'Draft';
      case 'Submitted':
        return 'Menunggu Approval';
      case 'Approved':
        return 'Disetujui';
      case 'Revision Requested':
        return 'Perlu Revisi';
      case 'Completed':
        return 'Selesai';
      default:
        return lpjStatus;
    }
  }
}

class LpjListItem {
  final String kegiatanId;
  final String kakId;
  final String namaKegiatan;
  final String statusNama;
  final String lpjStatus;
  final String? lpjSubmittedAt;
  final String? tglBatasLpj;
  final double totalAnggaranDiusulkan;
  final double danaDicairkan;
  final double sisaDana;

  LpjListItem({
    required this.kegiatanId,
    required this.kakId,
    required this.namaKegiatan,
    required this.statusNama,
    required this.lpjStatus,
    this.lpjSubmittedAt,
    this.tglBatasLpj,
    required this.totalAnggaranDiusulkan,
    required this.danaDicairkan,
    required this.sisaDana,
  });

  factory LpjListItem.fromJson(Map<String, dynamic> json) {
    return LpjListItem(
      kegiatanId: json['kegiatan_id']?.toString() ?? '',
      kakId: json['kak_id']?.toString() ?? '',
      namaKegiatan: json['nama_kegiatan'] ?? '',
      statusNama: json['status_nama'] ?? '',
      lpjStatus: json['lpj_status'] ?? 'Draft',
      lpjSubmittedAt: json['lpj_submitted_at']?.toString(),
      tglBatasLpj: json['tgl_batas_lpj']?.toString(),
      totalAnggaranDiusulkan: _parseDouble(json['total_anggaran_diusulkan']),
      danaDicairkan: _parseDouble(json['dana_dicairkan']),
      sisaDana: _parseDouble(json['sisa_dana']),
    );
  }

  Map<String, dynamic> toJson() => {
    'kegiatan_id': kegiatanId,
    'kak_id': kakId,
    'nama_kegiatan': namaKegiatan,
    'status_nama': statusNama,
    'lpj_status': lpjStatus,
    'lpj_submitted_at': lpjSubmittedAt,
    'tgl_batas_lpj': tglBatasLpj,
    'total_anggaran_diusulkan': totalAnggaranDiusulkan,
    'dana_dicairkan': danaDicairkan,
    'sisa_dana': sisaDana,
  };

  String get lpjStatusDisplay {
    switch (lpjStatus) {
      case 'Draft':
        return 'Draft';
      case 'Submitted':
        return 'Menunggu Approval';
      case 'Approved':
        return 'Disetujui';
      case 'Revision Requested':
        return 'Perlu Revisi';
      case 'Completed':
        return 'Selesai';
      default:
        return lpjStatus;
    }
  }
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
