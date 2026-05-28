import '/components/button/button_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/components/user_table_row/user_table_row_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../widget/user_management_model.dart';
export '../../widget/user_management_model.dart';

class UserManagementWidget extends StatefulWidget {
  const UserManagementWidget({super.key});

  static String routeName = 'UserManagement';
  static String routePath = '/userManagement';

  @override
  State<UserManagementWidget> createState() => _UserManagementWidgetState();
}

class _UserManagementWidgetState extends State<UserManagementWidget> {
  late UserManagementModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => UserManagementModel());
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
        body: Stack(
          alignment: AlignmentDirectional(-1, -1),
          children: [
            SingleChildScrollView(
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
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
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
                                              style:
                                                  FlutterFlowTheme.of(
                                                    context,
                                                  ).headlineSmall.override(
                                                    font: GoogleFonts.figtree(
                                                      fontWeight:
                                                          FontWeight.w900,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .headlineSmall
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                      context,
                                                    ).onSurface,
                                                    letterSpacing: 0.0,
                                                    fontWeight: FontWeight.w900,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                              context,
                                                            )
                                                            .headlineSmall
                                                            .fontStyle,
                                                    lineHeight: 1.3,
                                                  ),
                                            ),
                                            Text(
                                              'PNJ',
                                              style:
                                                  FlutterFlowTheme.of(
                                                    context,
                                                  ).headlineSmall.override(
                                                    font: GoogleFonts.figtree(
                                                      fontWeight:
                                                          FontWeight.w900,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .headlineSmall
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                      context,
                                                    ).primaryText,
                                                    letterSpacing: 0.0,
                                                    fontWeight: FontWeight.w900,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                              context,
                                                            )
                                                            .headlineSmall
                                                            .fontStyle,
                                                    lineHeight: 1.3,
                                                  ),
                                            ),
                                          ].divide(SizedBox(width: 4)),
                                        ),
                                        Text(
                                          'Manajemen Pengguna Sistem',
                                          style: FlutterFlowTheme.of(context)
                                              .bodySmall
                                              .override(
                                                font: GoogleFonts.figtree(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).bodySmall.fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
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
                                        borderRadius: BorderRadius.circular(
                                          9999,
                                        ),
                                        shape: BoxShape.rectangle,
                                      ),
                                      child: Padding(
                                        padding: EdgeInsets.all(8),
                                        child: Container(
                                          child: Icon(
                                            Icons.admin_panel_settings_rounded,
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
                          'Daftar Pengguna',
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
                                  hint: 'Cari nama atau NIP...',
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
                              width: 52,
                              height: 52,
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
                              alignment: AlignmentDirectional(0, 0),
                              child: Icon(
                                Icons.tune_rounded,
                                color: FlutterFlowTheme.of(context).onSurface,
                                size: 24,
                              ),
                            ),
                          ].divide(SizedBox(width: 16)),
                        ),
                      ].divide(SizedBox(height: 16)),
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
                              child: Container(
                                constraints: BoxConstraints(minHeight: 100),
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(context).primary,
                                  borderRadius: BorderRadius.circular(24),
                                  shape: BoxShape.rectangle,
                                ),
                                child: Padding(
                                  padding: EdgeInsets.all(24),
                                  child: Container(
                                    child: Stack(
                                      alignment: AlignmentDirectional(-1, -1),
                                      children: [
                                        Opacity(
                                          opacity: 0.1,
                                          child: Align(
                                            alignment: AlignmentDirectional(
                                              1,
                                              1,
                                            ),
                                            child: Text(
                                              '124',
                                              style:
                                                  FlutterFlowTheme.of(
                                                    context,
                                                  ).displaySmall.override(
                                                    font: GoogleFonts.figtree(
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .displaySmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .displaySmall
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                      context,
                                                    ).onSurface,
                                                    letterSpacing: 0.0,
                                                    fontWeight:
                                                        FlutterFlowTheme.of(
                                                              context,
                                                            )
                                                            .displaySmall
                                                            .fontWeight,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                              context,
                                                            )
                                                            .displaySmall
                                                            .fontStyle,
                                                    lineHeight: 1.2,
                                                  ),
                                            ),
                                          ),
                                        ),
                                        Column(
                                          mainAxisSize: MainAxisSize.min,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Opacity(
                                              opacity: 0.8,
                                              child: Text(
                                                'TOTAL USER',
                                                style:
                                                    FlutterFlowTheme.of(
                                                      context,
                                                    ).labelSmall.override(
                                                      font: GoogleFonts.figtree(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .labelSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .labelSmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                            context,
                                                          ).onSurface,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .labelSmall
                                                              .fontStyle,
                                                      lineHeight: 1.2,
                                                    ),
                                              ),
                                            ),
                                            Text(
                                              '124',
                                              style:
                                                  FlutterFlowTheme.of(
                                                    context,
                                                  ).titleLarge.override(
                                                    font: GoogleFonts.figtree(
                                                      fontWeight:
                                                          FontWeight.w900,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .titleLarge
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                      context,
                                                    ).onSurface,
                                                    letterSpacing: 0.0,
                                                    fontWeight: FontWeight.w900,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                          context,
                                                        ).titleLarge.fontStyle,
                                                    lineHeight: 1.3,
                                                  ),
                                            ),
                                          ].divide(SizedBox(height: 4)),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 1,
                              child: Container(
                                constraints: BoxConstraints(minHeight: 100),
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(
                                    context,
                                  ).secondaryBackground,
                                  borderRadius: BorderRadius.circular(24),
                                  shape: BoxShape.rectangle,
                                  border: Border.all(
                                    color: FlutterFlowTheme.of(
                                      context,
                                    ).alternate,
                                    width: 1,
                                  ),
                                ),
                                child: Padding(
                                  padding: EdgeInsets.all(24),
                                  child: Container(
                                    child: Stack(
                                      alignment: AlignmentDirectional(-1, -1),
                                      children: [
                                        Opacity(
                                          opacity: 0.05,
                                          child: Align(
                                            alignment: AlignmentDirectional(
                                              1,
                                              1,
                                            ),
                                            child: Text(
                                              '118',
                                              style:
                                                  FlutterFlowTheme.of(
                                                    context,
                                                  ).displaySmall.override(
                                                    font: GoogleFonts.figtree(
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .displaySmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .displaySmall
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                      context,
                                                    ).onSurface,
                                                    letterSpacing: 0.0,
                                                    fontWeight:
                                                        FlutterFlowTheme.of(
                                                              context,
                                                            )
                                                            .displaySmall
                                                            .fontWeight,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                              context,
                                                            )
                                                            .displaySmall
                                                            .fontStyle,
                                                    lineHeight: 1.2,
                                                  ),
                                            ),
                                          ),
                                        ),
                                        Column(
                                          mainAxisSize: MainAxisSize.min,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'USER AKTIF',
                                              style:
                                                  FlutterFlowTheme.of(
                                                    context,
                                                  ).labelSmall.override(
                                                    font: GoogleFonts.figtree(
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .labelSmall
                                                              .fontStyle,
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
                                              '118',
                                              style:
                                                  FlutterFlowTheme.of(
                                                    context,
                                                  ).titleLarge.override(
                                                    font: GoogleFonts.figtree(
                                                      fontWeight:
                                                          FontWeight.w900,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .titleLarge
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                      context,
                                                    ).onSurface,
                                                    letterSpacing: 0.0,
                                                    fontWeight: FontWeight.w900,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                          context,
                                                        ).titleLarge.fontStyle,
                                                    lineHeight: 1.3,
                                                  ),
                                            ),
                                          ].divide(SizedBox(height: 4)),
                                        ),
                                      ],
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
                    padding: EdgeInsetsDirectional.fromSTEB(24, 24, 16, 16),
                    child: Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Menampilkan 5 dari 124',
                          style: FlutterFlowTheme.of(context).labelMedium
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
                                ).secondaryText,
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
                        wrapWithModel(
                          model: _model.buttonModel,
                          updateCallback: () => safeSetState(() {}),
                          child: ButtonWidget(
                            content: 'Tambah User',
                            icon: Icon(
                              Icons.add_rounded,
                              color: FlutterFlowTheme.of(context).onPrimary,
                              size: 16,
                            ),
                            iconPresent: true,
                            iconEndPresent: false,
                            variant: 'primary',
                            size: 'small',
                            fullWidth: false,
                            loading: false,
                            disabled: false,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 0, 24, 0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        wrapWithModel(
                          model: _model.userTableRowModel1,
                          updateCallback: () => safeSetState(() {}),
                          child: UserTableRowWidget(
                            initials: 'AS',
                            name: 'Dr. Ahmad Syarif',
                            role: 'Administrator',
                            status: 'aktif',
                          ),
                        ),
                        wrapWithModel(
                          model: _model.userTableRowModel2,
                          updateCallback: () => safeSetState(() {}),
                          child: UserTableRowWidget(
                            initials: 'SA',
                            name: 'Siti Aminah, M.T.',
                            role: 'Bendahara',
                            status: 'aktif',
                          ),
                        ),
                        wrapWithModel(
                          model: _model.userTableRowModel3,
                          updateCallback: () => safeSetState(() {}),
                          child: UserTableRowWidget(
                            initials: 'BS',
                            name: 'Budi Santoso',
                            role: 'Direktur',
                            status: 'aktif',
                          ),
                        ),
                        wrapWithModel(
                          model: _model.userTableRowModel4,
                          updateCallback: () => safeSetState(() {}),
                          child: UserTableRowWidget(
                            initials: 'DL',
                            name: 'Dewi Lestari',
                            role: 'Operator KAK',
                            status: 'aktif',
                          ),
                        ),
                        wrapWithModel(
                          model: _model.userTableRowModel5,
                          updateCallback: () => safeSetState(() {}),
                          child: UserTableRowWidget(
                            initials: 'RP',
                            name: 'Rizky Pratama',
                            role: 'Admin Jurusan',
                            status: 'non_aktif',
                          ),
                        ),
                      ].divide(SizedBox(height: 8)),
                    ),
                  ),
                  Container(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Container(
                        child: Container(
                          alignment: AlignmentDirectional(0, 0),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              FlutterFlowIconButton(
                                borderColor: FlutterFlowTheme.of(
                                  context,
                                ).alternate,
                                borderRadius: 12,
                                borderWidth: 1,
                                buttonSize: 40,
                                fillColor: Colors.transparent,
                                icon: Icon(
                                  Icons.chevron_left_rounded,
                                  size: 24,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                'Halaman 1 dari 25',
                                style: FlutterFlowTheme.of(context).labelMedium
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
                              FlutterFlowIconButton(
                                borderColor: FlutterFlowTheme.of(
                                  context,
                                ).alternate,
                                borderRadius: 12,
                                borderWidth: 1,
                                buttonSize: 40,
                                fillColor: Colors.transparent,
                                icon: Icon(
                                  Icons.chevron_right_rounded,
                                  size: 24,
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
                  Container(height: 40),
                ],
              ),
            ),
            Align(
              alignment: AlignmentDirectional(1, 1),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0, 0, 16, 16),
                child: Container(
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).primary,
                      boxShadow: [
                        BoxShadow(
                          blurRadius: 10,
                          color: Color(0x33000000),
                          offset: Offset(0, 4),
                          spreadRadius: 0,
                        ),
                      ],
                      borderRadius: BorderRadius.circular(9999),
                    ),
                    alignment: AlignmentDirectional(0, 0),
                    child: Icon(
                      Icons.person_add_rounded,
                      color: FlutterFlowTheme.of(context).onPrimary,
                      size: 24,
                    ),
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
