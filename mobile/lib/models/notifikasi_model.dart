class NotifikasiModel {
  final int notifikasiId;
  final int penerimaUserId;
  final String pesan;
  final String? linkTujuan;
  final int isRead;
  final String createdAt;

  NotifikasiModel({
    required this.notifikasiId,
    required this.penerimaUserId,
    required this.pesan,
    this.linkTujuan,
    required this.isRead,
    required this.createdAt,
  });

  factory NotifikasiModel.fromJson(Map<String, dynamic> json) {
    return NotifikasiModel(
      notifikasiId: json['notifikasi_id'] ?? 0,
      penerimaUserId: json['penerima_user_id'] ?? 0,
      pesan: json['pesan'] ?? '',
      linkTujuan: json['link_tujuan'],
      isRead: json['is_read'] ?? 0,
      createdAt: json['created_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notifikasi_id': notifikasiId,
      'penerima_user_id': penerimaUserId,
      'pesan': pesan,
      'link_tujuan': linkTujuan,
      'is_read': isRead,
      'created_at': createdAt,
    };
  }

  bool get isReadBool => isRead == 1;
}
