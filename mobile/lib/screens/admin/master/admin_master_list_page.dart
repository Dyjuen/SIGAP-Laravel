import 'package:flutter/material.dart';
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
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
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
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _items.length,
              itemBuilder: (context, index) {
                final item = _items[index];
                return ListTile(
                  title: Text(_getItemName(item)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit),
                        onPressed: () => _navigateToForm(item),
                      ),
                      if (item is Map && item.containsKey('is_active'))
                        Switch(
                          value: item['is_active'] == true || item['is_active'] == 1,
                          onChanged: (value) => _toggleActive(item, value),
                        )
                      else
                        IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () => _confirmDelete(item),
                        ),
                    ],
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () => _navigateToForm(null),
      ),
    );
  }

  String _getItemName(dynamic item) {
    if (item is! Map) return 'Item';
    
    // Check specific fields based on known database schema
    final fieldMapping = {
      'tipe-kegiatan': ['nama_tipe'],
      'iku': ['nama_iku', 'kode_iku'],
      'kategori-belanja': ['nama', 'kategori_belanja'],
      'satuan': ['nama_satuan', 'nama'],
      'mata-anggaran': ['nama_sumber_dana', 'nama'],
    };
    
    final specificFields = fieldMapping[widget.type] ?? [];
    
    // Try specific fields first
    for (final field in specificFields) {
      if (item.containsKey(field) && item[field] != null) return item[field].toString();
    }
    
    // Fallback to common fields
    final commonFields = ['nama', 'title', 'uraian'];
    for (final field in commonFields) {
      if (item.containsKey(field) && item[field] != null) return item[field].toString();
    }
    
    return 'Item';
  }

  void _navigateToForm(dynamic item) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AdminMasterFormPage(
          type: widget.type,
          title: widget.title,
          item: item,
        ),
      ),
    ).then((_) => _loadData());
  }

  Future<void> _toggleActive(dynamic item, bool isActive) async {
    final provider = context.read<MasterDataProvider>();
    final id = item['id'].toString();
    // Assuming we can send just the 'is_active' field to update it
    final data = {'is_active': isActive};
    
    try {
      await provider.update(widget.type, id, data);
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal mengubah status: $e')));
      }
    }
  }

  Future<void> _confirmDelete(dynamic item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Hapus Data'),
        content: const Text('Yakin ingin menghapus data ini?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      if (!mounted) return;
      final provider = context.read<MasterDataProvider>();
      final id = item['id'].toString();
      await provider.delete(widget.type, id);
      _loadData();
    }
  }
}
