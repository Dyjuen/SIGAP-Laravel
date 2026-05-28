import '/components/monitoring_card/monitoring_card_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../model/kegiatan_monitoring_widget.dart' show KegiatanMonitoringWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class KegiatanMonitoringModel
    extends FlutterFlowModel<KegiatanMonitoringWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for TextField.
  late TextFieldModel textFieldModel;
  // Model for MonitoringCard.
  late MonitoringCardModel monitoringCardModel1;
  // Model for MonitoringCard.
  late MonitoringCardModel monitoringCardModel2;
  // Model for MonitoringCard.
  late MonitoringCardModel monitoringCardModel3;
  // Model for MonitoringCard.
  late MonitoringCardModel monitoringCardModel4;
  // Model for MonitoringCard.
  late MonitoringCardModel monitoringCardModel5;

  @override
  void initState(BuildContext context) {
    textFieldModel = createModel(context, () => TextFieldModel());
    monitoringCardModel1 = createModel(context, () => MonitoringCardModel());
    monitoringCardModel2 = createModel(context, () => MonitoringCardModel());
    monitoringCardModel3 = createModel(context, () => MonitoringCardModel());
    monitoringCardModel4 = createModel(context, () => MonitoringCardModel());
    monitoringCardModel5 = createModel(context, () => MonitoringCardModel());
  }

  @override
  void dispose() {
    textFieldModel.dispose();
    monitoringCardModel1.dispose();
    monitoringCardModel2.dispose();
    monitoringCardModel3.dispose();
    monitoringCardModel4.dispose();
    monitoringCardModel5.dispose();
  }
}
