import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'lpj_status_card_model.dart';
export 'lpj_status_card_model.dart';

class LpjStatusCardWidget extends StatefulWidget {
  const LpjStatusCardWidget({
    super.key,
    Color? bg,
    String? label,
    Color? textColor,
    String? value,
  }) : this.bg = bg ?? const Color(0x00000000),
       this.label = label ?? 'TOTAL LPJ',
       this.textColor = textColor ?? const Color(0x00000000),
       this.value = value ?? '24';

  final Color bg;
  final String label;
  final Color textColor;
  final String value;

  @override
  State<LpjStatusCardWidget> createState() => _LpjStatusCardWidgetState();
}

class _LpjStatusCardWidgetState extends State<LpjStatusCardWidget> {
  late LpjStatusCardModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LpjStatusCardModel());
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
        color: valueOrDefault<Color>(
          widget!.bg,
          FlutterFlowTheme.of(context).secondaryBackground,
        ),
        borderRadius: BorderRadius.circular(32),
        shape: BoxShape.rectangle,
      ),
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Container(
          child: Stack(
            alignment: AlignmentDirectional(-1, -1),
            children: [
              Opacity(
                opacity: 0.05,
                child: Align(
                  alignment: AlignmentDirectional(1, 1),
                  child: Text(
                    valueOrDefault<String>(widget!.value, '24'),
                    style: FlutterFlowTheme.of(context).displayLarge.override(
                      font: GoogleFonts.figtree(
                        fontWeight: FlutterFlowTheme.of(
                          context,
                        ).displayLarge.fontWeight,
                        fontStyle: FlutterFlowTheme.of(
                          context,
                        ).displayLarge.fontStyle,
                      ),
                      color: valueOrDefault<Color>(
                        widget!.textColor,
                        FlutterFlowTheme.of(context).primary,
                      ),
                      letterSpacing: 0.0,
                      fontWeight: FlutterFlowTheme.of(
                        context,
                      ).displayLarge.fontWeight,
                      fontStyle: FlutterFlowTheme.of(
                        context,
                      ).displayLarge.fontStyle,
                      lineHeight: 1.1,
                    ),
                  ),
                ),
              ),
              Align(
                alignment: AlignmentDirectional(-1, -1),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      valueOrDefault<String>(widget!.label, 'TOTAL LPJ'),
                      style: FlutterFlowTheme.of(context).titleMedium.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FontWeight.w900,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).titleMedium.fontStyle,
                        ),
                        color: valueOrDefault<Color>(
                          widget!.textColor,
                          FlutterFlowTheme.of(context).primary,
                        ),
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w900,
                        fontStyle: FlutterFlowTheme.of(
                          context,
                        ).titleMedium.fontStyle,
                        lineHeight: 1.35,
                      ),
                    ),
                    Text(
                      valueOrDefault<String>(widget!.value, '24'),
                      style: FlutterFlowTheme.of(context).displayMedium
                          .override(
                            font: GoogleFonts.figtree(
                              fontWeight: FontWeight.w900,
                              fontStyle: FlutterFlowTheme.of(
                                context,
                              ).displayMedium.fontStyle,
                            ),
                            color: valueOrDefault<Color>(
                              widget!.textColor,
                              FlutterFlowTheme.of(context).primary,
                            ),
                            letterSpacing: 0.0,
                            fontWeight: FontWeight.w900,
                            fontStyle: FlutterFlowTheme.of(
                              context,
                            ).displayMedium.fontStyle,
                            lineHeight: 1.15,
                          ),
                    ),
                  ].divide(SizedBox(height: 4)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
