import 'dart:typed_data';
import 'package:flutter/widgets.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';

Future<void> downloadFile({
  required Uint8List bytes,
  required String fileName,
  required String fallbackUrl,
  BuildContext? context,
}) async {
  try {
    final dotIndex = fileName.lastIndexOf('.');
    final ext = dotIndex != -1 && dotIndex < fileName.length - 1
        ? fileName.substring(dotIndex + 1).toLowerCase()
        : 'pdf';

    final result = await FilePicker.platform.saveFile(
      dialogTitle: 'Simpan File',
      fileName: fileName,
      bytes: bytes,
      type: FileType.custom,
      allowedExtensions: [ext],
    );
    if (result == null) {
      // User cancelled
      return;
    }
  } catch (e) {
    // Fallback: Launch direct download link in external browser
    final uri = Uri.tryParse(fallbackUrl);
    if (uri != null) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      rethrow;
    }
  }
}
