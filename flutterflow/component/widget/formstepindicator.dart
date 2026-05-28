import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'form_step_indicator_model.dart';
export 'form_step_indicator_model.dart';

class FormStepIndicatorWidget extends StatefulWidget {
  const FormStepIndicatorWidget({super.key, String? label, bool? active})
    : this.label = label ?? 'Umum',
      this.active = active ?? true;

  final String label;
  final bool active;

  @override
  State<FormStepIndicatorWidget> createState() =>
      _FormStepIndicatorWidgetState();
}

class _FormStepIndicatorWidgetState extends State<FormStepIndicatorWidget> {
  late FormStepIndicatorModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FormStepIndicatorModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          height: 4,
          decoration: BoxDecoration(
            color: widget!.active
                ? FlutterFlowTheme.of(context).primary
                : FlutterFlowTheme.of(context).surfaceVariant,
            borderRadius: BorderRadius.circular(9999),
            shape: BoxShape.rectangle,
          ),
        ),
        Text(
          valueOrDefault<String>(widget!.label, 'Umum'),
          textAlign: TextAlign.center,
          style: FlutterFlowTheme.of(context).labelSmall.override(
            font: GoogleFonts.figtree(
              fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
            ),
            color: widget!.active
                ? FlutterFlowTheme.of(context).primary
                : FlutterFlowTheme.of(context).secondaryText,
            letterSpacing: 0.0,
            fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
            fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
            lineHeight: 1.2,
          ),
        ),
      ].divide(SizedBox(height: 4)),
    );
  }
}
