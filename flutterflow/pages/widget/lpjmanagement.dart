import '/components/lpj_document_item/lpj_document_item_widget.dart';
import '/components/lpj_status_card/lpj_status_card_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../widget/l_p_j_management_model.dart';
export '../../widget/l_p_j_management_model.dart';

class LPJManagementWidget extends StatefulWidget {
  const LPJManagementWidget({super.key});

  static String routeName = 'LPJManagement';
  static String routePath = '/lPJManagement';

  @override
  State<LPJManagementWidget> createState() => _LPJManagementWidgetState();
}

class _LPJManagementWidgetState extends State<LPJManagementWidget> {
  late LPJManagementModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LPJManagementModel());
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () {
            print('FAB pressed ...');
          },
          backgroundColor: FlutterFlowTheme.of(context).primary,
          icon: Icon(
            Icons.add_rounded,
            color: FlutterFlowTheme.of(context).onPrimary,
            size: 24,
          ),
          elevation: 0,
          label: Text(
            'LPJ Baru',
            style: FlutterFlowTheme.of(context).labelLarge.override(
              font: GoogleFonts.figtree(
                fontWeight: FlutterFlowTheme.of(context).labelLarge.fontWeight,
                fontStyle: FlutterFlowTheme.of(context).labelLarge.fontStyle,
              ),
              color: FlutterFlowTheme.of(context).onPrimary,
              letterSpacing: 0.0,
              fontWeight: FlutterFlowTheme.of(context).labelLarge.fontWeight,
              fontStyle: FlutterFlowTheme.of(context).labelLarge.fontStyle,
              lineHeight: 1.3,
            ),
          ),
        ),
        body: SingleChildScrollView(
          primary: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.only(),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).surface80,
                      shape: BoxShape.rectangle,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                            24,
                            24,
                            24,
                            16,
                          ),
                          child: Container(
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    FlutterFlowIconButton(
                                      borderRadius: 8,
                                      buttonSize: 40,
                                      fillColor: Colors.transparent,
                                      icon: Icon(
                                        Icons.arrow_back_rounded,
                                        color: FlutterFlowTheme.of(
                                          context,
                                        ).primaryText,
                                        size: 24,
                                      ),
                                      onPressed: () {
                                        print('IconButton pressed ...');
                                      },
                                    ),
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Laporan (LPJ)',
                                          style: FlutterFlowTheme.of(context)
                                              .titleLarge
                                              .override(
                                                font: GoogleFonts.figtree(
                                                  fontWeight: FontWeight.w900,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).titleLarge.fontStyle,
                                                ),
                                                color: FlutterFlowTheme.of(
                                                  context,
                                                ).primaryText,
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w900,
                                                fontStyle: FlutterFlowTheme.of(
                                                  context,
                                                ).titleLarge.fontStyle,
                                                lineHeight: 1.3,
                                              ),
                                        ),
                                        Text(
                                          'Pertanggungjawaban Kegiatan',
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.figtree(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).labelSmall.fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
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
                                      ],
                                    ),
                                  ].divide(SizedBox(width: 8)),
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    color: FlutterFlowTheme.of(
                                      context,
                                    ).primaryContainer,
                                    borderRadius: BorderRadius.circular(9999),
                                    shape: BoxShape.rectangle,
                                  ),
                                  child: Padding(
                                    padding: EdgeInsets.all(8),
                                    child: Container(
                                      child: Icon(
                                        Icons.person_rounded,
                                        color: FlutterFlowTheme.of(
                                          context,
                                        ).onPrimaryContainer,
                                        size: 20,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Container(
                          height: 1,
                          decoration: BoxDecoration(
                            color: FlutterFlowTheme.of(context).alternate,
                            shape: BoxShape.rectangle,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(24),
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
                        Expanded(
                          flex: 1,
                          child: wrapWithModel(
                            model: _model.lpjStatusCardModel1,
                            updateCallback: () => safeSetState(() {}),
                            child: LpjStatusCardWidget(
                              bg: FlutterFlowTheme.of(
                                context,
                              ).secondaryBackground,
                              label: 'TOTAL LPJ',
                              textColor: FlutterFlowTheme.of(context).primary,
                              value: '24',
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: wrapWithModel(
                            model: _model.lpjStatusCardModel2,
                            updateCallback: () => safeSetState(() {}),
                            child: LpjStatusCardWidget(
                              bg: FlutterFlowTheme.of(context).primary,
                              label: 'PENDING',
                              textColor: FlutterFlowTheme.of(context).onPrimary,
                              value: '05',
                            ),
                          ),
                        ),
                      ].divide(SizedBox(width: 16)),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          flex: 1,
                          child: wrapWithModel(
                            model: _model.lpjStatusCardModel3,
                            updateCallback: () => safeSetState(() {}),
                            child: LpjStatusCardWidget(
                              bg: Color(0x00000000),
                              label: 'DISETUJUI',
                              textColor: Color(0x00000000),
                              value: '16',
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: wrapWithModel(
                            model: _model.lpjStatusCardModel4,
                            updateCallback: () => safeSetState(() {}),
                            child: LpjStatusCardWidget(
                              bg: Color(0x00000000),
                              label: 'REVISI',
                              textColor: Color(0x00000000),
                              value: '03',
                            ),
                          ),
                        ),
                      ].divide(SizedBox(width: 16)),
                    ),
                  ].divide(SizedBox(height: 16)),
                ),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(24, 0, 24, 16),
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
                        Expanded(
                          flex: 1,
                          child: wrapWithModel(
                            model: _model.textFieldModel,
                            updateCallback: () => safeSetState(() {}),
                            child: TextFieldWidget(
                              label: '',
                              labelPresent: false,
                              helper: '',
                              helperPresent: false,
                              hint: 'Cari dokumen LPJ...',
                              value: '',
                              onChange: '',
                              onSubmit: '',
                              leadingIcon: Icon(Icons.search_rounded),
                              leadingIconPresent: true,
                              trailingIconPresent: false,
                              variant: 'outlined',
                              error: false,
                            ),
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: FlutterFlowTheme.of(
                              context,
                            ).secondaryBackground,
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
                              child: Container(
                                alignment: AlignmentDirectional(0, 0),
                                child: Icon(
                                  Icons.tune_rounded,
                                  color: FlutterFlowTheme.of(context).onSurface,
                                  size: 24,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ].divide(SizedBox(width: 16)),
                    ),
                  ].divide(SizedBox(height: 16)),
                ),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(24, 0, 24, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 16),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            'Daftar Dokumen',
                            style: FlutterFlowTheme.of(context).titleMedium
                                .override(
                                  font: GoogleFonts.figtree(
                                    fontWeight: FontWeight.bold,
                                    fontStyle: FlutterFlowTheme.of(
                                      context,
                                    ).titleMedium.fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FontWeight.bold,
                                  fontStyle: FlutterFlowTheme.of(
                                    context,
                                  ).titleMedium.fontStyle,
                                  lineHeight: 1.35,
                                ),
                          ),
                          Container(
                            height: 34,
                            decoration: BoxDecoration(
                              color: FlutterFlowTheme.of(
                                context,
                              ).secondaryBackground,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: FlutterFlowTheme.of(context).alternate,
                                width: 1,
                              ),
                            ),
                            alignment: AlignmentDirectional(0, 0),
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                12,
                                0,
                                12,
                                0,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.sort_rounded,
                                    color: FlutterFlowTheme.of(
                                      context,
                                    ).primaryText,
                                    size: 18,
                                  ),
                                  Text(
                                    'Terbaru',
                                    style: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FlutterFlowTheme.of(
                                              context,
                                            ).labelMedium.fontWeight,
                                            fontStyle: FlutterFlowTheme.of(
                                              context,
                                            ).labelMedium.fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(
                                            context,
                                          ).primaryText,
                                          fontSize: 14,
                                          letterSpacing: 0.0,
                                          fontWeight: FlutterFlowTheme.of(
                                            context,
                                          ).labelMedium.fontWeight,
                                          fontStyle: FlutterFlowTheme.of(
                                            context,
                                          ).labelMedium.fontStyle,
                                          lineHeight: 1.3,
                                        ),
                                  ),
                                ].divide(SizedBox(width: 6)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    wrapWithModel(
                      model: _model.lpjDocumentItemModel1,
                      updateCallback: () => safeSetState(() {}),
                      child: LpjDocumentItemWidget(
                        actionIcon: Icon(Icons.upload_file_rounded),
                        actionText: 'Update',
                        actionVariant: 'outline',
                        date: '12 Okt 2023',
                        files: '2 Files',
                        statusBg: Color(0x00000000),
                        statusColor: Color(0x00000000),
                        statusText: 'MENUNGGU',
                        title: 'Workshop Artificial Intelligence',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.lpjDocumentItemModel2,
                      updateCallback: () => safeSetState(() {}),
                      child: LpjDocumentItemWidget(
                        actionIcon: Icon(Icons.help),
                        actionText: 'Revisi',
                        actionVariant: 'destructive',
                        date: '05 Okt 2023',
                        files: '1 File',
                        statusBg: Color(0x00000000),
                        statusColor: Color(0x00000000),
                        statusText: 'REVISI',
                        title: 'Seminar Nasional Teknologi',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.lpjDocumentItemModel3,
                      updateCallback: () => safeSetState(() {}),
                      child: LpjDocumentItemWidget(
                        actionIcon: Icon(Icons.file_download_rounded),
                        actionText: 'Unduh',
                        actionVariant: 'ghost',
                        date: '28 Sep 2023',
                        files: '4 Files',
                        statusBg: Color(0x00000000),
                        statusColor: Color(0x00000000),
                        statusText: 'DISETUJUI',
                        title: 'Lomba Inovasi Mahasiswa',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.lpjDocumentItemModel4,
                      updateCallback: () => safeSetState(() {}),
                      child: LpjDocumentItemWidget(
                        actionIcon: Icon(Icons.add_rounded),
                        actionText: 'Upload',
                        actionVariant: 'primary',
                        date: '20 Sep 2023',
                        files: '0 Files',
                        statusBg: Color(0x00000000),
                        statusColor: Color(0x00000000),
                        statusText: 'PROSES',
                        title: 'Pengabdian Masyarakat Desa',
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(24, 48, 24, 48),
                  child: Container(
                    child: Container(
                      alignment: AlignmentDirectional(0, 0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            'SIGAP PNJ v1.0.4',
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
                          Text(
                            'Manajemen Dokumen Digital',
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
                                  ).onBackground,
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
                        ].divide(SizedBox(height: 4)),
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
