import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/app_theme.dart';
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
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, bool> _booleans = {};
  bool _isSaving = false;

  // Define form fields based on the database schema
  List<Map<String, dynamic>> _getFields() {
    switch (widget.type) {
      case 'iku':
        return [
          {'name': 'kode_iku', 'label': 'Kode IKU', 'type': 'text', 'required': true},
          {'name': 'nama_iku', 'label': 'Nama IKU', 'type': 'text', 'required': true},
        ];
      case 'satuan':
        return [
          {'name': 'nama_satuan', 'label': 'Nama Satuan', 'type': 'text', 'required': true},
        ];
      case 'mata-anggaran':
        return [
          {'name': 'kode_anggaran', 'label': 'Kode Anggaran', 'type': 'text', 'required': true},
          {'name': 'nama_sumber_dana', 'label': 'Nama Sumber Dana', 'type': 'text', 'required': true},
          {'name': 'tahun_anggaran', 'label': 'Tahun Anggaran', 'type': 'number', 'required': true},
          {'name': 'total_pagu', 'label': 'Total Pagu', 'type': 'number', 'required': true},
        ];
      case 'tipe-kegiatan':
        return [
          {'name': 'nama_tipe', 'label': 'Nama Tipe', 'type': 'text', 'required': true},
        ];
      case 'kategori-belanja':
        return [
          {'name': 'kode', 'label': 'Kode', 'type': 'text', 'required': true},
          {'name': 'nama', 'label': 'Nama', 'type': 'text', 'required': true},
          {'name': 'keterangan', 'label': 'Keterangan', 'type': 'text', 'required': false},
          {'name': 'is_active', 'label': 'Aktif?', 'type': 'boolean', 'required': false},
        ];
      default:
        return [
          {'name': 'nama', 'label': 'Nama', 'type': 'text', 'required': true},
        ];
    }
  }

  @override
  void initState() {
    super.initState();
    final fields = _getFields();
    for (final field in fields) {
      final name = field['name'] as String;
      final type = field['type'] as String;
      final defaultValue = widget.item?[name];

      if (type == 'boolean') {
        _booleans[name] = defaultValue == true || defaultValue == 1 || defaultValue == '1';
      } else {
        _controllers[name] = TextEditingController(
          text: defaultValue != null ? defaultValue.toString() : '',
        );
      }
    }
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
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

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSaving = true;
    });

    final provider = context.read<MasterDataProvider>();
    final Map<String, dynamic> data = {};

    // Collect field values
    final fields = _getFields();
    for (final field in fields) {
      final name = field['name'] as String;
      final type = field['type'] as String;

      if (type == 'boolean') {
        data[name] = _booleans[name] == true ? 1 : 0;
      } else if (type == 'number') {
        final val = _controllers[name]?.text ?? '';
        if (name == 'tahun_anggaran') {
          data[name] = int.tryParse(val) ?? 0;
        } else {
          data[name] = double.tryParse(val) ?? 0.0;
        }
      } else {
        data[name] = _controllers[name]?.text ?? '';
      }
    }

    try {
      if (widget.item == null) {
        await provider.store(widget.type, data);
        _showSnackbar('Data berhasil ditambahkan.', const Color(0xFF33C8DA));
      } else {
        await provider.update(widget.type, widget.item!['id'].toString(), data);
        _showSnackbar('Data berhasil diperbarui.', const Color(0xFF33C8DA));
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _isSaving = false;
      });
      _showSnackbar(e.toString(), Colors.red);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fields = _getFields();
    final isEdit = widget.item != null;

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
          isEdit ? 'Ubah ${widget.title}' : 'Tambah ${widget.title}',
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Indicator
                Row(
                  children: [
                    Container(
                      width: 4,
                      height: 16,
                      decoration: BoxDecoration(
                        color: const Color(0xFF33C8DA),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Formulir Master Data',
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 32, color: Color(0xFFF1F5F9)),

                // Dynamic inputs list
                ...fields.map((field) {
                  final name = field['name'] as String;
                  final label = field['label'] as String;
                  final type = field['type'] as String;
                  final isRequired = field['required'] == true;

                  if (type == 'boolean') {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 20),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            label,
                            style: GoogleFonts.figtree(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF475569),
                            ),
                          ),
                          Switch(
                            value: _booleans[name] ?? false,
                            activeColor: const Color(0xFF33C8DA),
                            onChanged: (val) {
                              setState(() {
                                _booleans[name] = val;
                              });
                            },
                          ),
                        ],
                      ),
                    );
                  }

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RichText(
                          text: TextSpan(
                            text: label,
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF475569),
                            ),
                            children: [
                              if (isRequired)
                                const TextSpan(
                                  text: ' *',
                                  style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _controllers[name],
                          keyboardType: type == 'number' ? TextInputType.number : TextInputType.text,
                          style: GoogleFonts.figtree(fontSize: 13, fontWeight: FontWeight.w600),
                          validator: (value) {
                            if (isRequired && (value == null || value.trim().isEmpty)) {
                              return '$label wajib diisi.';
                            }
                            return null;
                          },
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Colors.red, width: 1),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),

                const SizedBox(height: 12),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _isSaving ? null : _submit,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF33C8DA),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isSaving
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : Text(
                            isEdit ? 'Simpan Perubahan' : 'Tambah Data',
                            style: GoogleFonts.figtree(fontWeight: FontWeight.w800, fontSize: 13),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
