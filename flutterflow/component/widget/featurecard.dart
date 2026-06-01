import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'feature_card_model.dart';
export 'feature_card_model.dart';

class FeatureCardWidget extends StatefulWidget {
  const FeatureCardWidget({super.key, String? desc, this.icon, String? title})
      : this.desc = desc ??
            'Proses KAK dan RAB kini hanya dalam hitungan menit secara digital.',
        this.title = title ?? 'Pengajuan Cepat';

  final String desc;
  final Widget? icon;
  final String title;

  @override
  State<FeatureCardWidget> createState() => _FeatureCardWidgetState();
}

class _FeatureCardWidgetState extends State<FeatureCardWidget> {
  late FeatureCardModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FeatureCardModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: FlutterFlowTheme.of(context).surface80,
            borderRadius: BorderRadius.circular(24),
            shape: BoxShape.rectangle,
            border: Border.all(color: Colors.transparent, width: 1),
          ),
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Container(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).primaryContainer,
                      borderRadius: BorderRadius.circular(16),
                      shape: BoxShape.rectangle,
                    ),
                    alignment: AlignmentDirectional(0, 0),
                    child: widget.icon!,
                  ),
                  Text(
                    valueOrDefault<String>(widget.title, 'Pengajuan Cepat'),
                    style: FlutterFlowTheme.of(context).titleMedium.override(
                          font: GoogleFonts.figtree(
                            fontWeight: FontWeight.w800,
                            fontStyle: FlutterFlowTheme.of(
                              context,
                            ).titleMedium.fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).primaryText,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w800,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).titleMedium.fontStyle,
                          lineHeight: 1.35,
                        ),
                  ),
                  Text(
                    valueOrDefault<String>(
                      widget.desc,
                      'Proses KAK dan RAB kini hanya dalam hitungan menit secara digital.',
                    ),
                    maxLines: 3,
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
                    overflow: TextOverflow.ellipsis,
                  ),
                ].divide(SizedBox(height: 8)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
