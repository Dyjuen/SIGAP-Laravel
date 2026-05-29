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
import '../../model/k_a_k_submission_form_widget.dart' show KAKSubmissionFormWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class KAKSubmissionFormModel extends FlutterFlowModel<KAKSubmissionFormWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for FormStepIndicator.
  late FormStepIndicatorModel formStepIndicatorModel1;
  // Model for FormStepIndicator.
  late FormStepIndicatorModel formStepIndicatorModel2;
  // Model for FormStepIndicator.
  late FormStepIndicatorModel formStepIndicatorModel3;
  // Model for FormSectionHeader.
  late FormSectionHeaderModel formSectionHeaderModel1;
  // Model for TextField.
  late TextFieldModel textFieldModel1;
  // Model for TextField.
  late TextFieldModel textFieldModel2;
  // Model for TextField.
  late TextFieldModel textFieldModel3;
  // Model for TextField.
  late TextFieldModel textFieldModel4;
  // Model for FormSectionHeader.
  late FormSectionHeaderModel formSectionHeaderModel2;
  // Model for TextField.
  late TextFieldModel textFieldModel5;
  // Model for TextField.
  late TextFieldModel textFieldModel6;
  // Model for FormSectionHeader.
  late FormSectionHeaderModel formSectionHeaderModel3;
  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for BudgetRow.
  late BudgetRowModel budgetRowModel1;
  // Model for BudgetRow.
  late BudgetRowModel budgetRowModel2;
  // Model for Button.
  late ButtonModel buttonModel2;
  // Model for Button.
  late ButtonModel buttonModel3;

  @override
  void initState(BuildContext context) {
    formStepIndicatorModel1 = createModel(
      context,
      () => FormStepIndicatorModel(),
    );
    formStepIndicatorModel2 = createModel(
      context,
      () => FormStepIndicatorModel(),
    );
    formStepIndicatorModel3 = createModel(
      context,
      () => FormStepIndicatorModel(),
    );
    formSectionHeaderModel1 = createModel(
      context,
      () => FormSectionHeaderModel(),
    );
    textFieldModel1 = createModel(context, () => TextFieldModel());
    textFieldModel2 = createModel(context, () => TextFieldModel());
    textFieldModel3 = createModel(context, () => TextFieldModel());
    textFieldModel4 = createModel(context, () => TextFieldModel());
    formSectionHeaderModel2 = createModel(
      context,
      () => FormSectionHeaderModel(),
    );
    textFieldModel5 = createModel(context, () => TextFieldModel());
    textFieldModel6 = createModel(context, () => TextFieldModel());
    formSectionHeaderModel3 = createModel(
      context,
      () => FormSectionHeaderModel(),
    );
    buttonModel1 = createModel(context, () => ButtonModel());
    budgetRowModel1 = createModel(context, () => BudgetRowModel());
    budgetRowModel2 = createModel(context, () => BudgetRowModel());
    buttonModel2 = createModel(context, () => ButtonModel());
    buttonModel3 = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    formStepIndicatorModel1.dispose();
    formStepIndicatorModel2.dispose();
    formStepIndicatorModel3.dispose();
    formSectionHeaderModel1.dispose();
    textFieldModel1.dispose();
    textFieldModel2.dispose();
    textFieldModel3.dispose();
    textFieldModel4.dispose();
    formSectionHeaderModel2.dispose();
    textFieldModel5.dispose();
    textFieldModel6.dispose();
    formSectionHeaderModel3.dispose();
    buttonModel1.dispose();
    budgetRowModel1.dispose();
    budgetRowModel2.dispose();
    buttonModel2.dispose();
    buttonModel3.dispose();
  }
}
