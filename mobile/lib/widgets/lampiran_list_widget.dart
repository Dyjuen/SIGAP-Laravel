import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/lampiran_model.dart';
import '../providers/lampiran_provider.dart';
import 'package:http/http.dart' as http;
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../utils/download_helper.dart';
import 'package:url_launcher/url_launcher.dart';
import 'image_preview_dialog.dart';

class LampiranListWidget extends StatelessWidget {
  final String anggaranId;
  final bool readOnly;
  final Function(LampiranModel)? onUpload;
  final Function(LampiranModel)? onDelete;
  final Function(LampiranModel)? onApprove;
  final Function(LampiranModel)? onRevise;

  const LampiranListWidget({
    super.key,
    required this.anggaranId,
    this.readOnly = false,
    this.onUpload,
    this.onDelete,
    this.onApprove,
    this.onRevise,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<LampiranProvider>(
      builder: (context, provider, _) {
        // Filter lampiran for this anggaran
        final filteredLampiran = provider.lampiran
            .where((l) => l.anggaran_id == anggaranId)
            .toList();

        if (provider.isLoading && filteredLampiran.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (filteredLampiran.isEmpty) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Icon(Icons.file_present, size: 48, color: Colors.grey[400]),
                const SizedBox(height: 12),
                Text(
                  'Belum ada lampiran',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filteredLampiran.length,
          itemBuilder: (context, index) {
            final lampiran = filteredLampiran[index];
            return _buildLampiranItem(context, lampiran, provider);
          },
        );
      },
    );
  }

  Widget _buildLampiranItem(
    BuildContext context,
    LampiranModel lampiran,
    LampiranProvider provider,
  ) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _previewAttachment(context, lampiran),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with filename and icon
              Row(
                children: [
                  Icon(
                    lampiran.isPdf
                        ? Icons.picture_as_pdf
                        : lampiran.isImage
                        ? Icons.image
                        : Icons.file_present,
                    color: const Color(0xFF33C8DA),
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lampiran.namaFileAsli,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          lampiran.statusDisplay,
                          style: TextStyle(
                            fontSize: 12,
                            color: _getStatusColor(lampiran.statusLampiran),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Info row: uploader, date, revision
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Upload: ${lampiran.uploaderNama ?? 'Unknown'}',
                          style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                        ),
                        Text(
                          'Tanggal: ${lampiran.createdAt}',
                          style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                        ),
                        if (lampiran.revisiKe > 0)
                          Text(
                            'Revisi ke: ${lampiran.revisiKe}',
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.amber[700],
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
              // Catatan if any
              if (lampiran.catatan != null && lampiran.catatan!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Catatan: ${lampiran.catatan}',
                    style: const TextStyle(fontSize: 12),
                  ),
                ),
              ],
              // Reviewer notes if any
              if (lampiran.catatanReviewer != null &&
                  lampiran.catatanReviewer!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red[200]!),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Catatan Reviewer: ${lampiran.reviewerNama ?? 'Unknown'}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.red[700],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        lampiran.catatanReviewer!,
                        style: const TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 12),
              // Action buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (!readOnly) ...[
                    // Delete button
                    TextButton.icon(
                      onPressed: () => _showDeleteConfirm(context, lampiran),
                      icon: const Icon(Icons.delete_outline, size: 18),
                      label: const Text('Hapus'),
                      style: TextButton.styleFrom(foregroundColor: Colors.red),
                    ),
                    const SizedBox(width: 8),
                  ],
                  // Preview button
                  TextButton.icon(
                    onPressed: () => _previewAttachment(context, lampiran),
                    icon: const Icon(Icons.remove_red_eye_outlined, size: 18),
                    label: const Text('Lihat'),
                    style: TextButton.styleFrom(foregroundColor: const Color(0xFF33C8DA)),
                  ),
                  const SizedBox(width: 8),
                  // Download button
                  TextButton.icon(
                    onPressed: () => _downloadFile(context, lampiran),
                    icon: const Icon(Icons.download, size: 18),
                    label: const Text('Download'),
                    style: TextButton.styleFrom(foregroundColor: Colors.blue),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'approved':
        return Colors.green;
      case 'revision_requested':
        return Colors.red;
      case 'archived':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  void _showDeleteConfirm(BuildContext context, LampiranModel lampiran) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Lampiran?'),
        content: Text('Anda yakin ingin menghapus "${lampiran.namaFileAsli}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              onDelete?.call(lampiran);
            },
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _downloadFile(BuildContext context, LampiranModel lampiran) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sesi aktif tidak ditemukan. Silakan login kembali.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
        ),
      ),
    );

    try {
      final downloadUrl = '${ApiService.baseUrl}/lampiran/${lampiran.lampiranId}/stream';
      final uri = Uri.parse(downloadUrl);
      final response = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (navigator.canPop()) {
        navigator.pop(); // Close loading dialog
      }

      if (response.statusCode == 200) {
        final bytes = response.bodyBytes;
        if (context.mounted) {
          await downloadFile(
            bytes: bytes,
            fileName: lampiran.namaFileAsli,
            fallbackUrl: '$downloadUrl?token=$token',
            context: context,
          );
        }

        messenger.showSnackBar(
          const SnackBar(
            content: Text('File lampiran berhasil diunduh.'),
            backgroundColor: Color(0xFF2E7D32),
          ),
        );
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      if (navigator.canPop()) {
        navigator.pop(); // Close loading dialog if still open
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text('Gagal mengunduh file lampiran: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  void _previewAttachment(BuildContext context, LampiranModel lampiran) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sesi aktif tidak ditemukan. Silakan login kembali.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (lampiran.isPdf) {
      // Redirect PDF directly to web browser
      final downloadUrl = '${ApiService.baseUrl}/lampiran/${lampiran.lampiranId}/stream?token=$token';
      final uri = Uri.parse(downloadUrl);
      try {
        final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (!launched) {
          throw Exception('Cannot launch browser');
        }
      } catch (e) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } else if (lampiran.isImage) {
      // Open dialog modal with image preview
      final imageUrl = '${ApiService.baseUrl}/lampiran/${lampiran.lampiranId}/stream';
      showDialog(
        context: context,
        barrierColor: Colors.black.withValues(alpha: 0.6),
        builder: (ctx) => ImagePreviewDialog(
          fileName: lampiran.namaFileAsli,
          imageUrl: imageUrl,
          token: token,
          downloadCallback: () => _downloadFile(context, lampiran),
        ),
      );
    } else {
      // Direct download for other unsupported preview formats
      _downloadFile(context, lampiran);
    }
  }
}
