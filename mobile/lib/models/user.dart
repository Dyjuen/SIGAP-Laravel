class User {
  final int id;
  final String username;
  final String namaLengkap;
  final String email;
  final int roleId;
  final String roleName;

  User({
    required this.id,
    required this.username,
    required this.namaLengkap,
    required this.email,
    required this.roleId,
    required this.roleName,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      namaLengkap: json['nama_lengkap'],
      email: json['email'],
      roleId: json['role_id'],
      roleName: json['role_name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'nama_lengkap': namaLengkap,
      'email': email,
      'role_id': roleId,
      'role_name': roleName,
    };
  }
}
