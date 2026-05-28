import '/components/button/button_widget.dart';
import '/components/checkbox/checkbox_widget.dart';
import '/components/floating_circle/floating_circle_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../model/login_widget.dart' show LoginWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class LoginModel extends FlutterFlowModel<LoginWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for FloatingCircle.
  late FloatingCircleModel floatingCircleModel1;
  // Model for FloatingCircle.
  late FloatingCircleModel floatingCircleModel2;
  // Model for FloatingCircle.
  late FloatingCircleModel floatingCircleModel3;
  // Model for FloatingCircle.
  late FloatingCircleModel floatingCircleModel4;
  // Model for TextField.
  late TextFieldModel textFieldModel1;
  // Model for TextField.
  late TextFieldModel textFieldModel2;
  // Model for Checkbox.
  late CheckboxModel checkboxModel;
  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for Button.
  late ButtonModel buttonModel2;

  @override
  void initState(BuildContext context) {
    floatingCircleModel1 = createModel(context, () => FloatingCircleModel());
    floatingCircleModel2 = createModel(context, () => FloatingCircleModel());
    floatingCircleModel3 = createModel(context, () => FloatingCircleModel());
    floatingCircleModel4 = createModel(context, () => FloatingCircleModel());
    textFieldModel1 = createModel(context, () => TextFieldModel());
    textFieldModel2 = createModel(context, () => TextFieldModel());
    checkboxModel = createModel(context, () => CheckboxModel());
    buttonModel1 = createModel(context, () => ButtonModel());
    buttonModel2 = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    floatingCircleModel1.dispose();
    floatingCircleModel2.dispose();
    floatingCircleModel3.dispose();
    floatingCircleModel4.dispose();
    textFieldModel1.dispose();
    textFieldModel2.dispose();
    checkboxModel.dispose();
    buttonModel1.dispose();
    buttonModel2.dispose();
  }
}
