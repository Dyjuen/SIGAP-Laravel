class Panduan {
  final int id;
  final String title;
  final String type;
  final String path;
  final int targetRoleId;
  final String? targetRoleName;

  Panduan({
    required this.id,
    required this.title,
    required this.type,
    required this.path,
    required this.targetRoleId,
    this.targetRoleName,
  });

  factory Panduan.fromJson(Map<String, dynamic> json) {
    return Panduan(
      id: json['id'] as int,
      title: json['title'] as String,
      type: json['type'] as String,
      path: json['path'] as String,
      targetRoleId: json['target_role_id'] as int,
      targetRoleName: json['target_role_name'] as String?,
    );
  }
}
