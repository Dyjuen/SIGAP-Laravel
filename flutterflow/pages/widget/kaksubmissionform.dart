import '/components/budget_row/budget_row_widget.dart';
import '/components/button/button_widget.dart';
import '/components/form_section_header/form_section_header_widget.dart';
import '/components/form_step_indicator/form_step_indicator_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../widget/k_a_k_submission_form_model.dart';
export '../../widget/k_a_k_submission_form_model.dart';

class KAKSubmissionFormWidget extends StatefulWidget {
  const KAKSubmissionFormWidget({super.key});

  static String routeName = 'KAKSubmissionForm';
  static String routePath = '/kAKSubmissionForm';

  @override
  State<KAKSubmissionFormWidget> createState() =>
      _KAKSubmissionFormWidgetState();
}

class _KAKSubmissionFormWidgetState extends State<KAKSubmissionFormWidget> {
  late KAKSubmissionFormModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => KAKSubmissionFormModel());
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
        body: Column(
          mainAxisSize: MainAxisSize.max,
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
                        padding: EdgeInsetsDirectional.fromSTEB(24, 24, 24, 16),
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
            Container(
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).secondaryBackground,
                shape: BoxShape.rectangle,
              ),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(16, 24, 16, 24),
                child: Container(
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        flex: 1,
                        child: wrapWithModel(
                          model: _model.formStepIndicatorModel1,
                          updateCallback: () => safeSetState(() {}),
                          child: FormStepIndicatorWidget(
                            label: 'Umum',
                            active: true,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: wrapWithModel(
                          model: _model.formStepIndicatorModel2,
                          updateCallback: () => safeSetState(() {}),
                          child: FormStepIndicatorWidget(
                            label: 'IKU',
                            active: false,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: wrapWithModel(
                          model: _model.formStepIndicatorModel3,
                          updateCallback: () => safeSetState(() {}),
                          child: FormStepIndicatorWidget(
                            label: 'RAB',
                            active: false,
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
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  wrapWithModel(
                                    model: _model.formSectionHeaderModel1,
                                    updateCallback: () => safeSetState(() {}),
                                    child: FormSectionHeaderWidget(
                                      description:
                                          'Informasi dasar mengenai pengajuan kegiatan.',
                                      title: 'Gambaran Umum',
                                    ),
                                  ),
                                  wrapWithModel(
                                    model: _model.textFieldModel1,
                                    updateCallback: () => safeSetState(() {}),
                                    child: TextFieldWidget(
                                      label: 'Nama Kegiatan',
                                      labelPresent: true,
                                      helper: '',
                                      helperPresent: false,
                                      hint: 'Contoh: Workshop AI 2024',
                                      value: '',
                                      onChange: '',
                                      onSubmit: '',
                                      leadingIcon: Icon(
                                        Icons.event_note_rounded,
                                      ),
                                      leadingIconPresent: true,
                                      trailingIconPresent: false,
                                      variant: 'outlined',
                                      error: false,
                                    ),
                                  ),
                                  Container(height: 16),
                                  wrapWithModel(
                                    model: _model.textFieldModel2,
                                    updateCallback: () => safeSetState(() {}),
                                    child: TextFieldWidget(
                                      label: 'Latar Belakang',
                                      labelPresent: true,
                                      helper: '',
                                      helperPresent: false,
                                      hint:
                                          'Jelaskan alasan kegiatan ini dilaksanakan...',
                                      value: '',
                                      onChange: '',
                                      onSubmit: '',
                                      leadingIcon: Icon(
                                        Icons.description_rounded,
                                      ),
                                      leadingIconPresent: true,
                                      trailingIconPresent: false,
                                      variant: 'outlined',
                                      error: false,
                                    ),
                                  ),
                                  Container(height: 16),
                                  Row(
                                    mainAxisSize: MainAxisSize.max,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        flex: 1,
                                        child: wrapWithModel(
                                          model: _model.textFieldModel3,
                                          updateCallback: () =>
                                              safeSetState(() {}),
                                          child: TextFieldWidget(
                                            label: 'Mulai',
                                            labelPresent: true,
                                            helper: '',
                                            helperPresent: false,
                                            hint: 'DD/MM/YYYY',
                                            value: '',
                                            onChange: '',
                                            onSubmit: '',
                                            leadingIcon: Icon(
                                              Icons.calendar_today_rounded,
                                            ),
                                            leadingIconPresent: true,
                                            trailingIconPresent: false,
                                            variant: 'outlined',
                                            error: false,
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 1,
                                        child: wrapWithModel(
                                          model: _model.textFieldModel4,
                                          updateCallback: () =>
                                              safeSetState(() {}),
                                          child: TextFieldWidget(
                                            label: 'Selesai',
                                            labelPresent: true,
                                            helper: '',
                                            helperPresent: false,
                                            hint: 'DD/MM/YYYY',
                                            value: '',
                                            onChange: '',
                                            onSubmit: '',
                                            leadingIconPresent: false,
                                            trailingIconPresent: false,
                                            variant: 'outlined',
                                            error: false,
                                          ),
                                        ),
                                      ),
                                    ].divide(SizedBox(width: 16)),
                                  ),
                                ],
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  wrapWithModel(
                                    model: _model.formSectionHeaderModel2,
                                    updateCallback: () => safeSetState(() {}),
                                    child: FormSectionHeaderWidget(
                                      description:
                                          'Siapa yang akan menerima manfaat dari kegiatan ini?',
                                      title: 'Sasaran & Manfaat',
                                    ),
                                  ),
                                  wrapWithModel(
                                    model: _model.textFieldModel5,
                                    updateCallback: () => safeSetState(() {}),
                                    child: TextFieldWidget(
                                      label: 'Penerima Manfaat',
                                      labelPresent: true,
                                      helper: '',
                                      helperPresent: false,
                                      hint: 'Mahasiswa, Dosen, dsb.',
                                      value: '',
                                      onChange: '',
                                      onSubmit: '',
                                      leadingIcon: Icon(Icons.groups_rounded),
                                      leadingIconPresent: true,
                                      trailingIconPresent: false,
                                      variant: 'outlined',
                                      error: false,
                                    ),
                                  ),
                                  Container(height: 16),
                                  wrapWithModel(
                                    model: _model.textFieldModel6,
                                    updateCallback: () => safeSetState(() {}),
                                    child: TextFieldWidget(
                                      label: 'Target Output',
                                      labelPresent: true,
                                      helper: '',
                                      helperPresent: false,
                                      hint: 'Jumlah sertifikat, dokumen, dsb.',
                                      value: '',
                                      onChange: '',
                                      onSubmit: '',
                                      leadingIcon: Icon(
                                        Icons.checklist_rounded,
                                      ),
                                      leadingIconPresent: true,
                                      trailingIconPresent: false,
                                      variant: 'outlined',
                                      error: false,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                      0,
                                      0,
                                      0,
                                      16,
                                    ),
                                    child: Container(
                                      child: Row(
                                        mainAxisSize: MainAxisSize.max,
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: [
                                          wrapWithModel(
                                            model:
                                                _model.formSectionHeaderModel3,
                                            updateCallback: () =>
                                                safeSetState(() {}),
                                            child: FormSectionHeaderWidget(
                                              description:
                                                  'Estimasi kebutuhan anggaran.',
                                              title: 'Rancangan Biaya',
                                            ),
                                          ),
                                          wrapWithModel(
                                            model: _model.buttonModel1,
                                            updateCallback: () =>
                                                safeSetState(() {}),
                                            child: ButtonWidget(
                                              content: 'Tambah',
                                              icon: Icon(
                                                Icons.add_rounded,
                                                color: FlutterFlowTheme.of(
                                                  context,
                                                ).primary,
                                                size: 16,
                                              ),
                                              iconPresent: true,
                                              iconEndPresent: false,
                                              variant: 'ghost',
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
                                  wrapWithModel(
                                    model: _model.budgetRowModel1,
                                    updateCallback: () => safeSetState(() {}),
                                    child: BudgetRowWidget(
                                      icon: Icon(
                                        Icons.payments_rounded,
                                        color: FlutterFlowTheme.of(
                                          context,
                                        ).primary,
                                        size: 20,
                                      ),
                                      name: 'Honorarium Narasumber',
                                      qty: '2',
                                      total: 'Rp 1.500.000',
                                      unit: 'Jam',
                                    ),
                                  ),
                                  wrapWithModel(
                                    model: _model.budgetRowModel2,
                                    updateCallback: () => safeSetState(() {}),
                                    child: BudgetRowWidget(
                                      icon: Icon(
                                        Icons.restaurant_rounded,
                                        color: FlutterFlowTheme.of(
                                          context,
                                        ).primary,
                                        size: 20,
                                      ),
                                      name: 'Konsumsi Peserta',
                                      qty: '50',
                                      total: 'Rp 2.500.000',
                                      unit: 'Pax',
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                      0,
                                      0,
                                      0,
                                      24,
                                    ),
                                    child: Container(
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: FlutterFlowTheme.of(
                                            context,
                                          ).primaryContainer,
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
                                          shape: BoxShape.rectangle,
                                        ),
                                        child: Padding(
                                          padding: EdgeInsets.all(16),
                                          child: Container(
                                            child: Row(
                                              mainAxisSize: MainAxisSize.max,
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.center,
                                              children: [
                                                Text(
                                                  'Estimasi Total',
                                                  style:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).titleSmall.override(
                                                        font: GoogleFonts.figtree(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                    context,
                                                                  )
                                                                  .titleSmall
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                    context,
                                                                  )
                                                                  .titleSmall
                                                                  .fontStyle,
                                                        ),
                                                        color:
                                                            FlutterFlowTheme.of(
                                                              context,
                                                            ).onPrimaryContainer,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .titleSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .titleSmall
                                                                .fontStyle,
                                                        lineHeight: 1.4,
                                                      ),
                                                ),
                                                Text(
                                                  'Rp 4.000.000',
                                                  style:
                                                      FlutterFlowTheme.of(
                                                        context,
                                                      ).titleMedium.override(
                                                        font: GoogleFonts.figtree(
                                                          fontWeight:
                                                              FontWeight.w900,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                    context,
                                                                  )
                                                                  .titleMedium
                                                                  .fontStyle,
                                                        ),
                                                        color:
                                                            FlutterFlowTheme.of(
                                                              context,
                                                            ).onPrimaryContainer,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FontWeight.w900,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                  context,
                                                                )
                                                                .titleMedium
                                                                .fontStyle,
                                                        lineHeight: 1.35,
                                                      ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              Container(height: 32),
                            ].divide(SizedBox(height: 24)),
                          ),
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
                    padding: EdgeInsets.all(24),
                    child: Container(
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            flex: 1,
                            child: wrapWithModel(
                              model: _model.buttonModel2,
                              updateCallback: () => safeSetState(() {}),
                              child: ButtonWidget(
                                content: 'Simpan Draft',
                                iconPresent: false,
                                iconEndPresent: false,
                                variant: 'outline',
                                size: 'medium',
                                fullWidth: true,
                                loading: false,
                                disabled: false,
                              ),
                            ),
                          ),
                          Expanded(
                            flex: 1,
                            child: wrapWithModel(
                              model: _model.buttonModel3,
                              updateCallback: () => safeSetState(() {}),
                              child: ButtonWidget(
                                content: 'Lanjutkan',
                                icon: Icon(
                                  Icons.arrow_forward_rounded,
                                  color: FlutterFlowTheme.of(context).onPrimary,
                                  size: 16,
                                ),
                                iconPresent: true,
                                iconEndPresent: false,
                                variant: 'primary',
                                size: 'medium',
                                fullWidth: true,
                                loading: false,
                                disabled: false,
                              ),
                            ),
                          ),
                        ].divide(SizedBox(width: 16)),
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
