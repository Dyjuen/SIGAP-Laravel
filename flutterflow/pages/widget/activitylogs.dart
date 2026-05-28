import '/components/log_entry_card/log_entry_card_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../widget/activity_logs_model.dart';
export '../../widget/activity_logs_model.dart';

class ActivityLogsWidget extends StatefulWidget {
  const ActivityLogsWidget({super.key});

  static String routeName = 'ActivityLogs';
  static String routePath = '/activityLogs';

  @override
  State<ActivityLogsWidget> createState() => _ActivityLogsWidgetState();
}

class _ActivityLogsWidgetState extends State<ActivityLogsWidget> {
  late ActivityLogsModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ActivityLogsModel());
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
            Icons.download_rounded,
            color: FlutterFlowTheme.of(context).onPrimary,
            size: 24,
          ),
          elevation: 0,
          label: Text(
            'Ekspor Log',
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
        body: Column(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.only(),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                child: Container(
                  decoration: BoxDecoration(
                    color: FlutterFlowTheme.of(context).surface85,
                    shape: BoxShape.rectangle,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(24, 24, 24, 16),
                        child: Container(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
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
                                  Text(
                                    'Audit System',
                                    style: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FontWeight.w900,
                                            fontStyle: FlutterFlowTheme.of(
                                              context,
                                            ).titleMedium.fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(
                                            context,
                                          ).primaryText,
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.w900,
                                          fontStyle: FlutterFlowTheme.of(
                                            context,
                                          ).titleMedium.fontStyle,
                                          lineHeight: 1.35,
                                        ),
                                  ),
                                  FlutterFlowIconButton(
                                    borderRadius: 8,
                                    buttonSize: 40,
                                    fillColor: Colors.transparent,
                                    icon: Icon(
                                      Icons.tune_rounded,
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).primary,
                                      size: 24,
                                    ),
                                    onPressed: () {
                                      print('IconButton pressed ...');
                                    },
                                  ),
                                ],
                              ),
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Text(
                                    'SIGAP',
                                    style: FlutterFlowTheme.of(context)
                                        .headlineSmall
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FontWeight.w900,
                                            fontStyle: FlutterFlowTheme.of(
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
                                            fontStyle: FlutterFlowTheme.of(
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
                            ].divide(SizedBox(height: 8)),
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
            Container(
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).secondaryBackground,
                shape: BoxShape.rectangle,
              ),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(24, 16, 24, 16),
                child: Container(
                  child: Row(
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
                            hint: 'Cari log aktivitas...',
                            value: '',
                            onChange: '',
                            onSubmit: '',
                            leadingIcon: Icon(
                              Icons.search_rounded,
                              color: FlutterFlowTheme.of(context).primaryText,
                              size: 16,
                            ),
                            leadingIconPresent: true,
                            trailingIconPresent: false,
                            variant: 'filled',
                            error: false,
                          ),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: FlutterFlowTheme.of(context).primaryContainer,
                          borderRadius: BorderRadius.circular(16),
                          shape: BoxShape.rectangle,
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Container(
                            child: Container(
                              alignment: AlignmentDirectional(0, 0),
                              child: Icon(
                                Icons.calendar_today_rounded,
                                color: FlutterFlowTheme.of(
                                  context,
                                ).onPrimaryContainer,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ].divide(SizedBox(width: 16)),
                  ),
                ),
              ),
            ),
            Expanded(
              flex: 1,
              child: Container(
                child: SingleChildScrollView(
                  primary: false,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Padding(
                        padding: EdgeInsets.all(24),
                        child: Container(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                  0,
                                  0,
                                  0,
                                  16,
                                ),
                                child: Container(
                                  child: Text(
                                    'HARI INI',
                                    style: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FontWeight.w800,
                                            fontStyle: FlutterFlowTheme.of(
                                              context,
                                            ).labelSmall.fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(
                                            context,
                                          ).onBackground,
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.w800,
                                          fontStyle: FlutterFlowTheme.of(
                                            context,
                                          ).labelSmall.fontStyle,
                                          lineHeight: 1.2,
                                        ),
                                  ),
                                ),
                              ),
                              wrapWithModel(
                                model: _model.logEntryCardModel1,
                                updateCallback: () => safeSetState(() {}),
                                child: LogEntryCardWidget(
                                  action:
                                      'Mengubah status KAK \'Workshop AI\' menjadi DISETUJUI',
                                  bgColor: FlutterFlowTheme.of(
                                    context,
                                  ).primaryContainer,
                                  icon: Icon(
                                    Icons.edit_note_rounded,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 22,
                                  ),
                                  iconColor: FlutterFlowTheme.of(
                                    context,
                                  ).primary,
                                  ip: '192.168.1.12',
                                  module: 'KAK',
                                  time: '10:45',
                                  user: 'Admin Utama',
                                ),
                              ),
                              wrapWithModel(
                                model: _model.logEntryCardModel2,
                                updateCallback: () => safeSetState(() {}),
                                child: LogEntryCardWidget(
                                  action:
                                      'Menambahkan lampiran baru pada usulan RAB Seminar',
                                  bgColor: FlutterFlowTheme.of(
                                    context,
                                  ).success15,
                                  icon: Icon(
                                    Icons.attach_file_rounded,
                                    color: FlutterFlowTheme.of(context).success,
                                    size: 22,
                                  ),
                                  iconColor: FlutterFlowTheme.of(
                                    context,
                                  ).success,
                                  ip: '10.0.4.55',
                                  module: 'RAB',
                                  time: '09:20',
                                  user: 'Budi Santoso',
                                ),
                              ),
                              wrapWithModel(
                                model: _model.logEntryCardModel3,
                                updateCallback: () => safeSetState(() {}),
                                child: LogEntryCardWidget(
                                  action:
                                      'Otomatisasi pengiriman notifikasi email ke Bendahara',
                                  bgColor: FlutterFlowTheme.of(context).info15,
                                  icon: Icon(
                                    Icons.help,
                                    color: FlutterFlowTheme.of(context).info,
                                    size: 22,
                                  ),
                                  iconColor: FlutterFlowTheme.of(context).info,
                                  ip: 'SERVER',
                                  module: 'NOTIF',
                                  time: '08:05',
                                  user: 'Sistem',
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                  0,
                                  16,
                                  0,
                                  16,
                                ),
                                child: Container(
                                  child: Divider(
                                    height: 16,
                                    thickness: 1,
                                    indent: 0,
                                    endIndent: 0,
                                    color: FlutterFlowTheme.of(
                                      context,
                                    ).alternate,
                                  ),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                  0,
                                  0,
                                  0,
                                  16,
                                ),
                                child: Container(
                                  child: Text(
                                    'KEMARIN',
                                    style: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FontWeight.w800,
                                            fontStyle: FlutterFlowTheme.of(
                                              context,
                                            ).labelSmall.fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(
                                            context,
                                          ).onBackground,
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.w800,
                                          fontStyle: FlutterFlowTheme.of(
                                            context,
                                          ).labelSmall.fontStyle,
                                          lineHeight: 1.2,
                                        ),
                                  ),
                                ),
                              ),
                              wrapWithModel(
                                model: _model.logEntryCardModel4,
                                updateCallback: () => safeSetState(() {}),
                                child: LogEntryCardWidget(
                                  action:
                                      'Gagal login: Percobaan kata sandi salah 3x',
                                  bgColor: FlutterFlowTheme.of(context).error15,
                                  icon: Icon(
                                    Icons.report_problem_rounded,
                                    color: FlutterFlowTheme.of(context).error,
                                    size: 22,
                                  ),
                                  iconColor: FlutterFlowTheme.of(context).error,
                                  ip: '112.44.1.9',
                                  module: 'AUTH',
                                  time: '22:15',
                                  user: 'Siti Aminah',
                                ),
                              ),
                              wrapWithModel(
                                model: _model.logEntryCardModel5,
                                updateCallback: () => safeSetState(() {}),
                                child: LogEntryCardWidget(
                                  action:
                                      'Menghapus draf usulan kegiatan yang kadaluarsa',
                                  bgColor: FlutterFlowTheme.of(context).error15,
                                  icon: Icon(
                                    Icons.delete_sweep_rounded,
                                    color: FlutterFlowTheme.of(context).error,
                                    size: 22,
                                  ),
                                  iconColor: FlutterFlowTheme.of(context).error,
                                  ip: '192.168.1.12',
                                  module: 'MASTER',
                                  time: '16:40',
                                  user: 'Admin Utama',
                                ),
                              ),
                              wrapWithModel(
                                model: _model.logEntryCardModel6,
                                updateCallback: () => safeSetState(() {}),
                                child: LogEntryCardWidget(
                                  action:
                                      'Membuat usulan KAK baru: Pelatihan Cloud Computing',
                                  bgColor: FlutterFlowTheme.of(
                                    context,
                                  ).primaryContainer,
                                  icon: Icon(
                                    Icons.add_task_rounded,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 22,
                                  ),
                                  iconColor: FlutterFlowTheme.of(
                                    context,
                                  ).primary,
                                  ip: '10.0.12.5',
                                  module: 'KAK',
                                  time: '14:10',
                                  user: 'Dosen Teknik',
                                ),
                              ),
                              wrapWithModel(
                                model: _model.logEntryCardModel7,
                                updateCallback: () => safeSetState(() {}),
                                child: LogEntryCardWidget(
                                  action:
                                      'Mencairkan dana untuk kegiatan Lomba Robotik',
                                  bgColor: FlutterFlowTheme.of(
                                    context,
                                  ).success15,
                                  icon: Icon(
                                    Icons.payments_rounded,
                                    color: FlutterFlowTheme.of(context).success,
                                    size: 22,
                                  ),
                                  iconColor: FlutterFlowTheme.of(
                                    context,
                                  ).success,
                                  ip: '10.0.8.22',
                                  module: 'PENCAIRAN',
                                  time: '11:00',
                                  user: 'Keuangan',
                                ),
                              ),
                              Container(
                                child: Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                    24,
                                    48,
                                    24,
                                    48,
                                  ),
                                  child: Container(
                                    child: Container(
                                      alignment: AlignmentDirectional(0, 0),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment:
                                            MainAxisAlignment.start,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: [
                                          Text(
                                            'SIGAP PNJ v1.0.4',
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
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).labelSmall.fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).labelSmall.fontStyle,
                                                  lineHeight: 1.2,
                                                ),
                                          ),
                                          Text(
                                            'Log Audit Keamanan & Administrasi',
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
                                                  ).onBackground,
                                                  letterSpacing: 0.0,
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).labelSmall.fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
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
                            ].divide(SizedBox(height: 4)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
