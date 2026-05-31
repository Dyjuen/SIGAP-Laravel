import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'manual_download_card_model.dart';
export 'manual_download_card_model.dart';

class ManualDownloadCardWidget extends StatefulWidget {
  const ManualDownloadCardWidget({
    super.key,
    String? description,
    this.icon,
    String? title,
  })  : this.description =
            description ?? 'Panduan lengkap pembuatan KAK & RAB â¢ 4.2 MB',
        this.title = title ?? 'User Manual Pengusul';

  final String description;
  final Widget? icon;
  final String title;

  @override
  State<ManualDownloadCardWidget> createState() =>
      _ManualDownloadCardWidgetState();
}

class _ManualDownloadCardWidgetState extends State<ManualDownloadCardWidget> {
  late ManualDownloadCardModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ManualDownloadCardModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
        borderRadius: BorderRadius.circular(24),
        shape: BoxShape.rectangle,
        border: Border.all(
          color: FlutterFlowTheme.of(context).alternate,
          width: 1,
        ),
      ),
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Container(
          child: Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: FlutterFlowTheme.of(context).primaryContainer,
                  borderRadius: BorderRadius.circular(16),
                  shape: BoxShape.rectangle,
                ),
                alignment: AlignmentDirectional(0, 0),
                child: widget.icon!,
              ),
              Expanded(
                flex: 1,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      valueOrDefault<String>(
                        widget.title,
                        'User Manual Pengusul',
                      ),
                      style: FlutterFlowTheme.of(context).titleMedium.override(
                            font: GoogleFonts.figtree(
                              fontWeight: FontWeight.bold,
                              fontStyle: FlutterFlowTheme.of(
                                context,
                              ).titleMedium.fontStyle,
                            ),
                            color: FlutterFlowTheme.of(context).primaryText,
                            letterSpacing: 0.0,
                            fontWeight: FontWeight.bold,
                            fontStyle: FlutterFlowTheme.of(
                              context,
                            ).titleMedium.fontStyle,
                            lineHeight: 1.35,
                          ),
                    ),
                    Text(
                      valueOrDefault<String>(
                        widget.description,
                        'Panduan lengkap pembuatan KAK & RAB â¢ 4.2 MB',
                      ),
                      style: FlutterFlowTheme.of(context).bodySmall.override(
                            font: GoogleFonts.figtree(
                              fontWeight: FlutterFlowTheme.of(
                                context,
                              ).bodySmall.fontWeight,
                              fontStyle: FlutterFlowTheme.of(
                                context,
                              ).bodySmall.fontStyle,
                            ),
                            color: FlutterFlowTheme.of(context).secondaryText,
                            letterSpacing: 0.0,
                            fontWeight: FlutterFlowTheme.of(
                              context,
                            ).bodySmall.fontWeight,
                            fontStyle: FlutterFlowTheme.of(
                              context,
                            ).bodySmall.fontStyle,
                            lineHeight: 1.4,
                          ),
                    ),
                  ].divide(SizedBox(height: 4)),
                ),
              ),
              FlutterFlowIconButton(
                borderRadius: 12,
                buttonSize: 40,
                fillColor: FlutterFlowTheme.of(context).primaryBackground,
                icon: Icon(
                  Icons.download_rounded,
                  color: FlutterFlowTheme.of(context).primary,
                  size: 24,
                ),
                onPressed: () {
                  print('IconButton pressed ...');
                },
              ),
            ].divide(SizedBox(width: 16)),
          ),
        ),
      ),
    );
  }
}
