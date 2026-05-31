// Example: How to use Lampiran upload in KAK Detail page
// This shows how to integrate the lampiran widgets into your existing pages

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/lampiran_provider.dart';
import '../screens/lampiran_upload_page.dart';
import '../widgets/lampiran_list_widget.dart';

// Example usage in a page (e.g., KAK Detail or Kegiatan Detail)
class ExampleKakDetailWithLampiran extends StatefulWidget {
  final String kakId;
  final String anggaranId; // From KAK budget item
  final String anggaranNama; // Display name

  const ExampleKakDetailWithLampiran({
    super.key,
    required this.kakId,
    required this.anggaranId,
    required this.anggaranNama,
  });

  @override
  State<ExampleKakDetailWithLampiran> createState() =>
      _ExampleKakDetailWithLampiranState();
}

class _ExampleKakDetailWithLampiranState
    extends State<ExampleKakDetailWithLampiran> {
  @override
  void initState() {
    super.initState();
    _loadLampiran();
  }

  void _loadLampiran() {
    final lampiranProvider = Provider.of<LampiranProvider>(
      context,
      listen: false,
    );
    lampiranProvider.fetchLampiran(widget.anggaranId);
  }

  void _openUploadPage() async {
    final result = await Navigator.of(context).push<dynamic>(
      MaterialPageRoute(
        builder: (context) => LampiranUploadPage(
          anggaranId: widget.anggaranId,
          anggaranNama: widget.anggaranNama,
          onUploadSuccess: _loadLampiran,
        ),
      ),
    );

    if (result != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lampiran berhasil ditambahkan'),
          backgroundColor: Colors.green,
        ),
      );
      _loadLampiran();
    }
  }

  void _handleDeleteLampiran(
    String lampiranId,
    LampiranProvider provider,
  ) async {
    final success = await provider.deleteLampiran(lampiranId);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lampiran berhasil dihapus'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.errorMessage ?? 'Gagal menghapus lampiran'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('KAK Detail dengan Lampiran'),
        backgroundColor: const Color(0xFF33C8DA),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ... KAK detail content here ...

            // Lampiran Section
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Lampiran Dokumen',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: _openUploadPage,
                    icon: const Icon(Icons.upload_file),
                    label: const Text('Upload'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF33C8DA),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // List of lampiran
            Consumer<LampiranProvider>(
              builder: (context, lampiranProvider, _) {
                return LampiranListWidget(
                  anggaranId: widget.anggaranId,
                  readOnly: false,
                  onDelete: (lampiran) => _handleDeleteLampiran(
                    lampiran.lampiranId,
                    lampiranProvider,
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// ============ USAGE INSTRUCTIONS ============
//
// 1. ADD TO YOUR EXISTING KAK/KEGIATAN DETAIL PAGE:
//    - Import the providers and widgets at the top
//    - Add the Lampiran section in your detail page
//    - Call _loadLampiran() in initState
//
// 2. INTEGRATE WITH KEGIATAN PAGE:
//    - Add lampiran widget to kegiatan detail page
//    - Pass the kegiatan's anggaran IDs
//
// 3. FOR APPROVERS:
//    - Set readOnly=true to disable upload/delete
//    - Add onApprove callback to approve lampiran
//    - Add onRevise callback to request revision
//
// 4. EXAMPLE WITH APPROVAL FLOW:
//    LampiranListWidget(
//      anggaranId: anggaran.anggaran_id,
//      readOnly: userRole == 'Pengusul', // Only pengusul can upload
//      onApprove: (lampiran) {
//        // Call lampiran provider to approve
//        provider.approveLampiran(lampiran.lampiranId);
//      },
//      onRevise: (lampiran) {
//        // Request revision
//        showDialog(...);
//      },
//    )
