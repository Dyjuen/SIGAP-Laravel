import '/components/button/button_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/components/user_table_row/user_table_row_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../model/user_management_widget.dart' show UserManagementWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class UserManagementModel extends FlutterFlowModel<UserManagementWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for TextField.
  late TextFieldModel textFieldModel;
  // Model for Button.
  late ButtonModel buttonModel;
  // Model for UserTableRow.
  late UserTableRowModel userTableRowModel1;
  // Model for UserTableRow.
  late UserTableRowModel userTableRowModel2;
  // Model for UserTableRow.
  late UserTableRowModel userTableRowModel3;
  // Model for UserTableRow.
  late UserTableRowModel userTableRowModel4;
  // Model for UserTableRow.
  late UserTableRowModel userTableRowModel5;

  @override
  void initState(BuildContext context) {
    textFieldModel = createModel(context, () => TextFieldModel());
    buttonModel = createModel(context, () => ButtonModel());
    userTableRowModel1 = createModel(context, () => UserTableRowModel());
    userTableRowModel2 = createModel(context, () => UserTableRowModel());
    userTableRowModel3 = createModel(context, () => UserTableRowModel());
    userTableRowModel4 = createModel(context, () => UserTableRowModel());
    userTableRowModel5 = createModel(context, () => UserTableRowModel());
  }

  @override
  void dispose() {
    textFieldModel.dispose();
    buttonModel.dispose();
    userTableRowModel1.dispose();
    userTableRowModel2.dispose();
    userTableRowModel3.dispose();
    userTableRowModel4.dispose();
    userTableRowModel5.dispose();
  }
}
