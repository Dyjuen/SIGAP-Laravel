import '/components/log_entry_card/log_entry_card_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../model/activity_logs_widget.dart' show ActivityLogsWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ActivityLogsModel extends FlutterFlowModel<ActivityLogsWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for TextField.
  late TextFieldModel textFieldModel;
  // Model for LogEntryCard.
  late LogEntryCardModel logEntryCardModel1;
  // Model for LogEntryCard.
  late LogEntryCardModel logEntryCardModel2;
  // Model for LogEntryCard.
  late LogEntryCardModel logEntryCardModel3;
  // Model for LogEntryCard.
  late LogEntryCardModel logEntryCardModel4;
  // Model for LogEntryCard.
  late LogEntryCardModel logEntryCardModel5;
  // Model for LogEntryCard.
  late LogEntryCardModel logEntryCardModel6;
  // Model for LogEntryCard.
  late LogEntryCardModel logEntryCardModel7;

  @override
  void initState(BuildContext context) {
    textFieldModel = createModel(context, () => TextFieldModel());
    logEntryCardModel1 = createModel(context, () => LogEntryCardModel());
    logEntryCardModel2 = createModel(context, () => LogEntryCardModel());
    logEntryCardModel3 = createModel(context, () => LogEntryCardModel());
    logEntryCardModel4 = createModel(context, () => LogEntryCardModel());
    logEntryCardModel5 = createModel(context, () => LogEntryCardModel());
    logEntryCardModel6 = createModel(context, () => LogEntryCardModel());
    logEntryCardModel7 = createModel(context, () => LogEntryCardModel());
  }

  @override
  void dispose() {
    textFieldModel.dispose();
    logEntryCardModel1.dispose();
    logEntryCardModel2.dispose();
    logEntryCardModel3.dispose();
    logEntryCardModel4.dispose();
    logEntryCardModel5.dispose();
    logEntryCardModel6.dispose();
    logEntryCardModel7.dispose();
  }
}
