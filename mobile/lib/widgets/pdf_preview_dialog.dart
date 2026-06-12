import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

Future<void> showPdfPreviewDialog(
  BuildContext context, {
  required String previewUrl,
  required String downloadUrl,
  required String title,
  required String kakId,
}) async {
  final uri = Uri.parse(previewUrl);
  try {
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched) {
      throw Exception('Cannot launch external browser');
    }
  } catch (e) {
    await launchUrl(uri, mode: LaunchMode.platformDefault);
  }
}
