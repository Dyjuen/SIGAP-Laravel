import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/app_theme.dart';
import '../../../services/master_data_service.dart';
import '../../../providers/master_data_provider.dart';
import 'admin_master_form_page.dart';

class AdminMasterListPage extends StatefulWidget {
  final String type;
  final String title;

  const AdminMasterListPage({
    super.key,
    required this.type,
    required this.title,
  });

  @override
  State<AdminMasterListPage> createState() => _AdminMasterListPageState();
}

class _AdminMasterListPageState extends State<AdminMasterListPage> {
  List<dynamic> _items = [];
  List<dynamic> _filteredItems = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    final service = context.read<MasterDataService>();

    try {
      List<dynamic> data;
      switch (widget.type) {
        case 'tipe-kegiatan':
          data = await service.getTipeKegiatan();
          break;
        case 'mata-anggaran':
          data = await service.getMataAnggaran();
          break;
        case 'kategori-belanja':
          data = await service.getKategoriBelanja();
          break;
        case 'satuan':
          data = await service.getSatuan();
          break;
        case 'iku':
          data = await service.getIku();
          break;
        default:
          data = [];
      }
      if (mounted) {
        setState(() {
          _items = data;
          _filteredItems = List.from(data);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showSnackbar('Gagal mengambil data.', Colors.red);
      }
    }
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredItems = List.from(_items);
      } else {
        _filteredItems = _items.where((item) {
          final name = _getItemName(item).toLowerCase();
          return name.contains(query);
        }).toList();
      }
    });
  }

  void _showSnackbar(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: GoogleFonts.figtree(fontWeight: FontWeight.w600)),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  String _getItemName(dynamic item) {
    if (item is! Map) return 'Item';

    final fieldMapping = {
      'tipe-kegiatan': ['nama_tipe'],
      'iku': ['nama_iku', 'kode_iku'],
      'kategori-belanja': ['nama', 'kategori_belanja'],
      'satuan': ['nama_satuan', 'nama'],
      'mata-anggaran': ['nama_sumber_dana', 'nama'],
    };

    final specificFields = fieldMapping[widget.type] ?? [];

    for (final field in specificFields) {
      if (item.containsKey(field) && item[field] != null) return item[field].toString();
    }

    final commonFields = ['nama', 'title', 'uraian'];
    for (final field in commonFields) {
      if (item.containsKey(field) && item[field] != null) return item[field].toString();
    }

    return 'Item';
  }

  String _getItemSubtitle(dynamic item) {
    if (item is! Map) return '';
    if (widget.type == 'iku' && item.containsKey('kode_iku')) {
      return 'Kode: ${item['kode_iku']}';
    }
    if (widget.type == 'mata-anggaran' && item.containsKey('kode_rekening')) {
      return 'Kode Rekening: ${item['kode_rekening']}';
    }
    return '';
  }

  void _navigateToForm(dynamic item) {
    Navigator.of(context)
        .push(
      MaterialPageRoute(
        builder: (_) => AdminMasterFormPage(
          type: widget.type,
          title: widget.title,
          item: item != null ? Map<String, dynamic>.from(item) : null,
        ),
      ),
    )
        .then((_) => _loadData());
  }

  Future<void> _toggleActive(dynamic item, bool isActive) async {
    final provider = context.read<MasterDataProvider>();
    final id = item['id'].toString();
    final data = {'is_active': isActive ? 1 : 0};

    try {
      await provider.update(widget.type, id, data);
      _showSnackbar('Status berhasil diperbarui.', const Color(0xFF33C8DA));
      _loadData();
    } catch (e) {
      _showSnackbar('Gagal memperbarui status: $e', Colors.red);
    }
  }

  Future<void> _confirmDelete(dynamic item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Hapus Data',
          style: GoogleFonts.figtree(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
        ),
        content: Text(
          'Apakah Anda yakin ingin menghapus data "${_getItemName(item)}" ini secara permanen?',
          style: GoogleFonts.figtree(fontSize: 14, color: const Color(0xFF64748B)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(
              'Batal',
              style: GoogleFonts.figtree(fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8)),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text(
              'Hapus',
              style: GoogleFonts.figtree(fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final provider = context.read<MasterDataProvider>();
      final id = item['id'].toString();
      try {
        await provider.delete(widget.type, id);
        _showSnackbar('Data berhasil dihapus.', const Color(0xFF33C8DA));
        _loadData();
      } catch (e) {
        _showSnackbar('Gagal menghapus data: $e', Colors.red);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.title,
          style: GoogleFonts.figtree(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF33C8DA)))
          : Column(
              children: [
                // Search & Info Header
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                  child: Column(
                    children: [
                      TextField(
                        controller: _searchController,
                        style: GoogleFonts.figtree(fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Cari ${widget.title.toLowerCase()}...',
                          prefixIcon: const Icon(Icons.search_rounded, size: 20),
                          contentPadding: const EdgeInsets.symmetric(vertical: 10),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // List Area
                Expanded(
                  child: _filteredItems.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.inbox_rounded, size: 48, color: Color(0xFFCBD5E1)),
                              const SizedBox(height: 12),
                              Text(
                                'Tidak ada data ditemukan.',
                                style: GoogleFonts.figtree(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.all(20),
                          itemCount: _filteredItems.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final item = _filteredItems[index];
                            final itemName = _getItemName(item);
                            final itemSub = _getItemSubtitle(item);

                            // Flag active state if available
                            final bool hasActiveState = item is Map && item.containsKey('is_active');
                            final bool isActive = hasActiveState && (item['is_active'] == true || item['is_active'] == 1);

                            return Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.02),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  // Leading circular badge representing the item
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF33C8DA).withValues(alpha: 0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      itemName.isNotEmpty ? itemName[0].toUpperCase() : 'M',
                                      style: GoogleFonts.figtree(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w900,
                                        color: const Color(0xFF2BA9B8),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),

                                  // Title + optional subtitle details
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          itemName,
                                          style: GoogleFonts.figtree(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                            color: const Color(0xFF0F172A),
                                          ),
                                        ),
                                        if (itemSub.isNotEmpty) ...[
                                          const SizedBox(height: 2),
                                          Text(
                                            itemSub,
                                            style: GoogleFonts.figtree(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: const Color(0xFF94A3B8),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 10),

                                  // Action Buttons
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      // Edit button
                                      IconButton(
                                        icon: const Icon(Icons.edit_rounded, size: 20, color: Color(0xFF64748B)),
                                        onPressed: () => _navigateToForm(item),
                                        style: IconButton.styleFrom(
                                          backgroundColor: const Color(0xFFF1F5F9),
                                          padding: const EdgeInsets.all(8),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                        ),
                                      ),
                                      const SizedBox(width: 8),

                                      // Delete button or status switch
                                      if (hasActiveState)
                                        Switch(
                                          value: isActive,
                                          activeColor: const Color(0xFF33C8DA),
                                          onChanged: (value) => _toggleActive(item, value),
                                        )
                                      else
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Color(0xFFEF4444)),
                                          onPressed: () => _confirmDelete(item),
                                          style: IconButton.styleFrom(
                                            backgroundColor: const Color(0xFFFEE2E2),
                                            padding: const EdgeInsets.all(8),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
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
        onPressed: () => _navigateToForm(null),
        backgroundColor: const Color(0xFF33C8DA),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.add_rounded, color: Colors.white, size: 26),
      ),
    );
  }
}
