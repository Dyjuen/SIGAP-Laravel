import '/components/button/button_widget.dart';
import '/components/checkbox/checkbox_widget.dart';
import '/components/floating_circle/floating_circle_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../widget/login_model.dart';
export '../../widget/login_model.dart';

class LoginWidget extends StatefulWidget {
  const LoginWidget({super.key});

  static String routeName = 'Login';
  static String routePath = '/login';

  @override
  State<LoginWidget> createState() => _LoginWidgetState();
}

class _LoginWidgetState extends State<LoginWidget> {
  late LoginModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LoginModel());
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
            Stack(
              alignment: AlignmentDirectional(-1, -1),
              children: [
                Align(
                  alignment: AlignmentDirectional(-1.2, -0.8),
                  child: wrapWithModel(
                    model: _model.floatingCircleModel1,
                    updateCallback: () => safeSetState(() {}),
                    child: FloatingCircleWidget(
                      color: FlutterFlowTheme.of(context).primary,
                      size: 300.0,
                    ),
                  ),
                ),
                Align(
                  alignment: AlignmentDirectional(1.3, -0.4),
                  child: wrapWithModel(
                    model: _model.floatingCircleModel2,
                    updateCallback: () => safeSetState(() {}),
                    child: FloatingCircleWidget(
                      color: FlutterFlowTheme.of(context).tertiary,
                      size: 250.0,
                    ),
                  ),
                ),
                Align(
                  alignment: AlignmentDirectional(-0.5, 0.9),
                  child: wrapWithModel(
                    model: _model.floatingCircleModel3,
                    updateCallback: () => safeSetState(() {}),
                    child: FloatingCircleWidget(
                      color: FlutterFlowTheme.of(context).info,
                      size: 200.0,
                    ),
                  ),
                ),
                Align(
                  alignment: AlignmentDirectional(0.8, 1.1),
                  child: wrapWithModel(
                    model: _model.floatingCircleModel4,
                    updateCallback: () => safeSetState(() {}),
                    child: FloatingCircleWidget(
                      color: FlutterFlowTheme.of(context).primary,
                      size: 180.0,
                    ),
                  ),
                ),
              ],
            ),
            SingleChildScrollView(
              primary: false,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: EdgeInsets.all(32),
                    child: Container(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(
                                    context,
                                  ).secondaryBackground,
                                  borderRadius: BorderRadius.circular(32),
                                  shape: BoxShape.rectangle,
                                ),
                                alignment: AlignmentDirectional(0, 0),
                                child: Icon(
                                  Icons.security_rounded,
                                  color: FlutterFlowTheme.of(context).onSurface,
                                  size: 40,
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.max,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        'SIGAP',
                                        style: FlutterFlowTheme.of(context)
                                            .headlineMedium
                                            .override(
                                              font: GoogleFonts.figtree(
                                                fontWeight: FontWeight.w900,
                                                fontStyle: FlutterFlowTheme.of(
                                                  context,
                                                ).headlineMedium.fontStyle,
                                              ),
                                              color: FlutterFlowTheme.of(
                                                context,
                                              ).onBackground,
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w900,
                                              fontStyle: FlutterFlowTheme.of(
                                                context,
                                              ).headlineMedium.fontStyle,
                                              lineHeight: 1.25,
                                            ),
                                      ),
                                      Text(
                                        'PNJ',
                                        style: FlutterFlowTheme.of(context)
                                            .headlineMedium
                                            .override(
                                              font: GoogleFonts.figtree(
                                                fontWeight: FontWeight.w900,
                                                fontStyle: FlutterFlowTheme.of(
                                                  context,
                                                ).headlineMedium.fontStyle,
                                              ),
                                              color: FlutterFlowTheme.of(
                                                context,
                                              ).primaryText,
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w900,
                                              fontStyle: FlutterFlowTheme.of(
                                                context,
                                              ).headlineMedium.fontStyle,
                                              lineHeight: 1.25,
                                            ),
                                      ),
                                    ].divide(SizedBox(width: 4)),
                                  ),
                                  Text(
                                    'Gerbang Administrasi Terpadu',
                                    textAlign: TextAlign.center,
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
                                ].divide(SizedBox(height: 4)),
                              ),
                            ].divide(SizedBox(height: 16)),
                          ),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(24),
                            child: BackdropFilter(
                              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(context).surface70,
                                  borderRadius: BorderRadius.circular(24),
                                  shape: BoxShape.rectangle,
                                  border: Border.all(
                                    color: Colors.transparent,
                                    width: 1,
                                  ),
                                ),
                                child: Padding(
                                  padding: EdgeInsets.all(48),
                                  child: Container(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.stretch,
                                      children: [
                                        Text(
                                          'Masuk ke Akun',
                                          textAlign: TextAlign.center,
                                          style: FlutterFlowTheme.of(context)
                                              .titleLarge
                                              .override(
                                                font: GoogleFonts.figtree(
                                                  fontWeight: FontWeight.w800,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).titleLarge.fontStyle,
                                                ),
                                                color: FlutterFlowTheme.of(
                                                  context,
                                                ).primaryText,
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w800,
                                                fontStyle: FlutterFlowTheme.of(
                                                  context,
                                                ).titleLarge.fontStyle,
                                                lineHeight: 1.3,
                                              ),
                                        ),
                                        Column(
                                          mainAxisSize: MainAxisSize.min,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.stretch,
                                          children: [
                                            Column(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'Email atau NIP',
                                                  style:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).labelMedium.override(
                                                        font: GoogleFonts.figtree(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                    context,
                                                                  )
                                                                  .labelMedium
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                    context,
                                                                  )
                                                                  .labelMedium
                                                                  .fontStyle,
                                                        ),
                                                        color:
                                                            FlutterFlowTheme.of(
                                                              context,
                                                            ).secondaryText,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .labelMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .labelMedium
                                                                .fontStyle,
                                                        lineHeight: 1.3,
                                                      ),
                                                ),
                                                wrapWithModel(
                                                  model: _model.textFieldModel1,
                                                  updateCallback: () =>
                                                      safeSetState(() {}),
                                                  child: TextFieldWidget(
                                                    label: '',
                                                    labelPresent: false,
                                                    helper: '',
                                                    helperPresent: false,
                                                    hint: 'Masukkan email/NIP',
                                                    value: '',
                                                    onChange: '',
                                                    onSubmit: '',
                                                    leadingIcon: Icon(
                                                      Icons
                                                          .person_outline_rounded,
                                                    ),
                                                    leadingIconPresent: true,
                                                    trailingIconPresent: false,
                                                    variant: 'outlined',
                                                    error: false,
                                                  ),
                                                ),
                                              ].divide(SizedBox(height: 4)),
                                            ),
                                            Column(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'Kata Sandi',
                                                  style:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).labelMedium.override(
                                                        font: GoogleFonts.figtree(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                    context,
                                                                  )
                                                                  .labelMedium
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                    context,
                                                                  )
                                                                  .labelMedium
                                                                  .fontStyle,
                                                        ),
                                                        color:
                                                            FlutterFlowTheme.of(
                                                              context,
                                                            ).secondaryText,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .labelMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .labelMedium
                                                                .fontStyle,
                                                        lineHeight: 1.3,
                                                      ),
                                                ),
                                                wrapWithModel(
                                                  model: _model.textFieldModel2,
                                                  updateCallback: () =>
                                                      safeSetState(() {}),
                                                  child: TextFieldWidget(
                                                    label: '',
                                                    labelPresent: false,
                                                    helper: '',
                                                    helperPresent: false,
                                                    hint:
                                                        'â¢â¢â¢â¢â¢â¢â¢â¢',
                                                    value: '',
                                                    onChange: '',
                                                    onSubmit: '',
                                                    leadingIcon: Icon(
                                                      Icons
                                                          .lock_outline_rounded,
                                                    ),
                                                    leadingIconPresent: true,
                                                    trailingIcon: Icon(
                                                      Icons
                                                          .visibility_off_rounded,
                                                    ),
                                                    trailingIconPresent: true,
                                                    variant: 'outlined',
                                                    error: false,
                                                  ),
                                                ),
                                              ].divide(SizedBox(height: 4)),
                                            ),
                                          ].divide(SizedBox(height: 16)),
                                        ),
                                        Row(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.center,
                                          children: [
                                            wrapWithModel(
                                              model: _model.checkboxModel,
                                              updateCallback: () =>
                                                  safeSetState(() {}),
                                              child: CheckboxWidget(
                                                label: 'Ingat saya',
                                                subtitle:
                                                    'Receive weekly updates',
                                                color: FlutterFlowTheme.of(
                                                  context,
                                                ).primary,
                                                isChecked: true,
                                                hasSubtitle: false,
                                                disabled: false,
                                              ),
                                            ),
                                            Text(
                                              'Lupa sandi?',
                                              style:
                                                  FlutterFlowTheme.of(
                                                    context,
                                                  ).labelMedium.override(
                                                    font: GoogleFonts.figtree(
                                                      fontWeight:
                                                          FontWeight.w600,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                context,
                                                              )
                                                              .labelMedium
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                      context,
                                                    ).onSurface,
                                                    letterSpacing: 0.0,
                                                    fontWeight: FontWeight.w600,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                          context,
                                                        ).labelMedium.fontStyle,
                                                    lineHeight: 1.3,
                                                  ),
                                            ),
                                          ],
                                        ),
                                        wrapWithModel(
                                          model: _model.buttonModel1,
                                          updateCallback: () =>
                                              safeSetState(() {}),
                                          child: ButtonWidget(
                                            content: 'Masuk Sekarang',
                                            iconPresent: false,
                                            iconEndPresent: false,
                                            variant: 'primary',
                                            size: 'large',
                                            fullWidth: true,
                                            loading: false,
                                            disabled: false,
                                          ),
                                        ),
                                        Row(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.center,
                                          children: [
                                            Expanded(
                                              flex: 1,
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
                                            Text(
                                              'ATAU',
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
                                                    ).onSurface,
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
                                            Expanded(
                                              flex: 1,
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
                                          ].divide(SizedBox(width: 16)),
                                        ),
                                        wrapWithModel(
                                          model: _model.buttonModel2,
                                          updateCallback: () =>
                                              safeSetState(() {}),
                                          child: ButtonWidget(
                                            content: 'Login SSO PNJ',
                                            icon: Icon(
                                              Icons.login_rounded,
                                              color: FlutterFlowTheme.of(
                                                context,
                                              ).primaryText,
                                              size: 16,
                                            ),
                                            iconPresent: true,
                                            iconEndPresent: false,
                                            variant: 'outline',
                                            size: 'medium',
                                            fullWidth: true,
                                            loading: false,
                                            disabled: false,
                                          ),
                                        ),
                                      ].divide(SizedBox(height: 24)),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Text(
                                    'Belum punya akun?',
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
                                  Text(
                                    'Hubungi Admin',
                                    style: FlutterFlowTheme.of(context)
                                        .bodySmall
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FontWeight.bold,
                                            fontStyle: FlutterFlowTheme.of(
                                              context,
                                            ).bodySmall.fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(
                                            context,
                                          ).onBackground,
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.bold,
                                          fontStyle: FlutterFlowTheme.of(
                                            context,
                                          ).bodySmall.fontStyle,
                                          lineHeight: 1.4,
                                        ),
                                  ),
                                ].divide(SizedBox(width: 4)),
                              ),
                              Container(height: 16),
                              Text(
                                'Â© 2024 Politeknik Negeri Jakarta',
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
                              Text(
                                'Versi 1.0.4',
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
                                      ).onBackground50,
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
                            ].divide(SizedBox(height: 8)),
                          ),
                        ].divide(SizedBox(height: 24)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
