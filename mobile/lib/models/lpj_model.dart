import 'package:flutter/foundation.dart';

class LpjLampiran {
  final int lampiranId;
  final String namaFileAsli;
  final String url;
  final String status;
  final String? catatanReviewer;
  final DateTime uploadedAt;

  LpjLampiran({
    required this.lampiranId,
    required this.namaFileAsli,
    required this.url,
    required this.status,
    this.catatanReviewer,
    required this.uploadedAt,
  });

  factory LpjLampiran.fromJson(Map<String, dynamic> json) {
    return LpjLampiran(
      lampiranId: json['lampiran_id'] as int,
      namaFileAsli: json['nama_file_asli'] as String,
      url: json['url'] as String,
      status: json['status'] as String,
      catatanReviewer: json['catatan_reviewer'] as String?,
      uploadedAt: DateTime.parse(json['uploaded_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'lampiran_id': lampiranId,
        'nama_file_asli': namaFileAsli,
        'url': url,
        'status': status,
        'catatan_reviewer': catatanReviewer,
        'uploaded_at': uploadedAt.toIso8601String(),
      };
}

class LpjRealization {
  final String anggaranId;
  final String kakId;
  final String mataAnggaranNama;
  final String uraian;
  final int kategoriBelanjaId;
  final String? kategoriNama;
  final double volume; // KAK volume1
  final String? satuanId; // KAK satuan1_id
  final double? volume2; // KAK volume2
  final String? satuan2Id; // KAK satuan2_id
  final double? volume3; // KAK volume3
  final String? satuan3Id; // KAK satuan3_id
  final double hargaSatuan; // KAK harga_satuan
  final double jumlahDiusulkan;
  final double? realisasiVolume1;
  final String? realisasiSatuan1Id;
  final double? realisasiVolume2;
  final String? realisasiSatuan2Id;
  final double? realisasiVolume3;
  final String? realisasiSatuan3Id;
  final double? realisasiHargaSatuan;
  final double realisasiJumlah;
  final String? catatanReviewer;
  final List<LpjLampiran>? lampiran;
  final String? satuan1Nama;
  final String? satuan2Nama;
  final String? satuan3Nama;

  LpjRealization({
    required this.anggaranId,
    required this.kakId,
    required this.mataAnggaranNama,
    required this.uraian,
    required this.kategoriBelanjaId,
    this.kategoriNama,
    required this.volume,
    this.satuanId,
    this.volume2,
    this.satuan2Id,
    this.volume3,
    this.satuan3Id,
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
    this.catatanReviewer,
    this.lampiran,
    this.satuan1Nama,
    this.satuan2Nama,
    this.satuan3Nama,
  });

  factory LpjRealization.fromJson(Map<String, dynamic> json) {
    final catatan = json['catatan_reviewer'];
    if (catatan != null) {
      debugPrint(
        'LpjRealization: Anggaran ${json['anggaran_id']} received note: $catatan',
      );
    }
    final uraianVal =
        (json['uraian'] ?? json['nama_item'] ?? json['keterangan'])?.toString() ?? '';
    debugPrint(
        'DEBUG LPJ ITEM: ID=${json['anggaran_id']}, URAIAN=$uraianVal, RAW=${json['uraian']}');

    final List<LpjLampiran> lampiranList = (json['lampiran'] as List<dynamic>?)
            ?.map((e) => LpjLampiran.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return LpjRealization(
      anggaranId: json['anggaran_id']?.toString() ?? '',
      kakId: json['kak_id']?.toString() ?? '',
      mataAnggaranNama: json['mata_anggaran_nama']?.toString() ?? '',
      uraian: uraianVal,
      kategoriBelanjaId: json['kategori_belanja_id'] != null
          ? int.tryParse(json['kategori_belanja_id'].toString()) ?? 1
          : 1,
      kategoriNama: json['kategori_belanja'] != null
          ? json['kategori_belanja']['nama'] ??
              json['kategori_belanja']['nama_kategori_belanja']
          : null,
      volume: _parseDouble(json['volume1'] ?? json['volume']),
      satuanId: (json['satuan1_id'] ?? json['satuan_id'])?.toString(),
      volume2: json['volume2'] != null ? _parseDouble(json['volume2']) : null,
      satuan2Id: json['satuan2_id']?.toString(),
      volume3: json['volume3'] != null ? _parseDouble(json['volume3']) : null,
      satuan3Id: json['satuan3_id']?.toString(),
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
      catatanReviewer: catatan,
      lampiran: lampiranList.isEmpty ? null : lampiranList,
      satuan1Nama: json['satuan1_nama']?.toString(),
      satuan2Nama: json['satuan2_nama']?.toString(),
      satuan3Nama: json['satuan3_nama']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'anggaran_id': anggaranId,
        'kak_id': kakId,
        'mata_anggaran_nama': mataAnggaranNama,
        'uraian': uraian,
        'kategori_belanja_id': kategoriBelanjaId,
        'volume': volume,
        'satuan_id': satuanId,
        'volume2': volume2,
        'satuan2_id': satuan2Id,
        'volume3': volume3,
        'satuan3_id': satuan3Id,
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
        'catatan_reviewer': catatanReviewer,
        'lampiran': lampiran?.map((e) => e.toJson()).toList(),
        'satuan1_nama': satuan1Nama,
        'satuan2_nama': satuan2Nama,
        'satuan3_nama': satuan3Nama,
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
  final int? spkKetepatanAnggaran;
  final int? spkKetepatanWaktuLpj;
  final String? pengusulNama;
  final String? pengusulId;
  final List<LpjRealization> anggaranItems;
  final String approvalStatus;
  final String? approvalNotes;
  final String? realisasiTglMulai;
  final String? realisasiTglSelesai;

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
    this.spkKetepatanAnggaran,
    this.spkKetepatanWaktuLpj,
    this.pengusulNama,
    this.pengusulId,
    required this.anggaranItems,
    required this.approvalStatus,
    this.approvalNotes,
    this.realisasiTglMulai,
    this.realisasiTglSelesai,
  });

  factory LpjDetail.fromJson(Map<String, dynamic> json) {
    final anggaranList = (json['anggaran_items'] as List<dynamic>?)
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
      spkKetepatanAnggaran: json['spk_ketepatan_anggaran'] != null
          ? int.tryParse(json['spk_ketepatan_anggaran'].toString())
          : null,
      spkKetepatanWaktuLpj: json['spk_ketepatan_waktu_lpj'] != null
          ? int.tryParse(json['spk_ketepatan_waktu_lpj'].toString())
          : null,
      pengusulNama: json['pengusul']?['nama_lengkap'],
      pengusulId: json['pengusul']?['user_id']?.toString(),
      anggaranItems: anggaranList,
      approvalStatus: json['approval_status'] ?? 'Pending',
      approvalNotes: json['approval_notes']?.toString(),
      realisasiTglMulai: json['realisasi_tgl_mulai']?.toString(),
      realisasiTglSelesai: json['realisasi_tgl_selesai']?.toString(),
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
        'spk_ketepatan_anggaran': spkKetepatanAnggaran,
        'spk_ketepatan_waktu_lpj': spkKetepatanWaktuLpj,
        'pengusul': {'nama_lengkap': pengusulNama, 'user_id': pengusulId},
        'anggaran_items': anggaranItems.map((i) => i.toJson()).toList(),
        'approval_status': approvalStatus,
        'approval_notes': approvalNotes,
        'realisasi_tgl_mulai': realisasiTglMulai,
        'realisasi_tgl_selesai': realisasiTglSelesai,
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
  final int? statusId;
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
    this.statusId,
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
      statusId: json['status_id'] != null
          ? int.tryParse(json['status_id'].toString())
          : null,
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
    // If KAK status indicates 'Setor Fisik Dokumen' (status_id == 13),
    // show that as an LPJ step between 'Disetujui' and 'Selesai'.
    if (statusId == 13) return 'Setor Fisik';
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

