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
      tipe: json['tipe'],
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
  final String? message;

  DashboardResponse({required this.stats, required this.items, this.message});

  factory DashboardResponse.fromJson(Map<String, dynamic> json) {
    final stats = DashboardStats.fromJson(json['stats'] ?? {});

    List<DashboardItem> items = [];

    // Parsing berbagai tipe response sesuai role
    final recentKaks = json['recent_kaks'] as List?;
    final pendingKaks = json['pending_kaks'] as List?;
    final pendingKegiatans = (json['pending_kegiatans'] ?? json['pending_kegiatan']) as List?;
    final pendingLpjs = json['pending_lpjs'] as List?;

    if (recentKaks != null) {
      items = recentKaks
          .map((e) => DashboardItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } else if (pendingKaks != null) {
      items = pendingKaks
          .map((e) => DashboardItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } else if (pendingKegiatans != null) {
      items = pendingKegiatans
          .map((e) => DashboardItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } else if (pendingLpjs != null) {
      items = pendingLpjs
          .map((e) => DashboardItem.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    return DashboardResponse(
      stats: stats,
      items: items,
      message: json['message'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stats': stats.toJson(),
      'items': items.map((e) => e.toJson()).toList(),
      'message': message,
    };
  }
}
