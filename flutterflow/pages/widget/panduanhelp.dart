import '/components/button/button_widget.dart';
import '/components/faq_accordion/faq_accordion_widget.dart';
import '/components/manual_download_card/manual_download_card_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_palette/material_palette.dart';
import 'package:provider/provider.dart';

import '../../widget/panduan_help_model.dart';
export '../../widget/panduan_help_model.dart';

class PanduanHelpWidget extends StatefulWidget {
  const PanduanHelpWidget({super.key});

  static String routeName = 'PanduanHelp';
  static String routePath = '/panduanHelp';

  @override
  State<PanduanHelpWidget> createState() => _PanduanHelpWidgetState();
}

class _PanduanHelpWidgetState extends State<PanduanHelpWidget> {
  late PanduanHelpModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PanduanHelpModel());
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
                                      'Pusat Bantuan & Panduan',
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
                child: Container(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(32),
                    child: Container(
                      height: 160,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(32),
                        shape: BoxShape.rectangle,
                      ),
                      child: Stack(
                        alignment: AlignmentDirectional(-1, -1),
                        children: [
                          LayoutBuilder(
                            builder: (context, constraints) {
                              return FbmGradientShaderFill(
                                width: constraints.maxWidth.isFinite
                                    ? constraints.maxWidth
                                    : 200.0,
                                height: 200,
                                params: ShaderParams(
                                  values: {
                                    'gradientAngle': 135,
                                    'gradientScale': 0.64,
                                    'gradientOffset': -0.14,
                                    'noiseIntensity': 0.69,
                                    'ditherStrength': 0,
                                    'ditherScale': 1,
                                    'animSpeed': 0.92,
                                    'octaves': 3.06,
                                    'lacunarity': 1.71,
                                    'persistence': 0.15,
                                    'noiseScale': 1.56,
                                    'colorCount': 3,
                                    'softness': 1,
                                    'exposure': 1,
                                    'contrast': 1,
                                    'bumpStrength': 0.58,
                                    'lightDirX': 0.5,
                                    'lightDirY': 0.6,
                                    'lightDirZ': 0.9,
                                    'lightIntensity': 1.08,
                                    'ambient': 0.14,
                                    'specular': 0.07,
                                    'shininess': 41.67,
                                    'metallic': 0.02,
                                    'roughness': 0.78,
                                    'edgeFade': 0,
                                    'edgeFadeMode': 1,
                                  },
                                  colors: {
                                    'color0': FlutterFlowTheme.of(
                                      context,
                                    ).primary,
                                    'color1': FlutterFlowTheme.of(
                                      context,
                                    ).primaryContainer,
                                    'color2': FlutterFlowTheme.of(
                                      context,
                                    ).secondaryBackground,
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
                          Container(
                            child: Padding(
                              padding: EdgeInsets.all(32),
                              child: Container(
                                child: Container(
                                  alignment: AlignmentDirectional(0, 0),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Butuh Bantuan?',
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
                                              ).onPrimaryContainer,
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w900,
                                              fontStyle: FlutterFlowTheme.of(
                                                context,
                                              ).headlineMedium.fontStyle,
                                              lineHeight: 1.25,
                                            ),
                                      ),
                                      Text(
                                        'Cari panduan penggunaan sistem di sini',
                                        style: FlutterFlowTheme.of(context)
                                            .bodyMedium
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
                                              ).onPrimaryContainer80,
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
                ),
              ),
              Container(
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(24, 0, 24, 16),
                  child: Container(
                    child: wrapWithModel(
                      model: _model.textFieldModel,
                      updateCallback: () => safeSetState(() {}),
                      child: TextFieldWidget(
                        label: '',
                        labelPresent: false,
                        helper: '',
                        helperPresent: false,
                        hint: 'Cari pertanyaan atau dokumen...',
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
                      'Unduh Panduan (PDF)',
                      style: FlutterFlowTheme.of(context).titleMedium.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FontWeight.w800,
                          fontStyle: FlutterFlowTheme.of(
                            context,
                          ).titleMedium.fontStyle,
                        ),
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w800,
                        fontStyle: FlutterFlowTheme.of(
                          context,
                        ).titleMedium.fontStyle,
                        lineHeight: 1.35,
                      ),
                    ),
                    wrapWithModel(
                      model: _model.manualDownloadCardModel1,
                      updateCallback: () => safeSetState(() {}),
                      child: ManualDownloadCardWidget(
                        description:
                            'Panduan lengkap pembuatan KAK & RAB • 4.2 MB',
                        icon: Icon(
                          Icons.description_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 28,
                        ),
                        title: 'User Manual Pengusul',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.manualDownloadCardModel2,
                      updateCallback: () => safeSetState(() {}),
                      child: ManualDownloadCardWidget(
                        description: 'Prosedur pengecekan dokumen • 2.8 MB',
                        icon: Icon(
                          Icons.rule_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 28,
                        ),
                        title: 'Alur Verifikasi Admin',
                      ),
                    ),
                    wrapWithModel(
                      model: _model.manualDownloadCardModel3,
                      updateCallback: () => safeSetState(() {}),
                      child: ManualDownloadCardWidget(
                        description:
                            'Cara unggah laporan pertanggungjawaban • 3.5 MB',
                        icon: Icon(
                          Icons.assignment_turned_in_rounded,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 28,
                        ),
                        title: 'Panduan LPJ Digital',
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
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Pertanyaan Sering Diajukan',
                          style: FlutterFlowTheme.of(context).titleMedium
                              .override(
                                font: GoogleFonts.figtree(
                                  fontWeight: FontWeight.w800,
                                  fontStyle: FlutterFlowTheme.of(
                                    context,
                                  ).titleMedium.fontStyle,
                                ),
                                letterSpacing: 0.0,
                                fontWeight: FontWeight.w800,
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
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        wrapWithModel(
                          model: _model.faqAccordionModel1,
                          updateCallback: () => safeSetState(() {}),
                          child: FaqAccordionWidget(
                            answer:
                                'Anda dapat melakukan revisi jika status usulan dikembalikan oleh verifikator. Klik tombol \'Revisi\' pada detail kegiatan Anda.',
                            question:
                                'Bagaimana cara merubah RAB yang sudah dikirim?',
                            isOpen: true,
                          ),
                        ),
                        wrapWithModel(
                          model: _model.faqAccordionModel2,
                          updateCallback: () => safeSetState(() {}),
                          child: FaqAccordionWidget(
                            answer:
                                'Proses verifikasi biasanya memakan waktu 2-3 hari kerja tergantung pada antrean dokumen di tingkat jurusan.',
                            question: 'Berapa lama proses verifikasi KAK?',
                            isOpen: false,
                          ),
                        ),
                        wrapWithModel(
                          model: _model.faqAccordionModel3,
                          updateCallback: () => safeSetState(() {}),
                          child: FaqAccordionWidget(
                            answer:
                                'Pastikan ukuran file tidak melebihi 5MB dan dokumen tidak dalam keadaan terkunci (password protected).',
                            question: 'Mengapa file PDF saya gagal diunggah?',
                            isOpen: false,
                          ),
                        ),
                        wrapWithModel(
                          model: _model.faqAccordionModel4,
                          updateCallback: () => safeSetState(() {}),
                          child: FaqAccordionWidget(
                            answer:
                                'Silakan hubungi admin IT di gedung Direktorat lantai 2 atau gunakan fitur \'Lupa Password\' di halaman login.',
                            question: 'Lupa password akun SIGAP?',
                            isOpen: false,
                          ),
                        ),
                      ],
                    ),
                  ].divide(SizedBox(height: 16)),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(24),
                child: Container(
                  child: Container(
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).primary,
                      borderRadius: BorderRadius.circular(32),
                      shape: BoxShape.rectangle,
                    ),
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: Container(
                        child: Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              flex: 1,
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Masih Bingung?',
                                    style: FlutterFlowTheme.of(context)
                                        .titleLarge
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FontWeight.bold,
                                            fontStyle: FlutterFlowTheme.of(
                                              context,
                                            ).titleLarge.fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(
                                            context,
                                          ).onSurface,
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.bold,
                                          fontStyle: FlutterFlowTheme.of(
                                            context,
                                          ).titleLarge.fontStyle,
                                          lineHeight: 1.3,
                                        ),
                                  ),
                                  Text(
                                    'Hubungi tim teknis kami melalui WhatsApp',
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
                                          ).onSurface90,
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
                            ),
                            wrapWithModel(
                              model: _model.buttonModel,
                              updateCallback: () => safeSetState(() {}),
                              child: ButtonWidget(
                                content: 'Chat Admin',
                                icon: Icon(
                                  Icons.message_rounded,
                                  color: FlutterFlowTheme.of(
                                    context,
                                  ).onSecondary,
                                  size: 16,
                                ),
                                iconPresent: true,
                                iconEndPresent: false,
                                variant: 'secondary',
                                size: 'medium',
                                fullWidth: false,
                                loading: false,
                                disabled: false,
                              ),
                            ),
                          ].divide(SizedBox(width: 24)),
                        ),
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
                            'Unit TIK Politeknik Negeri Jakarta',
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
