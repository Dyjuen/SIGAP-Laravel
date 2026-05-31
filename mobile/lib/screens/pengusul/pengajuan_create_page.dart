import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/kak_model.dart';
import '../../services/pengajuan_service.dart';

class PengajuanCreatePage extends StatefulWidget {
  final KakDetail? kak;

  const PengajuanCreatePage({super.key, this.kak});

  @override
  State<PengajuanCreatePage> createState() => _PengajuanCreatePageState();
}

class _PengajuanCreatePageState extends State<PengajuanCreatePage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _alasanCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _alasanCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    final service = PengajuanService(Dio());
    final payload = <String, dynamic>{
      if (widget.kak != null) 'kak_id': widget.kak!.kakId,
      'alasan': _alasanCtrl.text.trim(),
    };

    try {
      await service.createPengajuan(payload);
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Pengajuan berhasil dibuat')));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal membuat pengajuan: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: colorScheme.surface,
        elevation: 0,
        title: Text('Ajukan Kegiatan', style: GoogleFonts.figtree()),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Text(
                'Berdasarkan KAK',
                style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              if (widget.kak != null) ...[
                Text(
                  widget.kak!.namaKegiatan,
                  style: GoogleFonts.figtree(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.kak!.tipe ?? '',
                  style: GoogleFonts.figtree(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ] else ...[
                Text(
                  'Tidak ada KAK terpilih',
                  style: GoogleFonts.figtree(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
              const SizedBox(height: 24),

              TextFormField(
                controller: _alasanCtrl,
                decoration: InputDecoration(
                  labelText: 'Alasan Pengajuan',
                  hintText: 'Jelaskan tujuan pengajuan kegiatan ini',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                maxLines: 4,
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Alasan pengajuan harus diisi'
                    : null,
              ),
              const SizedBox(height: 24),

              FilledButton(
                onPressed: _isSubmitting ? null : _submit,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(),
                      )
                    : Text(
                        'Ajukan',
                        style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
