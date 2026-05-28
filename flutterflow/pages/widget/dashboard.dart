import '/components/activity_item/activity_item_widget.dart';
import '/components/blue_stat_card/blue_stat_card_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../widget/dashboard_model.dart';
export '../../widget/dashboard_model.dart';

class DashboardWidget extends StatefulWidget {
  const DashboardWidget({super.key});

  static String routeName = 'Dashboard';
  static String routePath = '/dashboard';

  @override
  State<DashboardWidget> createState() => _DashboardWidgetState();
}

class _DashboardWidgetState extends State<DashboardWidget> {
  late DashboardModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DashboardModel());
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
                                Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                      children: [
                                        Text(
                                          'SIGAP',
                                          style: FlutterFlowTheme.of(context)
                                              .headlineSmall
                                              .override(
                                                font: GoogleFonts.figtree(
                                                  fontWeight: FontWeight.w900,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).headlineSmall.fontStyle,
                                                ),
                                                color: FlutterFlowTheme.of(
                                                  context,
                                                ).onSurface,
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w900,
                                                fontStyle: FlutterFlowTheme.of(
                                                  context,
                                                ).headlineSmall.fontStyle,
                                                lineHeight: 1.3,
                                              ),
                                        ),
                                        Text(
                                          'PNJ',
                                          style: FlutterFlowTheme.of(context)
                                              .headlineSmall
                                              .override(
                                                font: GoogleFonts.figtree(
                                                  fontWeight: FontWeight.w900,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).headlineSmall.fontStyle,
                                                ),
                                                color: FlutterFlowTheme.of(
                                                  context,
                                                ).primaryText,
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w900,
                                                fontStyle: FlutterFlowTheme.of(
                                                  context,
                                                ).headlineSmall.fontStyle,
                                                lineHeight: 1.3,
                                              ),
                                        ),
                                      ].divide(SizedBox(width: 4)),
                                    ),
                                    Text(
                                      'Sistem Informasi Gerbang Administrasi',
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
                                  ],
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
                    Text(
                      'Selamat Datang,',
                      style: FlutterFlowTheme.of(context).titleLarge.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FlutterFlowTheme.of(
                            context,
                          ).titleLarge.fontWeight,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).titleLarge.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).secondaryText,
                        letterSpacing: 0.0,
                        fontWeight: FlutterFlowTheme.of(
                          context,
                        ).titleLarge.fontWeight,
                        fontStyle: FlutterFlowTheme.of(
                          context,
                        ).titleLarge.fontStyle,
                        lineHeight: 1.3,
                      ),
                    ),
                    Text(
                      'Administrator Utama',
                      style: FlutterFlowTheme.of(context).headlineMedium
                          .override(
                            font: GoogleFonts.figtree(
                              fontWeight: FontWeight.w900,
                              fontStyle: FlutterFlowTheme.of(
                                context,
                              ).headlineMedium.fontStyle,
                            ),
                            color: FlutterFlowTheme.of(context).primaryText,
                            letterSpacing: 0.0,
                            fontWeight: FontWeight.w900,
                            fontStyle: FlutterFlowTheme.of(
                              context,
                            ).headlineMedium.fontStyle,
                            lineHeight: 1.25,
                          ),
                    ),
                  ].divide(SizedBox(height: 4)),
                ),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(24, 0, 24, 0),
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
                            model: _model.blueStatCardModel1,
                            updateCallback: () => safeSetState(() {}),
                            child: BlueStatCardWidget(
                              bg: FlutterFlowTheme.of(context).primary,
                              label: 'PENCAIRAN',
                              textColor: FlutterFlowTheme.of(context).onPrimary,
                              value: '12',
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: wrapWithModel(
                            model: _model.blueStatCardModel2,
                            updateCallback: () => safeSetState(() {}),
                            child: BlueStatCardWidget(
                              bg: FlutterFlowTheme.of(
                                context,
                              ).secondaryBackground,
                              label: 'KEGIATAN',
                              textColor: FlutterFlowTheme.of(context).primary,
                              value: '08',
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
                            model: _model.blueStatCardModel3,
                            updateCallback: () => safeSetState(() {}),
                            child: BlueStatCardWidget(
                              bg: FlutterFlowTheme.of(
                                context,
                              ).secondaryBackground,
                              label: 'LPJ',
                              textColor: FlutterFlowTheme.of(context).primary,
                              value: '24',
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: wrapWithModel(
                            model: _model.blueStatCardModel4,
                            updateCallback: () => safeSetState(() {}),
                            child: BlueStatCardWidget(
                              bg: FlutterFlowTheme.of(context).primaryContainer,
                              label: 'REVISI',
                              textColor: FlutterFlowTheme.of(context).primary,
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
                padding: EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Akses Cepat',
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
                        Text(
                          'Lihat Semua',
                          style: FlutterFlowTheme.of(context).labelLarge
                              .override(
                                font: GoogleFonts.figtree(
                                  fontWeight: FlutterFlowTheme.of(
                                    context,
                                  ).labelLarge.fontWeight,
                                  fontStyle: FlutterFlowTheme.of(
                                    context,
                                  ).labelLarge.fontStyle,
                                ),
                                color: FlutterFlowTheme.of(
                                  context,
                                ).onBackground,
                                letterSpacing: 0.0,
                                fontWeight: FlutterFlowTheme.of(
                                  context,
                                ).labelLarge.fontWeight,
                                fontStyle: FlutterFlowTheme.of(
                                  context,
                                ).labelLarge.fontStyle,
                                lineHeight: 1.3,
                              ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          flex: 1,
                          child: Container(
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
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.add_circle_outline_rounded,
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).onSurface,
                                      size: 32,
                                    ),
                                    Text(
                                      'Buat KAK',
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
                                  ].divide(SizedBox(height: 8)),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: Container(
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
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.assignment_rounded,
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).onSurface,
                                      size: 32,
                                    ),
                                    Text(
                                      'Daftar LPJ',
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
                                  ].divide(SizedBox(height: 8)),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: Container(
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
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.insights_rounded,
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).onSurface,
                                      size: 32,
                                    ),
                                    Text(
                                      'Monitoring',
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
                                  ].divide(SizedBox(height: 8)),
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
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Aktivitas Terbaru',
                      style: FlutterFlowTheme.of(context).titleMedium.override(
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
                    wrapWithModel(
                      model: _model.activityItemModel1,
                      updateCallback: () => safeSetState(() {}),
                      child: ActivityItemWidget(
                        icon: Icon(
                          Icons.history_edu_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 24,
                        ),
                        status: 'DISETUJUI',
                        time: '2 jam yang lalu',
                        title: 'Pengajuan KAK - Workshop AI',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.activityItemModel2,
                      updateCallback: () => safeSetState(() {}),
                      child: ActivityItemWidget(
                        icon: Icon(
                          Icons.rate_review_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 24,
                        ),
                        status: 'PENDING',
                        time: '5 jam yang lalu',
                        title: 'Revisi RAB - Seminar Nasional',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.activityItemModel3,
                      updateCallback: () => safeSetState(() {}),
                      child: ActivityItemWidget(
                        icon: Icon(
                          Icons.inventory_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 24,
                        ),
                        status: 'PROSES',
                        time: 'Kemarin',
                        title: 'Laporan Pertanggungjawaban',
                      ),
                    ),
                  ].divide(SizedBox(height: 16)),
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
                            'Politeknik Negeri Jakarta',
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
