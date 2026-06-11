import 'dart:convert';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/sigap_logo.dart';

class UserManagementPage extends StatefulWidget {
  const UserManagementPage({super.key});

  @override
  State<UserManagementPage> createState() => _UserManagementPageState();
}

class _UserManagementPageState extends State<UserManagementPage> {
  bool _isLoading = true;
  List<dynamic> _users = [];
  List<dynamic> _filteredUsers = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await ApiService.get('/admin/users');
      if (res.statusCode == 200) {
        setState(() {
          _users = jsonDecode(res.body);
          _filteredUsers = List.from(_users);
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _filterUsers(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredUsers = List.from(_users);
      } else {
        _filteredUsers = _users.where((user) {
          final name = (user['nama_lengkap'] ?? '').toString().toLowerCase();
          final username = (user['username'] ?? '').toString().toLowerCase();
          final email = (user['email'] ?? '').toString().toLowerCase();
          final q = query.toLowerCase();
          return name.contains(q) || username.contains(q) || email.contains(q);
        }).toList();
      }
    });
  }

  Future<void> _deleteUser(int userId, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Pengguna?'),
        content: Text('Apakah Anda yakin ingin menghapus pengguna "$name"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Batal', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() {
        _isLoading = true;
      });

      try {
        final res = await ApiService.delete('/admin/users/$userId');
        if (res.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Pengguna berhasil dihapus.'),
              backgroundColor: Colors.green,
            ),
          );
          _loadUsers();
        } else {
          final data = jsonDecode(res.body);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(data['message'] ?? 'Gagal menghapus pengguna.'),
              backgroundColor: Colors.redAccent,
            ),
          );
          setState(() {
            _isLoading = false;
          });
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Terjadi kesalahan koneksi.'),
            backgroundColor: Colors.redAccent,
          ),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showAddUserDialog() {
    final formKey = GlobalKey<FormState>();
    final nameCtrl = TextEditingController();
    final usernameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final passwordCtrl = TextEditingController();
    int selectedRoleId = 3; // Default: Pengusul

    final roles = [
      {'id': 1, 'name': 'Administrator'},
      {'id': 2, 'name': 'Verifikator'},
      {'id': 3, 'name': 'Pengusul'},
      {'id': 4, 'name': 'PPK'},
      {'id': 5, 'name': 'Wadir'},
      {'id': 6, 'name': 'Bendahara'},
      {'id': 7, 'name': 'Rektorat'},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Tambah Pengguna Baru',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      fontFamily: 'Figtree',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),

                  TextFormField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Nama Lengkap',
                      prefixIcon: Icon(Icons.badge_outlined),
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) => v == null || v.isEmpty
                        ? 'Nama lengkap wajib diisi'
                        : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: usernameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Username',
                      prefixIcon: Icon(Icons.person_outline),
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Username wajib diisi' : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Alamat Email',
                      prefixIcon: Icon(Icons.email_outlined),
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Email wajib diisi' : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: passwordCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Kata Sandi',
                      prefixIcon: Icon(Icons.lock_outline),
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) =>
                        v == null || v.length < 8 ? 'Minimal 8 karakter' : null,
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<int>(
                    value: selectedRoleId,
                    decoration: const InputDecoration(
                      labelText: 'Peran Akses',
                      prefixIcon: Icon(Icons.security_outlined),
                      border: OutlineInputBorder(),
                    ),
                    items: roles.map((r) {
                      return DropdownMenuItem<int>(
                        value: r['id'] as int,
                        child: Text(r['name'] as String),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() {
                          selectedRoleId = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (formKey.currentState!.validate()) {
                          Navigator.of(ctx).pop();

                          setState(() {
                            _isLoading = true;
                          });

                          try {
                            final res = await ApiService.post('/admin/users', {
                              'username': usernameCtrl.text.trim(),
                              'password': passwordCtrl.text,
                              'password_confirmation': passwordCtrl.text,
                              'nama_lengkap': nameCtrl.text.trim(),
                              'email': emailCtrl.text.trim(),
                              'role_id': selectedRoleId,
                              'role_ids': [selectedRoleId],
                            });

                            if (res.statusCode == 201) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Pengguna berhasil ditambahkan.',
                                  ),
                                  backgroundColor: Colors.green,
                                ),
                              );
                              _loadUsers();
                            } else {
                              final data = jsonDecode(res.body);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    data['message'] ??
                                        'Gagal menambahkan pengguna.',
                                  ),
                                  backgroundColor: Colors.redAccent,
                                ),
                              );
                              setState(() {
                                _isLoading = false;
                              });
                            }
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Terjadi kesalahan koneksi.'),
                                backgroundColor: Colors.redAccent,
                              ),
                            );
                            setState(() {
                              _isLoading = false;
                            });
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF33C8DA),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Simpan Pengguna',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showEditUserDialog(Map<String, dynamic> user) {
    final formKey = GlobalKey<FormState>();
    final nameCtrl = TextEditingController(text: user['nama_lengkap']);
    final usernameCtrl = TextEditingController(text: user['username']);
    final emailCtrl = TextEditingController(text: user['email']);
    final passwordCtrl = TextEditingController();
    int selectedRoleId = user['role_id'] ?? 3;

    final roles = [
      {'id': 1, 'name': 'Administrator'},
      {'id': 2, 'name': 'Verifikator'},
      {'id': 3, 'name': 'Pengusul'},
      {'id': 4, 'name': 'PPK'},
      {'id': 5, 'name': 'Wadir'},
      {'id': 6, 'name': 'Bendahara'},
      {'id': 7, 'name': 'Rektorat'},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Edit Pengguna',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      fontFamily: 'Figtree',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),

                  TextFormField(
                    controller: usernameCtrl,
                    enabled: false,
                    decoration: const InputDecoration(
                      labelText: 'Username (Tidak dapat diubah)',
                      prefixIcon: Icon(Icons.person_outline),
                      border: OutlineInputBorder(),
                      fillColor: Color(0xFFF1F5F9),
                      filled: true,
                    ),
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Nama Lengkap',
                      prefixIcon: Icon(Icons.badge_outlined),
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) => v == null || v.isEmpty
                        ? 'Nama lengkap wajib diisi'
                        : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Alamat Email',
                      prefixIcon: Icon(Icons.email_outlined),
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Email wajib diisi' : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: passwordCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Kata Sandi Baru (Kosongkan jika tidak diubah)',
                      prefixIcon: Icon(Icons.lock_outline),
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) {
                      if (v != null && v.isNotEmpty && v.length < 8) {
                        return 'Minimal 8 karakter';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<int>(
                    value: selectedRoleId,
                    decoration: const InputDecoration(
                      labelText: 'Peran Akses',
                      prefixIcon: Icon(Icons.security_outlined),
                      border: OutlineInputBorder(),
                    ),
                    items: roles.map((r) {
                      return DropdownMenuItem<int>(
                        value: r['id'] as int,
                        child: Text(r['name'] as String),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() {
                          selectedRoleId = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (formKey.currentState!.validate()) {
                          Navigator.of(ctx).pop();

                          setState(() {
                            _isLoading = true;
                          });

                          try {
                            final userId = user['user_id'];
                            
                            // 1. Update basic info
                            final res = await ApiService.put('/admin/users/$userId', {
                              'nama_lengkap': nameCtrl.text.trim(),
                              'email': emailCtrl.text.trim(),
                              'role_ids': [selectedRoleId],
                            });

                            if (res.statusCode == 200) {
                              bool passwordSuccess = true;
                              
                              // 2. If password field is not empty, update password
                              if (passwordCtrl.text.isNotEmpty) {
                                final pwdRes = await ApiService.put(
                                  '/admin/users/$userId/change-password',
                                  {
                                    'new_password': passwordCtrl.text,
                                    'new_password_confirmation': passwordCtrl.text,
                                  },
                                );
                                if (pwdRes.statusCode != 200) {
                                  passwordSuccess = false;
                                }
                              }

                              if (passwordSuccess) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Pengguna berhasil diperbarui.',
                                    ),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Data diperbarui, tetapi gagal mengubah kata sandi.',
                                    ),
                                    backgroundColor: Colors.orange,
                                  ),
                                );
                              }
                              _loadUsers();
                            } else {
                              final data = jsonDecode(res.body);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    data['message'] ??
                                        'Gagal memperbarui pengguna.',
                                  ),
                                  backgroundColor: Colors.redAccent,
                                ),
                              );
                              setState(() {
                                _isLoading = false;
                              });
                            }
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Terjadi kesalahan koneksi.'),
                                backgroundColor: Colors.redAccent,
                              ),
                            );
                            setState(() {
                              _isLoading = false;
                            });
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF33C8DA),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Simpan Perubahan',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: false,
        title: Text(
          'Manajemen Pengguna',
          style: GoogleFonts.figtree(
            fontSize: 20,
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.w800,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadUsers,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF33C8DA)),
            )
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _searchController,
                          onChanged: _filterUsers,
                          decoration: InputDecoration(
                            hintText: 'Cari nama, email, atau username...',
                            hintStyle: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 14,
                            ),
                            filled: true,
                            fillColor: Colors.white,
                            prefixIcon: const Icon(
                              Icons.search,
                              color: Color(0xFF64748B),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: Color(0xFFE2E8F0),
                                width: 1,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: Color(0xFF33C8DA),
                                width: 1.5,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF33C8DA),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.cyan.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'TOTAL PENGGUNA',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_users.length} Pengguna',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                fontFamily: 'Figtree',
                              ),
                            ),
                          ],
                        ),
                        ElevatedButton(
                          onPressed: _showAddUserDialog,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF33C8DA),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Tambah',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Row(
                    children: [
                      Text(
                        'Menampilkan ${_filteredUsers.length} dari ${_users.length} pengguna',
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                Expanded(
                  child: _filteredUsers.isEmpty
                      ? const Center(
                          child: Text(
                            'Tidak ada pengguna ditemukan.',
                            style: TextStyle(color: Color(0xFF64748B)),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          itemCount: _filteredUsers.length,
                          itemBuilder: (context, idx) {
                            final u = _filteredUsers[idx];
                            final name = u['nama_lengkap'] ?? 'Tanpa Nama';
                            final initials = name.isNotEmpty
                                ? name
                                      .split(' ')
                                      .map((e) => e[0])
                                      .take(2)
                                      .join('')
                                      .toUpperCase()
                                : '??';

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 24,
                                    backgroundColor: const Color(0xFFE0F7FA),
                                    child: Text(
                                      initials,
                                      style: const TextStyle(
                                        color: Color(0xFF0097A7),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          name,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF1E293B),
                                            fontSize: 15,
                                            fontFamily: 'Figtree',
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${u['role_name'] ?? "User"} • ${u['email'] ?? ""}',
                                          style: const TextStyle(
                                            color: Color(0xFF64748B),
                                            fontSize: 12,
                                          ),
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            Container(
                                              width: 8,
                                              height: 8,
                                              decoration: const BoxDecoration(
                                                color: Color(0xFF10B981),
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            const Text(
                                              'aktif',
                                              style: TextStyle(
                                                color: Color(0xFF10B981),
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(
                                          Icons.edit_outlined,
                                          color: Color(0xFF33C8DA),
                                        ),
                                        onPressed: () => _showEditUserDialog(u),
                                      ),
                                      IconButton(
                                        icon: const Icon(
                                          Icons.delete_outline,
                                          color: Colors.redAccent,
                                        ),
                                        onPressed: () =>
                                            _deleteUser(u['user_id'] as int, name),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddUserDialog,
        backgroundColor: const Color(0xFF33C8DA),
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        child: const Icon(Icons.person_add, size: 26),
      ),
    );
  }
}
