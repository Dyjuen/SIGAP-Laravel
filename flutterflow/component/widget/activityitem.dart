import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'activity_item_model.dart';
export 'activity_item_model.dart';

class ActivityItemWidget extends StatefulWidget {
  const ActivityItemWidget({
    super.key,
    this.icon,
    String? status,
    String? time,
    String? title,
  }) : this.status = status ?? 'DISETUJUI',
       this.time = time ?? '2 jam yang lalu',
       this.title = title ?? 'Pengajuan KAK - Workshop AI';

  final Widget? icon;
  final String status;
  final String time;
  final String title;

  @override
  State<ActivityItemWidget> createState() => _ActivityItemWidgetState();
}

class _ActivityItemWidgetState extends State<ActivityItemWidget> {
  late ActivityItemModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ActivityItemModel());
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
          child: Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: FlutterFlowTheme.of(context).primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                  shape: BoxShape.rectangle,
                ),
                alignment: AlignmentDirectional(0, 0),
                child: widget!.icon!,
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
                        widget!.title,
                        'Pengajuan KAK - Workshop AI',
                      ),
                      maxLines: 1,
                      style: FlutterFlowTheme.of(context).titleSmall.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FlutterFlowTheme.of(
                            context,
                          ).titleSmall.fontWeight,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).titleSmall.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).primaryText,
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
                      valueOrDefault<String>(widget!.time, '2 jam yang lalu'),
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
              Container(
                decoration: BoxDecoration(
                  color: FlutterFlowTheme.of(context).secondaryBackground,
                  borderRadius: BorderRadius.circular(8),
                  shape: BoxShape.rectangle,
                ),
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(8, 4, 8, 4),
                  child: Container(
                    child: Text(
                      valueOrDefault<String>(widget!.status, 'DISETUJUI'),
                      style: FlutterFlowTheme.of(context).labelSmall.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FlutterFlowTheme.of(
                            context,
                          ).labelSmall.fontWeight,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).labelSmall.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).primary,
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
                  ),
                ),
              ),
            ].divide(SizedBox(width: 16)),
          ),
        ),
      ),
    );
  }
}
