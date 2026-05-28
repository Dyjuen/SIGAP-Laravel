import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'user_table_row_model.dart';
export 'user_table_row_model.dart';

class UserTableRowWidget extends StatefulWidget {
  const UserTableRowWidget({
    super.key,
    String? initials,
    String? name,
    String? role,
    String? status,
  }) : this.initials = initials ?? 'AS',
       this.name = name ?? 'Dr. Ahmad Syarif',
       this.role = role ?? 'Administrator',
       this.status = status ?? 'aktif';

  final String initials;
  final String name;
  final String role;
  final String status;

  @override
  State<UserTableRowWidget> createState() => _UserTableRowWidgetState();
}

class _UserTableRowWidgetState extends State<UserTableRowWidget> {
  late UserTableRowModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => UserTableRowModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 8),
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
                      borderRadius: BorderRadius.circular(9999),
                      shape: BoxShape.rectangle,
                    ),
                    alignment: AlignmentDirectional(0, 0),
                    child: Text(
                      valueOrDefault<String>(widget!.initials, 'AS'),
                      style: FlutterFlowTheme.of(context).titleSmall.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FlutterFlowTheme.of(
                            context,
                          ).titleSmall.fontWeight,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).titleSmall.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).primary,
                        letterSpacing: 0.0,
                        fontWeight: FlutterFlowTheme.of(
                          context,
                        ).titleSmall.fontWeight,
                        fontStyle: FlutterFlowTheme.of(
                          context,
                        ).titleSmall.fontStyle,
                        lineHeight: 1.4,
                      ),
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
                            widget!.name,
                            'Dr. Ahmad Syarif',
                          ),
                          maxLines: 1,
                          style: FlutterFlowTheme.of(context).titleSmall
                              .override(
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
                          valueOrDefault<String>(widget!.role, 'Administrator'),
                          style: FlutterFlowTheme.of(context).labelSmall
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
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.circle,
                              color: widget!.status == 'aktif'
                                  ? FlutterFlowTheme.of(context).success
                                  : FlutterFlowTheme.of(context).error,
                              size: 8,
                            ),
                            Text(
                              valueOrDefault<String>(widget!.status, 'aktif'),
                              style: FlutterFlowTheme.of(context).labelSmall
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
                          ].divide(SizedBox(width: 4)),
                        ),
                      ].divide(SizedBox(height: 4)),
                    ),
                  ),
                  FlutterFlowIconButton(
                    borderRadius: 8,
                    buttonSize: 40,
                    fillColor: Colors.transparent,
                    icon: Icon(
                      Icons.edit_rounded,
                      color: FlutterFlowTheme.of(context).secondaryText,
                      size: 20,
                    ),
                    onPressed: () {
                      print('IconButton pressed ...');
                    },
                  ),
                ].divide(SizedBox(width: 16)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
