import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/lpj_provider.dart';

class LpjFormPage extends StatefulWidget {
  final String kegiatanId;

  const LpjFormPage({super.key, required this.kegiatanId});

  @override
  State<LpjFormPage> createState() => _LpjFormPageState();
}

class _LpjFormPageState extends State<LpjFormPage> {
  final List<Map<String, dynamic>> _realizasiData = [];
  final List<String> _buktiFilePaths = [];

  @override
  void initState() {
    super.initState();
    if (widget.kegiatanId.isNotEmpty) {
      Future.microtask(
        () => context.read<LpjProvider>().getLpjDetail(widget.kegiatanId),
      );
    }
  }

  void _submit() async {
    final provider = context.read<LpjProvider>();
    final success = await provider.submitLpj(
      kegiatanId: widget.kegiatanId,
      realizasiData: _realizasiData,
      buktiFilePaths: _buktiFilePaths,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('LPJ berhasil disubmit')),
      );
      Navigator.pop(context, true);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.errorMessage ?? 'Gagal submit LPJ')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Form LPJ', style: GoogleFonts.figtree(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
      ),
      body: Consumer<LpjProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Tabel Realisasi',
                  style: GoogleFonts.figtree(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                // Dummy table for now, would map _realizasiData
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text('Input realisasi anggaran di sini...'),
                ),
                const SizedBox(height: 24),
                Text(
                  'Upload Bukti',
                  style: GoogleFonts.figtree(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    // Logic for file upload goes here
                  },
                  icon: const Icon(Icons.upload_file),
                  label: const Text('Pilih File Bukti'),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: provider.isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00BCD4),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: provider.isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Submit LPJ', style: TextStyle(color: Colors.white, fontSize: 16)),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
