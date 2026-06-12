import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;

class ImagePreviewDialog extends StatefulWidget {
  final String fileName;
  final String imageUrl;
  final String? token; // Optional Bearer token for authentication
  final VoidCallback downloadCallback;

  const ImagePreviewDialog({
    super.key,
    required this.fileName,
    required this.imageUrl,
    this.token,
    required this.downloadCallback,
  });

  @override
  State<ImagePreviewDialog> createState() => _ImagePreviewDialogState();
}

class _ImagePreviewDialogState extends State<ImagePreviewDialog> {
  Uint8List? _imageBytes;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.token != null) {
      _loadImageWithAuth();
    } else {
      _isLoading = false; // Loaded directly via Image.network
    }
  }

  Future<void> _loadImageWithAuth() async {
    try {
      final response = await http.get(
        Uri.parse(widget.imageUrl),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );
      if (response.statusCode == 200) {
        if (mounted) {
          setState(() {
            _imageBytes = response.bodyBytes;
            _isLoading = false;
          });
        }
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final dialogWidth = size.width * 0.85;
    final dialogHeight = size.height * 0.75;

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      clipBehavior: Clip.antiAlias,
      child: Container(
        width: dialogWidth,
        height: dialogHeight,
        color: Colors.white,
        child: Column(
          children: [
            // Premium Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.image_outlined,
                    color: Color(0xFF33C8DA),
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Pratinjau Lampiran',
                          style: GoogleFonts.figtree(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                        Text(
                          widget.fileName,
                          style: GoogleFonts.figtree(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Download Button
                  IconButton(
                    icon: const Icon(Icons.download_rounded),
                    color: const Color(0xFF33C8DA),
                    tooltip: 'Download File',
                    onPressed: () {
                      Navigator.of(context).pop(); // Close dialog first
                      widget.downloadCallback();
                    },
                  ),
                  // Close Button
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    color: const Color(0xFF64748B),
                    tooltip: 'Tutup',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            // Dialog Body
            Expanded(
              child: Container(
                color: const Color(0xFFF8FAFC),
                child: _buildBody(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline_rounded,
                color: Colors.redAccent,
                size: 48,
              ),
              const SizedBox(height: 12),
              Text(
                'Gagal memuat gambar',
                style: GoogleFonts.figtree(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _error!,
                style: const TextStyle(color: Colors.grey, fontSize: 12),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _error = null;
                  });
                  _loadImageWithAuth();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF33C8DA),
                  foregroundColor: Colors.white,
                ),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.token != null && _imageBytes != null) {
      return InteractiveViewer(
        maxScale: 5.0,
        child: Center(
          child: Image.memory(
            _imageBytes!,
            fit: BoxFit.contain,
          ),
        ),
      );
    } else if (widget.token == null) {
      // Load direct Supabase pre-signed URL via Image.network
      return InteractiveViewer(
        maxScale: 5.0,
        child: Center(
          child: Image.network(
            widget.imageUrl,
            fit: BoxFit.contain,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
                ),
              );
            },
            errorBuilder: (context, error, stackTrace) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline_rounded,
                      color: Colors.redAccent,
                      size: 48,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Gagal memuat gambar',
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Pastikan koneksi internet Anda stabil.',
                      style: TextStyle(color: Colors.grey, fontSize: 12),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
