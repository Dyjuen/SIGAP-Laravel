import '/components/button/button_widget.dart';
import '/components/profile_info_row/profile_info_row_widget.dart';
import '/components/settings_tile/settings_tile_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../widget/user_profile_model.dart';
export '../../widget/user_profile_model.dart';

class UserProfileWidget extends StatefulWidget {
  const UserProfileWidget({super.key});

  static String routeName = 'UserProfile';
  static String routePath = '/userProfile';

  @override
  State<UserProfileWidget> createState() => _UserProfileWidgetState();
}

class _UserProfileWidgetState extends State<UserProfileWidget> {
  late UserProfileModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => UserProfileModel());
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
                                Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment: MainAxisAlignment.start,
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
                                FlutterFlowIconButton(
                                  borderRadius: 8,
                                  buttonSize: 40,
                                  fillColor: Colors.transparent,
                                  icon: Icon(
                                    Icons.edit_rounded,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 24,
                                  ),
                                  onPressed: () {
                                    print('IconButton pressed ...');
                                  },
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
                padding: EdgeInsetsDirectional.fromSTEB(24, 32, 24, 32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: AlignmentDirectional(0, 0),
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(9999),
                            shape: BoxShape.rectangle,
                            border: Border.all(
                              color: FlutterFlowTheme.of(context).primary,
                              width: 3,
                            ),
                          ),
                          child: Padding(
                            padding: EdgeInsets.all(4),
                            child: Container(
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(9999),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: FlutterFlowTheme.of(
                                      context,
                                    ).secondaryBackground,
                                    borderRadius: BorderRadius.circular(9999),
                                    shape: BoxShape.rectangle,
                                  ),
                                  child: CachedNetworkImage(
                                    fadeInDuration: Duration(milliseconds: 0),
                                    fadeOutDuration: Duration(milliseconds: 0),
                                    imageUrl:
                                        'https://dimg.dreamflow.cloud/v1/image/professional%20profile%20portrait%20of%20a%20university%20administrator',
                                    fit: BoxFit.cover,
                                    alignment: Alignment(0, 0),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Align(
                          alignment: AlignmentDirectional(1, 1),
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: FlutterFlowTheme.of(context).success,
                              borderRadius: BorderRadius.circular(9999),
                              shape: BoxShape.rectangle,
                              border: Border.all(
                                color: FlutterFlowTheme.of(
                                  context,
                                ).secondaryBackground,
                                width: 3,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Administrator Utama',
                          style: FlutterFlowTheme.of(context).headlineSmall
                              .override(
                                font: GoogleFonts.figtree(
                                  fontWeight: FontWeight.w900,
                                  fontStyle: FlutterFlowTheme.of(
                                    context,
                                  ).headlineSmall.fontStyle,
                                ),
                                color: FlutterFlowTheme.of(context).primaryText,
                                letterSpacing: 0.0,
                                fontWeight: FontWeight.w900,
                                fontStyle: FlutterFlowTheme.of(
                                  context,
                                ).headlineSmall.fontStyle,
                                lineHeight: 1.3,
                              ),
                        ),
                        Text(
                          'NIP. 19850312 201012 1 002',
                          style: FlutterFlowTheme.of(context).bodyMedium
                              .override(
                                font: GoogleFonts.figtree(
                                  fontWeight: FlutterFlowTheme.of(
                                    context,
                                  ).bodyMedium.fontWeight,
                                  fontStyle: FlutterFlowTheme.of(
                                    context,
                                  ).bodyMedium.fontStyle,
                                ),
                                color: FlutterFlowTheme.of(
                                  context,
                                ).secondaryText,
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
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(0, 4, 0, 0),
                          child: Container(
                            child: Container(
                              decoration: BoxDecoration(
                                color: FlutterFlowTheme.of(
                                  context,
                                ).primaryContainer,
                                borderRadius: BorderRadius.circular(9999),
                                shape: BoxShape.rectangle,
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                  16,
                                  4,
                                  16,
                                  4,
                                ),
                                child: Container(
                                  child: Text(
                                    'Super Admin',
                                    style: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FontWeight.bold,
                                            fontStyle: FlutterFlowTheme.of(
                                              context,
                                            ).labelSmall.fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(
                                            context,
                                          ).onPrimaryContainer,
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.bold,
                                          fontStyle: FlutterFlowTheme.of(
                                            context,
                                          ).labelSmall.fontStyle,
                                          lineHeight: 1.2,
                                        ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ].divide(SizedBox(height: 4)),
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
                      'Informasi Akun',
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
                    Container(
                      decoration: BoxDecoration(
                        color: FlutterFlowTheme.of(context).secondaryBackground,
                        borderRadius: BorderRadius.circular(24),
                        shape: BoxShape.rectangle,
                        border: Border.all(
                          color: FlutterFlowTheme.of(context).alternate,
                          width: 1,
                        ),
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Container(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              wrapWithModel(
                                model: _model.profileInfoRowModel1,
                                updateCallback: () => safeSetState(() {}),
                                child: ProfileInfoRowWidget(
                                  icon: Icon(
                                    Icons.email_rounded,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 20,
                                  ),
                                  label: 'Email Instansi',
                                  value: 'admin.utama@pnj.ac.id',
                                ),
                              ),
                              wrapWithModel(
                                model: _model.profileInfoRowModel2,
                                updateCallback: () => safeSetState(() {}),
                                child: ProfileInfoRowWidget(
                                  icon: Icon(
                                    Icons.business_rounded,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 20,
                                  ),
                                  label: 'Unit Kerja',
                                  value: 'Bagian Administrasi Akademik',
                                ),
                              ),
                              wrapWithModel(
                                model: _model.profileInfoRowModel3,
                                updateCallback: () => safeSetState(() {}),
                                child: ProfileInfoRowWidget(
                                  icon: Icon(
                                    Icons.phone_rounded,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 20,
                                  ),
                                  label: 'Nomor Telepon',
                                  value: '+62 812-3456-7890',
                                ),
                              ),
                              wrapWithModel(
                                model: _model.profileInfoRowModel4,
                                updateCallback: () => safeSetState(() {}),
                                child: ProfileInfoRowWidget(
                                  icon: Icon(
                                    Icons.location_on_rounded,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 20,
                                  ),
                                  label: 'Lokasi Kantor',
                                  value: 'Gedung Direktorat, Lt. 2',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
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
                      'Pengaturan',
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
                      model: _model.settingsTileModel1,
                      updateCallback: () => safeSetState(() {}),
                      child: SettingsTileWidget(
                        icon: Icon(
                          Icons.lock_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 20,
                        ),
                        subtitle: 'Ganti kata sandi & otentikasi',
                        title: 'Keamanan',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.settingsTileModel2,
                      updateCallback: () => safeSetState(() {}),
                      child: SettingsTileWidget(
                        icon: Icon(
                          Icons.notifications_active_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 20,
                        ),
                        subtitle: 'Atur pemberitahuan pengajuan',
                        title: 'Notifikasi',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.settingsTileModel3,
                      updateCallback: () => safeSetState(() {}),
                      child: SettingsTileWidget(
                        icon: Icon(
                          Icons.language_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 20,
                        ),
                        subtitle: 'Indonesia (Default)',
                        title: 'Bahasa',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.settingsTileModel4,
                      updateCallback: () => safeSetState(() {}),
                      child: SettingsTileWidget(
                        icon: Icon(
                          Icons.dark_mode_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 20,
                        ),
                        subtitle: 'Mode Terang',
                        title: 'Tampilan',
                      ),
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
                    wrapWithModel(
                      model: _model.buttonModel,
                      updateCallback: () => safeSetState(() {}),
                      child: ButtonWidget(
                        content: 'Keluar Akun',
                        icon: Icon(
                          Icons.logout_rounded,
                          color: FlutterFlowTheme.of(context).onError,
                          size: 16,
                        ),
                        iconPresent: true,
                        iconEndPresent: false,
                        variant: 'destructive',
                        size: 'large',
                        fullWidth: true,
                        loading: false,
                        disabled: false,
                      ),
                    ),
                  ].divide(SizedBox(height: 16)),
                ),
              ),
              Container(
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(24, 32, 24, 48),
                  child: Container(
                    child: Container(
                      alignment: AlignmentDirectional(0, 0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                'SIGAP',
                                style: FlutterFlowTheme.of(context).labelLarge
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w900,
                                        fontStyle: FlutterFlowTheme.of(
                                          context,
                                        ).labelLarge.fontStyle,
                                      ),
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).onBackground,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w900,
                                      fontStyle: FlutterFlowTheme.of(
                                        context,
                                      ).labelLarge.fontStyle,
                                      lineHeight: 1.3,
                                    ),
                              ),
                              Text(
                                'PNJ',
                                style: FlutterFlowTheme.of(context).labelLarge
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w900,
                                        fontStyle: FlutterFlowTheme.of(
                                          context,
                                        ).labelLarge.fontStyle,
                                      ),
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).primaryText,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w900,
                                      fontStyle: FlutterFlowTheme.of(
                                        context,
                                      ).labelLarge.fontStyle,
                                      lineHeight: 1.3,
                                    ),
                              ),
                            ].divide(SizedBox(width: 4)),
                          ),
                          Text(
                            'Versi 1.0.4 • Build 2024',
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
