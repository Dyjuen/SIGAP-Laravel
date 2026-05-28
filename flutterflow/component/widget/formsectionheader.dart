import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'form_section_header_model.dart';
export 'form_section_header_model.dart';

class FormSectionHeaderWidget extends StatefulWidget {
  const FormSectionHeaderWidget({super.key, String? description, String? title})
    : this.description =
          description ?? 'Informasi dasar mengenai pengajuan kegiatan.',
      this.title = title ?? 'Gambaran Umum';

  final String description;
  final String title;

  @override
  State<FormSectionHeaderWidget> createState() =>
      _FormSectionHeaderWidgetState();
}

class _FormSectionHeaderWidgetState extends State<FormSectionHeaderWidget> {
  late FormSectionHeaderModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FormSectionHeaderModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 16),
      child: Container(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              valueOrDefault<String>(widget!.title, 'Gambaran Umum'),
              style: FlutterFlowTheme.of(context).titleMedium.override(
                font: GoogleFonts.figtree(
                  fontWeight: FontWeight.bold,
                  fontStyle: FlutterFlowTheme.of(context).titleMedium.fontStyle,
                ),
                color: FlutterFlowTheme.of(context).primaryText,
                letterSpacing: 0.0,
                fontWeight: FontWeight.bold,
                fontStyle: FlutterFlowTheme.of(context).titleMedium.fontStyle,
                lineHeight: 1.35,
              ),
            ),
            Text(
              valueOrDefault<String>(
                widget!.description,
                'Informasi dasar mengenai pengajuan kegiatan.',
              ),
              style: FlutterFlowTheme.of(context).bodySmall.override(
                font: GoogleFonts.figtree(
                  fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                  fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                ),
                color: FlutterFlowTheme.of(context).secondaryText,
                letterSpacing: 0.0,
                fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                lineHeight: 1.4,
              ),
            ),
          ].divide(SizedBox(height: 4)),
        ),
      ),
    );
  }
}
