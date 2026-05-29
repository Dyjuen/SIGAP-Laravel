import '/components/button/button_widget.dart';
import '/components/faq_item/faq_item_widget.dart';
import '/components/feature_card/feature_card_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_palette/material_palette.dart';
import 'package:provider/provider.dart';

import '../../widget/landing_page_model.dart';
export '../../widget/landing_page_model.dart';

class LandingPageWidget extends StatefulWidget {
  const LandingPageWidget({super.key});

  static String routeName = 'LandingPage';
  static String routePath = '/landingPage';

  @override
  State<LandingPageWidget> createState() => _LandingPageWidgetState();
}

class _LandingPageWidgetState extends State<LandingPageWidget> {
  late LandingPageModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LandingPageModel());
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
            LayoutBuilder(
              builder: (context, constraints) {
                return RadialTurbulenceGradientShaderFill(
                  width: constraints.maxWidth.isFinite
                      ? constraints.maxWidth
                      : 200.0,
                  height: constraints.maxHeight.isFinite
                      ? constraints.maxHeight
                      : 200.0,
                  params: ShaderParams(
                    values: {
                      'gradientCenterX': 0.5,
                      'gradientCenterY': 0.3,
                      'gradientScale': 2.03,
                      'gradientOffset': -0.02,
                      'noiseIntensity': 0.51,
                      'ditherStrength': 0,
                      'ditherScale': 1,
                      'animSpeed': 0.75,
                      'octaves': 3.02,
                      'baseFrequency': 1.94,
                      'noiseScale': 3.9,
                      'colorCount': 3,
                      'softness': 1,
                      'exposure': 1,
                      'contrast': 1,
                      'bumpStrength': 1.68,
                      'lightDirX': 0.17,
                      'lightDirY': 0.5,
                      'lightDirZ': 1,
                      'lightIntensity': 1.62,
                      'ambient': 0.67,
                      'specular': 0.06,
                      'shininess': 35.72,
                      'metallic': 0,
                      'roughness': 1,
                      'edgeFade': 2.3,
                      'edgeFadeMode': 1,
                    },
                    colors: {
                      'color0': Color(0x6600BCD4),
                      'color1': FlutterFlowTheme.of(
                        context,
                      ).secondaryBackground,
                      'color2': FlutterFlowTheme.of(context).primaryBackground,
                      'color3': Color(0x00808080),
                      'color4': Color(0x00808080),
                      'color5': Color(0x00808080),
                      'color6': Color(0x00808080),
                      'color7': Color(0x00808080),
                      'color8': Color(0x00808080),
                      'color9': Color(0x00808080),
                    },
                  ),
                  animationMode: ShaderAnimationMode.continuous,
                  cache: false,
                );
              },
            ),
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
                      filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                      child: Container(
                        decoration: BoxDecoration(
                          color: FlutterFlowTheme.of(context).surface60,
                          shape: BoxShape.rectangle,
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                24,
                                16,
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
                                                ).onSurface,
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w900,
                                                fontStyle: FlutterFlowTheme.of(
                                                  context,
                                                ).titleLarge.fontStyle,
                                                lineHeight: 1.3,
                                              ),
                                        ),
                                        Text(
                                          'PNJ',
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
                                      ].divide(SizedBox(width: 4)),
                                    ),
                                    wrapWithModel(
                                      model: _model.buttonModel1,
                                      updateCallback: () => safeSetState(() {}),
                                      child: ButtonWidget(
                                        content: 'Masuk',
                                        iconPresent: false,
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
                            ),
                            Container(
                              height: 1,
                              decoration: BoxDecoration(
                                color: Colors.transparent,
                                shape: BoxShape.rectangle,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 40, 24, 40),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: FlutterFlowTheme.of(context).primary10,
                            borderRadius: BorderRadius.circular(9999),
                            shape: BoxShape.rectangle,
                            border: Border.all(
                              color: FlutterFlowTheme.of(context).primary20,
                              width: 1,
                            ),
                          ),
                          child: Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                              16,
                              6,
                              16,
                              6,
                            ),
                            child: Container(
                              child: Text(
                                'v2.0 Is Now Live',
                                style: FlutterFlowTheme.of(context).labelSmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.bold,
                                        fontStyle: FlutterFlowTheme.of(
                                          context,
                                        ).labelSmall.fontStyle,
                                      ),
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).onSurface,
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
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              'Administrasi Kampus Jadi Lebih Cepat',
                              textAlign: TextAlign.center,
                              style: FlutterFlowTheme.of(context).headlineLarge
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FontWeight.w900,
                                      fontStyle: FlutterFlowTheme.of(
                                        context,
                                      ).headlineLarge.fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(
                                      context,
                                    ).primaryText,
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.w900,
                                    fontStyle: FlutterFlowTheme.of(
                                      context,
                                    ).headlineLarge.fontStyle,
                                    lineHeight: 1.2,
                                  ),
                            ),
                            Text(
                              'Sistem Informasi Gerbang Administrasi Pengajuan untuk civitas akademika Politeknik Negeri Jakarta.',
                              textAlign: TextAlign.center,
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
                          ].divide(SizedBox(height: 16)),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            wrapWithModel(
                              model: _model.buttonModel2,
                              updateCallback: () => safeSetState(() {}),
                              child: ButtonWidget(
                                content: 'Mulai Sekarang',
                                iconPresent: false,
                                iconEndPresent: false,
                                variant: 'primary',
                                size: 'large',
                                fullWidth: false,
                                loading: false,
                                disabled: false,
                              ),
                            ),
                            wrapWithModel(
                              model: _model.buttonModel3,
                              updateCallback: () => safeSetState(() {}),
                              child: ButtonWidget(
                                content: 'Pelajari',
                                iconPresent: false,
                                iconEndPresent: false,
                                variant: 'outline',
                                size: 'large',
                                fullWidth: false,
                                loading: false,
                                disabled: false,
                              ),
                            ),
                          ].divide(SizedBox(width: 16)),
                        ),
                      ].divide(SizedBox(height: 24)),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 0, 24, 0),
                    child: Container(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24),
                            shape: BoxShape.rectangle,
                            border: Border.all(
                              color: Colors.transparent,
                              width: 4,
                            ),
                          ),
                          child: Stack(
                            alignment: AlignmentDirectional(-1, -1),
                            children: [
                              CachedNetworkImage(
                                fadeInDuration: Duration(milliseconds: 0),
                                fadeOutDuration: Duration(milliseconds: 0),
                                imageUrl:
                                    'https://dimg.dreamflow.cloud/v1/image/modern%20clean%20dashboard%20interface%20with%20cyan%20charts%20and%20data%20tables',
                                height: 240,
                                fit: BoxFit.cover,
                                alignment: Alignment(0, 0),
                              ),
                              Container(
                                height: 240,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      FlutterFlowTheme.of(
                                        context,
                                      ).primaryBackground,
                                      Colors.transparent,
                                    ],
                                    stops: [0, 1],
                                    begin: AlignmentDirectional(0, 1),
                                    end: AlignmentDirectional(0, -1),
                                  ),
                                  shape: BoxShape.rectangle,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 48, 24, 48),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              'FITUR UNGGULAN',
                              style: FlutterFlowTheme.of(context).labelSmall
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
                            Text(
                              'Solusi Digital Terintegrasi',
                              style: FlutterFlowTheme.of(context).titleLarge
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FontWeight.w900,
                                      fontStyle: FlutterFlowTheme.of(
                                        context,
                                      ).titleLarge.fontStyle,
                                    ),
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.w900,
                                    fontStyle: FlutterFlowTheme.of(
                                      context,
                                    ).titleLarge.fontStyle,
                                    lineHeight: 1.3,
                                  ),
                            ),
                          ].divide(SizedBox(height: 4)),
                        ),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            wrapWithModel(
                              model: _model.featureCardModel1,
                              updateCallback: () => safeSetState(() {}),
                              child: FeatureCardWidget(
                                desc:
                                    'Proses KAK dan RAB kini hanya dalam hitungan menit secara digital.',
                                icon: Icon(
                                  Icons.speed_rounded,
                                  color: FlutterFlowTheme.of(context).primary,
                                  size: 24,
                                ),
                                title: 'Pengajuan Cepat',
                              ),
                            ),
                            wrapWithModel(
                              model: _model.featureCardModel2,
                              updateCallback: () => safeSetState(() {}),
                              child: FeatureCardWidget(
                                desc:
                                    'Pantau status usulan Anda mulai dari draf hingga pencairan dana.',
                                icon: Icon(
                                  Icons.track_changes_rounded,
                                  color: FlutterFlowTheme.of(context).primary,
                                  size: 24,
                                ),
                                title: 'Pelacakan Real-time',
                              ),
                            ),
                            wrapWithModel(
                              model: _model.featureCardModel3,
                              updateCallback: () => safeSetState(() {}),
                              child: FeatureCardWidget(
                                desc:
                                    'Semua dokumen LPJ tersimpan aman dan mudah diakses kapan saja.',
                                icon: Icon(
                                  Icons.security_rounded,
                                  color: FlutterFlowTheme.of(context).primary,
                                  size: 24,
                                ),
                                title: 'Arsip Terpusat',
                              ),
                            ),
                          ].divide(SizedBox(height: 16)),
                        ),
                      ].divide(SizedBox(height: 32)),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 24, 24, 48),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Pertanyaan Sering Diajukan',
                          textAlign: TextAlign.center,
                          style: FlutterFlowTheme.of(context).titleLarge
                              .override(
                                font: GoogleFonts.figtree(
                                  fontWeight: FontWeight.w800,
                                  fontStyle: FlutterFlowTheme.of(
                                    context,
                                  ).titleLarge.fontStyle,
                                ),
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
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            wrapWithModel(
                              model: _model.faqItemModel1,
                              updateCallback: () => safeSetState(() {}),
                              child: FaqItemWidget(
                                question: 'Bagaimana cara membuat akun?',
                              ),
                            ),
                            wrapWithModel(
                              model: _model.faqItemModel2,
                              updateCallback: () => safeSetState(() {}),
                              child: FaqItemWidget(
                                question:
                                    'Apakah bisa merevisi KAK yang sudah dikirim?',
                              ),
                            ),
                            wrapWithModel(
                              model: _model.faqItemModel3,
                              updateCallback: () => safeSetState(() {}),
                              child: FaqItemWidget(
                                question: 'Berapa lama proses pencairan dana?',
                              ),
                            ),
                          ],
                        ),
                      ].divide(SizedBox(height: 24)),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).secondaryBackground,
                      shape: BoxShape.rectangle,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Container(
                          height: 1,
                          decoration: BoxDecoration(
                            color: FlutterFlowTheme.of(context).alternate,
                            shape: BoxShape.rectangle,
                          ),
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                            24,
                            40,
                            24,
                            40,
                          ),
                          child: Container(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
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
                                            ).onSurface,
                                            letterSpacing: 0.0,
                                            fontWeight: FontWeight.w900,
                                            fontStyle: FlutterFlowTheme.of(
                                              context,
                                            ).titleMedium.fontStyle,
                                            lineHeight: 1.35,
                                          ),
                                    ),
                                    Text(
                                      'PNJ',
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
                                  ].divide(SizedBox(width: 4)),
                                ),
                                Text(
                                  'Â© 2024 Politeknik Negeri Jakarta\nSistem Informasi Gerbang Administrasi Pengajuan',
                                  textAlign: TextAlign.center,
                                  style: FlutterFlowTheme.of(context).bodySmall
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
                                Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.facebook_rounded,
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).secondaryText,
                                      size: 20,
                                    ),
                                    Icon(
                                      Icons.language_rounded,
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).secondaryText,
                                      size: 20,
                                    ),
                                    Icon(
                                      Icons.email_rounded,
                                      color: FlutterFlowTheme.of(
                                        context,
                                      ).secondaryText,
                                      size: 20,
                                    ),
                                  ].divide(SizedBox(width: 16)),
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
            Align(
              alignment: AlignmentDirectional(1, 1),
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Container(
                  alignment: AlignmentDirectional(1, 1),
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).primary,
                      borderRadius: BorderRadius.circular(9999),
                      shape: BoxShape.rectangle,
                    ),
                    alignment: AlignmentDirectional(0, 0),
                    child: Icon(
                      Icons.chat_bubble_rounded,
                      color: FlutterFlowTheme.of(context).onSurface,
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
