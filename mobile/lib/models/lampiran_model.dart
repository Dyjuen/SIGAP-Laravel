class LampiranModel {
  final String lampiranId;
  final String anggaran_id;
  final String namaFileAsli;
  final String pathFileDisimpan;
  final String uploaderUserId;
  final String? uploaderNama;
  final String statusLampiran; // pending, approved, revision_requested, archived
  final String statusApproval; // pending, approved, rejected
  final String? catatan;
  final String? catatanReviewer;
  final String? reviewerUserId;
  final String? reviewerNama;
  final String? approvalTanggal;
  final String? catatanTanggal;
  final int revisiKe;
  final String? parentLampiranId;
  final String createdAt;
  final String updatedAt;

  LampiranModel({
    required this.lampiranId,
    required this.anggaran_id,
    required this.namaFileAsli,
    required this.pathFileDisimpan,
    required this.uploaderUserId,
    this.uploaderNama,
    required this.statusLampiran,
    required this.statusApproval,
    this.catatan,
    this.catatanReviewer,
    this.reviewerUserId,
    this.reviewerNama,
    this.approvalTanggal,
    this.catatanTanggal,
    required this.revisiKe,
    this.parentLampiranId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory LampiranModel.fromJson(Map<String, dynamic> json) {
    return LampiranModel(
      lampiranId: json['lampiran_id']?.toString() ?? '',
      anggaran_id: json['anggaran_id']?.toString() ?? '',
      namaFileAsli: json['nama_file_asli'] ?? '',
      pathFileDisimpan: json['path_file_disimpan'] ?? '',
      uploaderUserId: json['uploader_user_id']?.toString() ?? '',
      uploaderNama: json['uploader']?['nama_lengkap'] ?? json['uploader_nama'],
      statusLampiran: json['status_lampiran'] ?? 'pending',
      statusApproval: json['status_approval'] ?? 'pending',
      catatan: json['catatan'],
      catatanReviewer: json['catatan_reviewer'],
      reviewerUserId: json['reviewer_user_id']?.toString(),
      reviewerNama: json['reviewer']?['nama_lengkap'] ?? json['reviewer_nama'],
      approvalTanggal: json['approval_tanggal'],
      catatanTanggal: json['catatan_tanggal'],
      revisiKe: json['revisi_ke'] ?? 0,
      parentLampiranId: json['parent_lampiran_id']?.toString(),
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'lampiran_id': lampiranId,
    'anggaran_id': anggaran_id,
    'nama_file_asli': namaFileAsli,
    'path_file_disimpan': pathFileDisimpan,
    'uploader_user_id': uploaderUserId,
    'uploader_nama': uploaderNama,
    'status_lampiran': statusLampiran,
    'status_approval': statusApproval,
    'catatan': catatan,
    'catatan_reviewer': catatanReviewer,
    'reviewer_user_id': reviewerUserId,
    'reviewer_nama': reviewerNama,
    'approval_tanggal': approvalTanggal,
    'catatan_tanggal': catatanTanggal,
    'revisi_ke': revisiKe,
    'parent_lampiran_id': parentLampiranId,
    'created_at': createdAt,
    'updated_at': updatedAt,
  };

  // Helper methods
  bool get isPending => statusLampiran == 'pending';
  bool get isApproved => statusLampiran == 'approved';
  bool get needsRevision => statusLampiran == 'revision_requested';
  bool get isArchived => statusLampiran == 'archived';

  String get statusDisplay {
    switch (statusLampiran) {
      case 'pending':
        return 'Menunggu Approval';
      case 'approved':
        return 'Disetujui';
      case 'revision_requested':
        return 'Perlu Revisi';
      case 'archived':
        return 'Diarsipkan';
      default:
        return statusLampiran;
    }
  }

  // Get file extension
  String get fileExtension {
    final parts = namaFileAsli.split('.');
    return parts.isNotEmpty ? parts.last : '';
  }

  // Check if file is PDF
  bool get isPdf => fileExtension.toLowerCase() == 'pdf';

  // Check if file is image
  bool get isImage {
    final ext = fileExtension.toLowerCase();
    return ['jpg', 'jpeg', 'png'].contains(ext);
  }
}
