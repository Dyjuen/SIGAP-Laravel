import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'faq_item_model.dart';
export 'faq_item_model.dart';

class FaqItemWidget extends StatefulWidget {
  const FaqItemWidget({super.key, String? question})
    : this.question = question ?? 'Bagaimana cara membuat akun?';

  final String question;

  @override
  State<FaqItemWidget> createState() => _FaqItemWidgetState();
}

class _FaqItemWidgetState extends State<FaqItemWidget> {
  late FaqItemModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FaqItemModel());
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    flex: 1,
                    child: Text(
                      valueOrDefault<String>(
                        widget!.question,
                        'Bagaimana cara membuat akun?',
                      ),
                      style: FlutterFlowTheme.of(context).labelLarge.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FontWeight.w600,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).labelLarge.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).primaryText,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w600,
                        fontStyle: FlutterFlowTheme.of(
                          context,
                        ).labelLarge.fontStyle,
                        lineHeight: 1.3,
                      ),
                    ),
                  ),
                  Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color: FlutterFlowTheme.of(context).secondaryText,
                    size: 20,
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
