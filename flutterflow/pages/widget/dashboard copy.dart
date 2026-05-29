import '/components/activity_item/activity_item_widget.dart';
import '/components/blue_stat_card/blue_stat_card_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../widget/dashboard_widget.dart' show DashboardWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class DashboardModel extends FlutterFlowModel<DashboardWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for BlueStatCard.
  late BlueStatCardModel blueStatCardModel1;
  // Model for BlueStatCard.
  late BlueStatCardModel blueStatCardModel2;
  // Model for BlueStatCard.
  late BlueStatCardModel blueStatCardModel3;
  // Model for BlueStatCard.
  late BlueStatCardModel blueStatCardModel4;
  // Model for ActivityItem.
  late ActivityItemModel activityItemModel1;
  // Model for ActivityItem.
  late ActivityItemModel activityItemModel2;
  // Model for ActivityItem.
  late ActivityItemModel activityItemModel3;

  @override
  void initState(BuildContext context) {
    blueStatCardModel1 = createModel(context, () => BlueStatCardModel());
    blueStatCardModel2 = createModel(context, () => BlueStatCardModel());
    blueStatCardModel3 = createModel(context, () => BlueStatCardModel());
    blueStatCardModel4 = createModel(context, () => BlueStatCardModel());
    activityItemModel1 = createModel(context, () => ActivityItemModel());
    activityItemModel2 = createModel(context, () => ActivityItemModel());
    activityItemModel3 = createModel(context, () => ActivityItemModel());
  }

  @override
  void dispose() {
    blueStatCardModel1.dispose();
    blueStatCardModel2.dispose();
    blueStatCardModel3.dispose();
    blueStatCardModel4.dispose();
    activityItemModel1.dispose();
    activityItemModel2.dispose();
    activityItemModel3.dispose();
  }
}
