import 'dart:html' as html;
import 'dart:ui_web' as ui_web;
import 'package:flutter/widgets.dart';

Widget getPdfPreviewWidget(String url) {
  final String viewType = 'pdf-preview-${url.hashCode}';
  
  // Register the view factory using the modern ui_web.platformViewRegistry
  ui_web.platformViewRegistry.registerViewFactory(viewType, (int viewId) {
    return html.IFrameElement()
      ..src = url
      ..style.border = 'none'
      ..style.width = '100%'
      ..style.height = '100%';
  });

  return HtmlElementView(viewType: viewType);
}
