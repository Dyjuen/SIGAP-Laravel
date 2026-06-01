import '/components/button/button_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'lpj_document_item_model.dart';
export 'lpj_document_item_model.dart';

class LpjDocumentItemWidget extends StatefulWidget {
  const LpjDocumentItemWidget({
    super.key,
    this.actionIcon,
    String? actionText,
    String? actionVariant,
    String? date,
    String? files,
    Color? statusBg,
    Color? statusColor,
    String? statusText,
    String? title,
  })  : this.actionText = actionText ?? 'Update',
        this.actionVariant = actionVariant ?? 'outline',
        this.date = date ?? '12 Okt 2023',
        this.files = files ?? '2 Files',
        this.statusBg = statusBg ?? const Color(0x00000000),
        this.statusColor = statusColor ?? const Color(0x00000000),
        this.statusText = statusText ?? 'MENUNGGU',
        this.title = title ?? 'Workshop Artificial Intelligence';

  final Widget? actionIcon;
  final String actionText;
  final String actionVariant;
  final String date;
  final String files;
  final Color statusBg;
  final Color statusColor;
  final String statusText;
  final String title;

  @override
  State<LpjDocumentItemWidget> createState() => _LpjDocumentItemWidgetState();
}

class _LpjDocumentItemWidgetState extends State<LpjDocumentItemWidget> {
  late LpjDocumentItemModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LpjDocumentItemModel());
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
        child: Container(
          decoration: BoxDecoration(
            color: FlutterFlowTheme.of(context).secondaryBackground,
            borderRadius: BorderRadius.circular(16),
            shape: BoxShape.rectangle,
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
              width: 1,
            ),
          ),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Container(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: FlutterFlowTheme.of(
                            context,
                          ).secondaryBackground,
                          borderRadius: BorderRadius.circular(12),
                          shape: BoxShape.rectangle,
                        ),
                        alignment: AlignmentDirectional(0, 0),
                        child: Icon(
                          Icons.description_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 24,
                        ),
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
                                'Workshop Artificial Intelligence',
                              ),
                              maxLines: 1,
                              style: FlutterFlowTheme.of(context)
                                  .titleSmall
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FlutterFlowTheme.of(
                                        context,
                                      ).titleSmall.fontWeight,
                                      fontStyle: FlutterFlowTheme.of(
                                        context,
                                      ).titleSmall.fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(
                                      context,
                                    ).primaryText,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(
                                      context,
                                    ).titleSmall.fontWeight,
                                    fontStyle: FlutterFlowTheme.of(
                                      context,
                                    ).titleSmall.fontStyle,
                                    lineHeight: 1.4,
                                  ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              valueOrDefault<String>(
                                widget.date,
                                '12 Okt 2023',
                              ),
                              style: FlutterFlowTheme.of(context)
                                  .bodySmall
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FlutterFlowTheme.of(
                                        context,
                                      ).bodySmall.fontWeight,
                                      fontStyle: FlutterFlowTheme.of(
                                        context,
                                      ).bodySmall.fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(
                                      context,
                                    ).secondaryText,
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
                      Container(
                        decoration: BoxDecoration(
                          color: valueOrDefault<Color>(
                            widget.statusBg,
                            Color(0x00000000),
                          ),
                          borderRadius: BorderRadius.circular(8),
                          shape: BoxShape.rectangle,
                        ),
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(8, 4, 8, 4),
                          child: Container(
                            child: Text(
                              valueOrDefault<String>(
                                widget.statusText,
                                'MENUNGGU',
                              ),
                              style: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FontWeight.bold,
                                      fontStyle: FlutterFlowTheme.of(
                                        context,
                                      ).labelSmall.fontStyle,
                                    ),
                                    color: valueOrDefault<Color>(
                                      widget.statusColor,
                                      Color(0x00000000),
                                    ),
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.bold,
                                    fontStyle: FlutterFlowTheme.of(
                                      context,
                                    ).labelSmall.fontStyle,
                                    lineHeight: 1.2,
                                  ),
                            ),
                          ),
                        ),
                      ),
                    ].divide(SizedBox(width: 16)),
                  ),
                  Divider(
                    height: 16,
                    thickness: 0.5,
                    indent: 0,
                    endIndent: 0,
                    color: FlutterFlowTheme.of(context).alternate,
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.attachment_rounded,
                            color: FlutterFlowTheme.of(context).secondaryText,
                            size: 16,
                          ),
                          Text(
                            valueOrDefault<String>(widget.files, '2 Files'),
                            style: FlutterFlowTheme.of(context)
                                .labelSmall
                                .override(
                                  font: GoogleFonts.figtree(
                                    fontWeight: FlutterFlowTheme.of(
                                      context,
                                    ).labelSmall.fontWeight,
                                    fontStyle: FlutterFlowTheme.of(
                                      context,
                                    ).labelSmall.fontStyle,
                                  ),
                                  color: FlutterFlowTheme.of(
                                    context,
                                  ).secondaryText,
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(
                                    context,
                                  ).labelSmall.fontWeight,
                                  fontStyle: FlutterFlowTheme.of(
                                    context,
                                  ).labelSmall.fontStyle,
                                  lineHeight: 1.2,
                                ),
                          ),
                        ].divide(SizedBox(width: 8)),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          wrapWithModel(
                            model: _model.buttonModel1,
                            updateCallback: () => safeSetState(() {}),
                            child: ButtonWidget(
                              content: 'Detail',
                              iconPresent: false,
                              iconEndPresent: false,
                              variant: 'ghost',
                              size: 'small',
                              fullWidth: false,
                              loading: false,
                              disabled: false,
                            ),
                          ),
                          wrapWithModel(
                            model: _model.buttonModel2,
                            updateCallback: () => safeSetState(() {}),
                            child: ButtonWidget(
                              content: valueOrDefault<String>(
                                widget.actionText,
                                'Update',
                              ),
                              icon: widget.actionIcon,
                              iconPresent: false,
                              iconEndPresent: false,
                              variant: 'primary',
                              size: 'small',
                              fullWidth: false,
                              loading: false,
                              disabled: false,
                            ),
                          ),
                        ].divide(SizedBox(width: 8)),
                      ),
                    ],
                  ),
                ].divide(SizedBox(height: 16)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
