import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'faq_accordion_model.dart';
export 'faq_accordion_model.dart';

class FaqAccordionWidget extends StatefulWidget {
  const FaqAccordionWidget({
    super.key,
    String? answer,
    String? question,
    bool? isOpen,
  }) : this.answer =
           answer ??
           'Anda dapat melakukan revisi jika status usulan dikembalikan oleh verifikator. Klik tombol \'Revisi\' pada detail kegiatan Anda.',
       this.question =
           question ?? 'Bagaimana cara merubah RAB yang sudah dikirim?',
       this.isOpen = isOpen ?? true;

  final String answer;
  final String question;
  final bool isOpen;

  @override
  State<FaqAccordionWidget> createState() => _FaqAccordionWidgetState();
}

class _FaqAccordionWidgetState extends State<FaqAccordionWidget> {
  late FaqAccordionModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FaqAccordionModel());
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                child: Padding(
                  padding: EdgeInsets.all(24),
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
                              'Bagaimana cara merubah RAB yang sudah dikirim?',
                            ),
                            maxLines: 2,
                            style: FlutterFlowTheme.of(context).titleSmall
                                .override(
                                  font: GoogleFonts.figtree(
                                    fontWeight: FontWeight.w600,
                                    fontStyle: FlutterFlowTheme.of(
                                      context,
                                    ).titleSmall.fontStyle,
                                  ),
                                  color: FlutterFlowTheme.of(
                                    context,
                                  ).primaryText,
                                  letterSpacing: 0.0,
                                  fontWeight: FontWeight.w600,
                                  fontStyle: FlutterFlowTheme.of(
                                    context,
                                  ).titleSmall.fontStyle,
                                  lineHeight: 1.4,
                                ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          width: 24,
                          height: 24,
                          child: Stack(
                            alignment: AlignmentDirectional(0, 0),
                            children: [
                              if (widget!.isOpen ? true : false)
                                Icon(
                                  Icons.expand_less_rounded,
                                  color: FlutterFlowTheme.of(
                                    context,
                                  ).secondaryText,
                                  size: 24,
                                ),
                              if (widget!.isOpen ? false : true)
                                Icon(
                                  Icons.expand_more_rounded,
                                  color: FlutterFlowTheme.of(
                                    context,
                                  ).secondaryText,
                                  size: 24,
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              if (valueOrDefault<bool>(widget!.isOpen, true))
                Container(
                  child: Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 0, 24, 24),
                    child: Container(
                      child: Text(
                        valueOrDefault<String>(
                          widget!.answer,
                          'Anda dapat melakukan revisi jika status usulan dikembalikan oleh verifikator. Klik tombol \'Revisi\' pada detail kegiatan Anda.',
                        ),
                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                          font: GoogleFonts.figtree(
                            fontWeight: FlutterFlowTheme.of(
                              context,
                            ).bodyMedium.fontWeight,
                            fontStyle: FlutterFlowTheme.of(
                              context,
                            ).bodyMedium.fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).secondaryText,
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(
                            context,
                          ).bodyMedium.fontWeight,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).bodyMedium.fontStyle,
                          lineHeight: 1.5,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
