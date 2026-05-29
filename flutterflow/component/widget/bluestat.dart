import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'blue_stat_card_model.dart';
export 'blue_stat_card_model.dart';

class BlueStatCardWidget extends StatefulWidget {
  const BlueStatCardWidget({
    super.key,
    Color? bg,
    String? label,
    Color? textColor,
    String? value,
  }) : this.bg = bg ?? const Color(0x00000000),
       this.label = label ?? 'PENCAIRAN',
       this.textColor = textColor ?? const Color(0x00000000),
       this.value = value ?? '12';

  final Color bg;
  final String label;
  final Color textColor;
  final String value;

  @override
  State<BlueStatCardWidget> createState() => _BlueStatCardWidgetState();
}

class _BlueStatCardWidgetState extends State<BlueStatCardWidget> {
  late BlueStatCardModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => BlueStatCardModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(minHeight: 180),
      decoration: BoxDecoration(
        color: valueOrDefault<Color>(
          widget!.bg,
          FlutterFlowTheme.of(context).primary,
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
                    valueOrDefault<String>(widget!.value, '12'),
                    style: FlutterFlowTheme.of(context).displayLarge.override(
                      font: GoogleFonts.figtree(
                        fontWeight: FlutterFlowTheme.of(
                          context,
                        ).displayLarge.fontWeight,
                        fontStyle: FlutterFlowTheme.of(
                          context,
                        ).displayLarge.fontStyle,
                      ),
                      color: FlutterFlowTheme.of(context).primaryText,
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
                      valueOrDefault<String>(widget!.label, 'PENCAIRAN'),
                      style: FlutterFlowTheme.of(context).titleMedium.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FontWeight.w900,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).titleMedium.fontStyle,
                        ),
                        color: valueOrDefault<Color>(
                          widget!.textColor,
                          FlutterFlowTheme.of(context).onPrimary,
                        ),
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w900,
                        fontStyle: FlutterFlowTheme.of(
                          context,
                        ).titleMedium.fontStyle,
                        lineHeight: 1.35,
                      ),
                    ),
                    Opacity(
                      opacity: 0.7,
                      child: Text(
                        'USULAN',
                        style: FlutterFlowTheme.of(context).labelSmall.override(
                          font: GoogleFonts.figtree(
                            fontWeight: FlutterFlowTheme.of(
                              context,
                            ).labelSmall.fontWeight,
                            fontStyle: FlutterFlowTheme.of(
                              context,
                            ).labelSmall.fontStyle,
                          ),
                          color: valueOrDefault<Color>(
                            widget!.textColor,
                            FlutterFlowTheme.of(context).onPrimary,
                          ),
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
                    Text(
                      valueOrDefault<String>(widget!.value, '12'),
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
                              FlutterFlowTheme.of(context).onPrimary,
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
