import 'dart:typed_data';
import 'package:flutter/widgets.dart';

Future<void> downloadFile({
  required Uint8List bytes,
  required String fileName,
  required String fallbackUrl,
  BuildContext? context,
}) async {
  throw UnsupportedError('downloadFile is not supported on this platform');
}
