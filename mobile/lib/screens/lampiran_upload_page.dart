import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../models/lampiran_model.dart';
import '../providers/lampiran_provider.dart';

class LampiranUploadPage extends StatefulWidget {
  final String anggaranId;
  final String anggaranNama;
  final VoidCallback? onUploadSuccess;

  const LampiranUploadPage({
    super.key,
    required this.anggaranId,
    required this.anggaranNama,
    this.onUploadSuccess,
  });

  @override
  State<LampiranUploadPage> createState() => _LampiranUploadPageState();
}

class _LampiranUploadPageState extends State<LampiranUploadPage> {
  final TextEditingController _catatanController = TextEditingController();
  String? _selectedFilePath;
  String? _selectedFileName;
  bool _isUploading = false;

  @override
  void dispose() {
    _catatanController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
        onFileLoading: (FilePickerStatus status) {
          print(status);
        },
      );

      if (result != null) {
        setState(() {
          _selectedFilePath = result.files.single.path;
          _selectedFileName = result.files.single.name;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error memilih file: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _uploadFile() async {
    if (_selectedFilePath == null || _selectedFileName == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pilih file terlebih dahulu'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isUploading = true);

    final provider = Provider.of<LampiranProvider>(context, listen: false);
    final result = await provider.uploadLampiran(
      anggaranId: widget.anggaranId,
      filePath: _selectedFilePath!,
      fileName: _selectedFileName!,
      catatan: _catatanController.text.isEmpty ? null : _catatanController.text,
    );

    if (!mounted) return;

    if (result != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('File berhasil diupload!'),
          backgroundColor: Colors.green,
        ),
      );
      widget.onUploadSuccess?.call();
      Navigator.of(context).pop(result);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.errorMessage ?? 'Gagal mengupload file'),
          backgroundColor: Colors.red,
        ),
      );
    }

    setState(() => _isUploading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Lampiran'),
        backgroundColor: const Color(0xFF33C8DA),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header info
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Item Anggaran',
                    style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.anggaranNama,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // File picker section
            Text(
              'Pilih File',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: _isUploading ? null : _pickFile,
              child: Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFF33C8DA), width: 2),
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.cyan[50],
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.cloud_upload_outlined,
                      size: 48,
                      color: const Color(0xFF33C8DA),
                    ),
                    const SizedBox(height: 12),
                    if (_selectedFileName != null) ...[
                      Icon(
                        _getFileIcon(_selectedFileName!),
                        size: 32,
                        color: const Color(0xFF33C8DA),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _selectedFileName!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Tapped untuk mengubah file',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ] else ...[
                      Text(
                        'Tap untuk memilih file',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Format yang didukung: JPG, PNG, PDF\nUkuran maksimal: 10 MB',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Catatan section
            Text(
              'Catatan (Opsional)',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _catatanController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Tambahkan catatan tentang file ini...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFF33C8DA)),
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Upload button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isUploading || _selectedFilePath == null
                    ? null
                    : _uploadFile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF33C8DA),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  disabledBackgroundColor: Colors.grey[300],
                ),
                child: _isUploading
                    ? SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(
                            Colors.white.withOpacity(0.8),
                          ),
                        ),
                      )
                    : const Text(
                        'Upload File',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 12),
            // Cancel button
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: _isUploading
                    ? null
                    : () => Navigator.of(context).pop(),
                child: const Text('Batal'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getFileIcon(String fileName) {
    if (fileName.endsWith('.pdf')) return Icons.picture_as_pdf;
    if (fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg'))
      return Icons.image;
    return Icons.file_present;
  }
}
