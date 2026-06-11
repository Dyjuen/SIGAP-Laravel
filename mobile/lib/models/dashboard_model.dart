// ============================================================================
// Dashboard Models
// Menampung semua model data untuk berbagai dashboard role:
// Pengusul, Verifikator, PPK, Bendahara, Direktur.
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Generic Dashboard Stats (untuk role non-Direktur)
// ─────────────────────────────────────────────────────────────────────────────
class DashboardStats {
  final int totalKak;
  final int draftKak;
  final int reviewKak;
  final int approvedKak;
  final int rejectedKak;
  final int? kegiatanAktif;
  final int? lpjPending;
  final int? lpjApproved;
  final double? totalDanaDisusulkan;
  final double? totalDanaDicairkan;
  final int? pendingCount;
  final int? approvedCount;
  final int? rejectedCount;
  final int? totalVerified;
  final int? totalKegiatan;
  final int? kegiatanSelesai;

  DashboardStats({
    required this.totalKak,
    required this.draftKak,
    required this.reviewKak,
    required this.approvedKak,
    required this.rejectedKak,
    this.kegiatanAktif,
    this.lpjPending,
    this.lpjApproved,
    this.totalDanaDisusulkan,
    this.totalDanaDicairkan,
    this.pendingCount,
    this.approvedCount,
    this.rejectedCount,
    this.totalVerified,
    this.totalKegiatan,
    this.kegiatanSelesai,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalKak: json['total_kak'] ?? 0,
      draftKak: json['draft_kak'] ?? 0,
      reviewKak: json['review_kak'] ?? 0,
      approvedKak: json['approved_kak'] ?? 0,
      rejectedKak: json['rejected_kak'] ?? 0,
      kegiatanAktif: json['kegiatan_aktif'],
      lpjPending: json['lpj_pending'],
      lpjApproved: json['lpj_approved'],
      totalDanaDisusulkan: (json['total_dana_diusulkan'] as num?)?.toDouble(),
      totalDanaDicairkan: (json['total_dana_dicairkan'] as num?)?.toDouble(),
      pendingCount: json['pending_count'] ?? json['pending_approvals'] ?? json['pending_kak'] ?? json['review_kak'],
      approvedCount: json['approved_count'] ?? json['approved_kak'],
      rejectedCount: json['rejected_count'] ?? json['rejected_kak'],
      totalVerified: json['total_verified'] ?? json['total_kak'],
      totalKegiatan: json['total_kegiatan'],
      kegiatanSelesai: json['kegiatan_selesai'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_kak': totalKak,
      'draft_kak': draftKak,
      'review_kak': reviewKak,
      'approved_kak': approvedKak,
      'rejected_kak': rejectedKak,
      'kegiatan_aktif': kegiatanAktif,
      'lpj_pending': lpjPending,
      'lpj_approved': lpjApproved,
      'total_dana_diusulkan': totalDanaDisusulkan,
      'total_dana_dicairkan': totalDanaDicairkan,
      'pending_count': pendingCount,
      'approved_count': approvedCount,
      'rejected_count': rejectedCount,
      'total_verified': totalVerified,
      'total_kegiatan': totalKegiatan,
      'kegiatan_selesai': kegiatanSelesai,
    };
  }
}

class DashboardItem {
  final String id;
  final String nama;
  final String? pengusulNama;
  final String? tipe;
  final String? status;
  final String? tanggalMulai;
  final String? tanggalSelesai;
  final String? createdAt;
  final double? danaDisusulkan;
  final double? danaDicairkan;

  DashboardItem({
    required this.id,
    required this.nama,
    this.pengusulNama,
    this.tipe,
    this.status,
    this.tanggalMulai,
    this.tanggalSelesai,
    this.createdAt,
    this.danaDisusulkan,
    this.danaDicairkan,
  });

  factory DashboardItem.fromJson(Map<String, dynamic> json) {
    return DashboardItem(
      id: json['kak_id']?.toString() ?? json['kegiatan_id']?.toString() ?? '',
      nama: json['nama_kegiatan'] ?? json['nama'] ?? '',
      pengusulNama: json['pengusul_nama'],
      tipe: json['tipe'] ?? json['approval_level'],
      status: json['status_nama'] ?? json['status'],
      tanggalMulai: json['tanggal_mulai'],
      tanggalSelesai: json['tanggal_selesai'],
      createdAt: json['created_at'] ?? json['updated_at'],
      danaDisusulkan: (json['dana_diusulkan'] as num?)?.toDouble(),
      danaDicairkan: (json['dana_dicairkan'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nama': nama,
      'pengusul_nama': pengusulNama,
      'tipe': tipe,
      'status': status,
      'tanggal_mulai': tanggalMulai,
      'tanggal_selesai': tanggalSelesai,
      'created_at': createdAt,
      'dana_diusulkan': danaDisusulkan,
      'dana_dicairkan': danaDicairkan,
    };
  }
}

class DashboardResponse {
  final DashboardStats stats;
  final List<DashboardItem> items;
  final List<dynamic>? byJurusan;
  final String? message;

  DashboardResponse({
    required this.stats,
    required this.items,
    this.byJurusan,
    this.message,
  });

  factory DashboardResponse.fromJson(Map<String, dynamic> json) {
    final stats = DashboardStats.fromJson(json['stats'] ?? {});

    List<DashboardItem> items = [];

    final recentKaks = json['recent_kaks'] as List?;
    final pendingKaks = json['pending_kaks'] as List?;
    final pendingKegiatans = (json['pending_kegiatans'] ?? json['pending_kegiatan']) as List?;
    final pendingLpjs = json['pending_lpjs'] as List?;
    final recentActivities = json['recent_activities'] as List?;

    if (recentKaks != null) {
      items = recentKaks.map((e) => DashboardItem.fromJson(e as Map<String, dynamic>)).toList();
    } else if (pendingKaks != null) {
      items = pendingKaks.map((e) => DashboardItem.fromJson(e as Map<String, dynamic>)).toList();
    } else if (pendingKegiatans != null) {
      items = pendingKegiatans.map((e) => DashboardItem.fromJson(e as Map<String, dynamic>)).toList();
    } else if (pendingLpjs != null) {
      items = pendingLpjs.map((e) => DashboardItem.fromJson(e as Map<String, dynamic>)).toList();
    } else if (recentActivities != null) {
      items = recentActivities.map((e) => DashboardItem.fromJson(e as Map<String, dynamic>)).toList();
    }

    return DashboardResponse(
      stats: stats,
      items: items,
      byJurusan: json['by_jurusan'] as List?,
      message: json['message'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stats': stats.toJson(),
      'items': items.map((e) => e.toJson()).toList(),
      'by_jurusan': byJurusan,
      'message': message,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Direktur-specific Models
// ─────────────────────────────────────────────────────────────────────────────

/// Overview finansial dan kegiatan untuk Dashboard Direktur
class DirektorOverview {
  final int totalKak;
  final int kegiatanSelesai;
  final int kegiatanBerlangsung;
  final int totalKegiatan;
  final double danaDiminta;
  final double danaTerserap;
  final double persentaseSerapan;
  final double budgetGrowth;

  const DirektorOverview({
    required this.totalKak,
    required this.kegiatanSelesai,
    required this.kegiatanBerlangsung,
    required this.totalKegiatan,
    required this.danaDiminta,
    required this.danaTerserap,
    required this.persentaseSerapan,
    required this.budgetGrowth,
  });

  factory DirektorOverview.fromJson(Map<String, dynamic> json) {
    return DirektorOverview(
      totalKak: json['total_kak'] ?? 0,
      kegiatanSelesai: json['kegiatan_selesai'] ?? 0,
      kegiatanBerlangsung: json['kegiatan_berlangsung'] ?? 0,
      totalKegiatan: json['total_kegiatan'] ?? 0,
      danaDiminta: (json['dana_diminta'] as num?)?.toDouble() ?? 0.0,
      danaTerserap: (json['dana_terserap'] as num?)?.toDouble() ?? 0.0,
      persentaseSerapan: (json['persentase_serapan'] as num?)?.toDouble() ?? 0.0,
      budgetGrowth: (json['budget_growth'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

/// Satu kegiatan beserta skor TOPSIS-nya
class TopsisActivity {
  final String kegiatanId;
  final String namaKegiatan;
  final String jurusan;
  final double c1; // Ketepatan Waktu
  final double c2; // Ketepatan Anggaran
  final double c3; // Kesesuaian Output
  final double c4; // Kepatuhan LPJ
  final double topsisScore;
  final String kategori;
  final double sPos;
  final double sNeg;

  // New debug variables
  final Map<String, dynamic> c1Debug;
  final Map<String, dynamic> c2Debug;
  final Map<String, dynamic> c3Debug;
  final Map<String, dynamic> c4Debug;
  final Map<String, dynamic> idealPos;
  final Map<String, dynamic> idealNeg;
  
  final double r1;
  final double r2;
  final double r3;
  final double r4;
  final double v1;
  final double v2;
  final double v3;
  final double v4;
  
  final double normC1;
  final double normC2;
  final double normC3;
  final double normC4;
  
  final double w1;
  final double w2;
  final double w3;
  final double w4;

  const TopsisActivity({
    required this.kegiatanId,
    required this.namaKegiatan,
    required this.jurusan,
    required this.c1,
    required this.c2,
    required this.c3,
    required this.c4,
    required this.topsisScore,
    required this.kategori,
    required this.sPos,
    required this.sNeg,
    required this.c1Debug,
    required this.c2Debug,
    required this.c3Debug,
    required this.c4Debug,
    required this.idealPos,
    required this.idealNeg,
    required this.r1,
    required this.r2,
    required this.r3,
    required this.r4,
    required this.v1,
    required this.v2,
    required this.v3,
    required this.v4,
    required this.normC1,
    required this.normC2,
    required this.normC3,
    required this.normC4,
    required this.w1,
    required this.w2,
    required this.w3,
    required this.w4,
  });

  factory TopsisActivity.fromJson(Map<String, dynamic> json) {
    return TopsisActivity(
      kegiatanId: json['kegiatan_id']?.toString() ?? '',
      namaKegiatan: json['nama_kegiatan'] ?? '-',
      jurusan: json['jurusan'] ?? '-',
      c1: (json['c1'] as num?)?.toDouble() ?? 0.0,
      c2: (json['c2'] as num?)?.toDouble() ?? 0.0,
      c3: (json['c3'] as num?)?.toDouble() ?? 0.0,
      c4: (json['c4'] as num?)?.toDouble() ?? 0.0,
      topsisScore: (json['topsis_score'] as num?)?.toDouble() ?? 0.0,
      kategori: json['kategori'] ?? 'Kurang',
      sPos: (json['s_pos'] as num?)?.toDouble() ?? 0.0,
      sNeg: (json['s_neg'] as num?)?.toDouble() ?? 0.0,
      c1Debug: json['c1_debug'] as Map<String, dynamic>? ?? {},
      c2Debug: json['c2_debug'] as Map<String, dynamic>? ?? {},
      c3Debug: json['c3_debug'] as Map<String, dynamic>? ?? {},
      c4Debug: json['c4_debug'] as Map<String, dynamic>? ?? {},
      idealPos: json['ideal_pos'] as Map<String, dynamic>? ?? {},
      idealNeg: json['ideal_neg'] as Map<String, dynamic>? ?? {},
      r1: (json['r1'] as num?)?.toDouble() ?? 0.0,
      r2: (json['r2'] as num?)?.toDouble() ?? 0.0,
      r3: (json['r3'] as num?)?.toDouble() ?? 0.0,
      r4: (json['r4'] as num?)?.toDouble() ?? 0.0,
      v1: (json['v1'] as num?)?.toDouble() ?? 0.0,
      v2: (json['v2'] as num?)?.toDouble() ?? 0.0,
      v3: (json['v3'] as num?)?.toDouble() ?? 0.0,
      v4: (json['v4'] as num?)?.toDouble() ?? 0.0,
      normC1: (json['norm_c1'] as num?)?.toDouble() ?? 1.0,
      normC2: (json['norm_c2'] as num?)?.toDouble() ?? 1.0,
      normC3: (json['norm_c3'] as num?)?.toDouble() ?? 1.0,
      normC4: (json['norm_c4'] as num?)?.toDouble() ?? 1.0,
      w1: (json['w1'] as num?)?.toDouble() ?? 25.0,
      w2: (json['w2'] as num?)?.toDouble() ?? 25.0,
      w3: (json['w3'] as num?)?.toDouble() ?? 25.0,
      w4: (json['w4'] as num?)?.toDouble() ?? 25.0,
    );
  }
}

/// Agregat TOPSIS per jurusan/unit kerja
class TopsisJurusan {
  final String namaJurusan;
  final double avgScore;
  final double avgC1;
  final double avgC2;
  final double avgC3;
  final double avgC4;
  final int kakDiajukan;
  final int kegiatanSelesai;
  final double persentaseSerapan;
  final double danaDiminta;
  final double danaTerserap;
  final List<TopsisActivity> activities;

  const TopsisJurusan({
    required this.namaJurusan,
    required this.avgScore,
    required this.avgC1,
    required this.avgC2,
    required this.avgC3,
    required this.avgC4,
    required this.kakDiajukan,
    required this.kegiatanSelesai,
    required this.persentaseSerapan,
    required this.danaDiminta,
    required this.danaTerserap,
    required this.activities,
  });

  String get performanceLabel {
    if (avgScore >= 0.7) return 'Kinerja Unggul';
    if (avgScore >= 0.5) return 'Kinerja Stabil';
    return 'Butuh Akselerasi';
  }

  bool get isUnggul => avgScore >= 0.7;
  bool get isStabil => avgScore >= 0.5 && avgScore < 0.7;
}

/// Data tren per bulan
class TrendData {
  final String periode;
  final int totalKegiatan;
  final double danaDiminta;
  final double danaTerserap;
  final int perluPerhatian;

  const TrendData({
    required this.periode,
    required this.totalKegiatan,
    required this.danaDiminta,
    required this.danaTerserap,
    required this.perluPerhatian,
  });

  factory TrendData.fromJson(Map<String, dynamic> json) {
    return TrendData(
      periode: json['periode'] ?? '',
      totalKegiatan: json['total_kegiatan'] ?? 0,
      danaDiminta: (json['dana_diminta'] as num?)?.toDouble() ?? 0.0,
      danaTerserap: (json['dana_terserap'] as num?)?.toDouble() ?? 0.0,
      perluPerhatian: json['perlu_perhatian'] ?? 0,
    );
  }
}

/// Konfigurasi bobot kriteria SPK TOPSIS
class SpkConfig {
  final double weightWaktu;
  final double weightAnggaran;
  final double weightOutput;
  final double weightLpj;

  const SpkConfig({
    required this.weightWaktu,
    required this.weightAnggaran,
    required this.weightOutput,
    required this.weightLpj,
  });

  factory SpkConfig.fromJson(Map<String, dynamic> json) {
    return SpkConfig(
      weightWaktu: (json['weight_waktu'] as num?)?.toDouble() ?? 25.0,
      weightAnggaran: (json['weight_anggaran'] as num?)?.toDouble() ?? 25.0,
      weightOutput: (json['weight_output'] as num?)?.toDouble() ?? 25.0,
      weightLpj: (json['weight_lpj'] as num?)?.toDouble() ?? 25.0,
    );
  }
}

/// Satu aktivitas terbaru di log
class RecentActivity {
  final String namaKegiatan;
  final String? pengusulNama;
  final String? approvalLevel;
  final String? status;
  final String? createdAt;
  final String? jurusan;

  const RecentActivity({
    required this.namaKegiatan,
    this.pengusulNama,
    this.approvalLevel,
    this.status,
    this.createdAt,
    this.jurusan,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      namaKegiatan: json['nama_kegiatan'] ?? '-',
      pengusulNama: json['pengusul_nama'],
      approvalLevel: json['approval_level'],
      status: json['status'],
      createdAt: json['created_at'],
      jurusan: json['jurusan'],
    );
  }
}

/// Satu unit/jurusan dari by_jurusan API
class JurusanData {
  final String namaJurusan;
  final int kakDiajukan;
  final int kegiatanSelesai;
  final int kegiatanBerlangsung;
  final double danaDiminta;
  final double danaTerserap;
  final double persentaseSerapan;
  final double topsisScore;

  const JurusanData({
    required this.namaJurusan,
    required this.kakDiajukan,
    required this.kegiatanSelesai,
    required this.kegiatanBerlangsung,
    required this.danaDiminta,
    required this.danaTerserap,
    required this.persentaseSerapan,
    required this.topsisScore,
  });

  factory JurusanData.fromJson(Map<String, dynamic> json) {
    return JurusanData(
      namaJurusan: json['nama_jurusan'] ?? '-',
      kakDiajukan: json['kak_diajukan'] ?? 0,
      kegiatanSelesai: json['kegiatan_selesai'] ?? 0,
      kegiatanBerlangsung: json['kegiatan_berlangsung'] ?? 0,
      danaDiminta: (json['dana_diminta'] as num?)?.toDouble() ?? 0.0,
      danaTerserap: (json['dana_terserap'] as num?)?.toDouble() ?? 0.0,
      persentaseSerapan: (json['persentase_serapan'] as num?)?.toDouble() ?? 0.0,
      topsisScore: (json['topsis_score'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

/// Full response dari /api/direktur/dashboard
class DirektorDashboardData {
  final DashboardStats stats;
  final DirektorOverview overview;
  final List<JurusanData> byJurusan;
  final List<TopsisActivity> topsisActivities;
  final List<TrendData> trends;
  final List<RecentActivity> recentActivities;
  final SpkConfig spkConfig;
  final String period;
  final JurusanData? bestUnit;
  final JurusanData? worstUnit;

  // Computed: group topsis activities by jurusan
  late final List<TopsisJurusan> topsisJurusans;

  DirektorDashboardData({
    required this.stats,
    required this.overview,
    required this.byJurusan,
    required this.topsisActivities,
    required this.trends,
    required this.recentActivities,
    required this.spkConfig,
    required this.period,
    this.bestUnit,
    this.worstUnit,
  }) {
    // Compute aggregated topsis per jurusan
    final Map<String, List<TopsisActivity>> grouped = {};
    for (final act in topsisActivities) {
      grouped.putIfAbsent(act.jurusan, () => []).add(act);
    }

    topsisJurusans = grouped.entries.map((entry) {
      final acts = entry.value;
      final jurusanRow = byJurusan.firstWhere(
        (j) => j.namaJurusan == entry.key,
        orElse: () => JurusanData(
          namaJurusan: entry.key,
          kakDiajukan: 0,
          kegiatanSelesai: 0,
          kegiatanBerlangsung: 0,
          danaDiminta: 0,
          danaTerserap: 0,
          persentaseSerapan: 0,
          topsisScore: 0,
        ),
      );
      return TopsisJurusan(
        namaJurusan: entry.key,
        avgScore: acts.isEmpty ? 0 : acts.map((a) => a.topsisScore).reduce((a, b) => a + b) / acts.length,
        avgC1: acts.isEmpty ? 0 : acts.map((a) => a.c1).reduce((a, b) => a + b) / acts.length,
        avgC2: acts.isEmpty ? 0 : acts.map((a) => a.c2).reduce((a, b) => a + b) / acts.length,
        avgC3: acts.isEmpty ? 0 : acts.map((a) => a.c3).reduce((a, b) => a + b) / acts.length,
        avgC4: acts.isEmpty ? 0 : acts.map((a) => a.c4).reduce((a, b) => a + b) / acts.length,
        kakDiajukan: jurusanRow.kakDiajukan,
        kegiatanSelesai: jurusanRow.kegiatanSelesai,
        persentaseSerapan: jurusanRow.persentaseSerapan,
        danaDiminta: jurusanRow.danaDiminta,
        danaTerserap: jurusanRow.danaTerserap,
        activities: acts,
      );
    }).toList()
      ..sort((a, b) => b.avgScore.compareTo(a.avgScore));
  }

  factory DirektorDashboardData.fromJson(Map<String, dynamic> json) {
    final stats = DashboardStats.fromJson(json['stats'] ?? {});
    final overview = DirektorOverview.fromJson(json['overview'] ?? {});

    final byJurusan = (json['by_jurusan'] as List? ?? [])
        .map((e) => JurusanData.fromJson(e as Map<String, dynamic>))
        .toList();

    final topsisActivities = (json['topsis_activities'] as List? ?? [])
        .map((e) => TopsisActivity.fromJson(e as Map<String, dynamic>))
        .toList();

    final trends = (json['trends'] as List? ?? [])
        .map((e) => TrendData.fromJson(e as Map<String, dynamic>))
        .toList();

    final recentActivities = (json['recent_activities'] as List? ?? [])
        .map((e) => RecentActivity.fromJson(e as Map<String, dynamic>))
        .toList();

    final spkConfig = SpkConfig.fromJson(json['spk_config'] as Map<String, dynamic>? ?? {});

    JurusanData? bestUnit;
    JurusanData? worstUnit;
    if (json['best_unit'] != null) {
      bestUnit = JurusanData.fromJson(json['best_unit'] as Map<String, dynamic>);
    }
    if (json['worst_unit'] != null) {
      worstUnit = JurusanData.fromJson(json['worst_unit'] as Map<String, dynamic>);
    }

    return DirektorDashboardData(
      stats: stats,
      overview: overview,
      byJurusan: byJurusan,
      topsisActivities: topsisActivities,
      trends: trends,
      recentActivities: recentActivities,
      spkConfig: spkConfig,
      period: json['period'] ?? 'year',
      bestUnit: bestUnit,
      worstUnit: worstUnit,
    );
  }
}
