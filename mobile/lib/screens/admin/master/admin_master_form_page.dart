import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/master_data_provider.dart';

class AdminMasterFormPage extends StatefulWidget {
  final String type;
  final String title;
  final Map<String, dynamic>? item;

  const AdminMasterFormPage({
    super.key,
    required this.type,
    required this.title,
  required this.item,
  });

  @override
  State<AdminMasterFormPage> createState() => _AdminMasterFormPageState();
}

class _AdminMasterFormPageState extends State<AdminMasterFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();

  String? _fieldName;

  @override
  void initState() {
    super.initState();
    if (widget.item != null) {
      // Improved detection: Try to match field based on the type
      final fieldMapping = {
        'tipe-kegiatan': 'nama_tipe',
        'iku': 'nama_iku',
        'kategori-belanja': 'nama',
        'satuan': 'nama_satuan',
        'mata-anggaran': 'nama_sumber_dana',
      };
      
      final targetField = fieldMapping[widget.type] ?? 'nama';
      
      if (widget.item!.containsKey(targetField)) {
        _fieldName = targetField;
        _nameController.text = widget.item![targetField]?.toString() ?? '';
      } else {
        // Fallback: search for any of the common names
        final fields = ['nama', 'title', 'uraian'];
        for (final field in fields) {
          if (widget.item!.containsKey(field)) {
            _fieldName = field;
            _nameController.text = widget.item![field]?.toString() ?? '';
            break;
          }
        }
      }
    }
    // Default to 'nama' if not detected
    _fieldName ??= 'nama';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.item == null ? 'Tambah ${widget.title}' : 'Edit ${widget.title}')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(labelText: _fieldName!.toUpperCase()),
                validator: (value) => value!.isEmpty ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _submit,
                child: const Text('Simpan'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final provider = context.read<MasterDataProvider>();
    final data = {_fieldName!: _nameController.text};
    
    try {
      if (widget.item == null) {
        await provider.store(widget.type, data);
      } else {
        await provider.update(widget.type, widget.item!['id'].toString(), data);
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }
}
