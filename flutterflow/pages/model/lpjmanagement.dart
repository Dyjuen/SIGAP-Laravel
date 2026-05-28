import '/components/lpj_document_item/lpj_document_item_widget.dart';
import '/components/lpj_status_card/lpj_status_card_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../model/l_p_j_management_widget.dart' show LPJManagementWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class LPJManagementModel extends FlutterFlowModel<LPJManagementWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for LpjStatusCard.
  late LpjStatusCardModel lpjStatusCardModel1;
  // Model for LpjStatusCard.
  late LpjStatusCardModel lpjStatusCardModel2;
  // Model for LpjStatusCard.
  late LpjStatusCardModel lpjStatusCardModel3;
  // Model for LpjStatusCard.
  late LpjStatusCardModel lpjStatusCardModel4;
  // Model for TextField.
  late TextFieldModel textFieldModel;
  // Model for LpjDocumentItem.
  late LpjDocumentItemModel lpjDocumentItemModel1;
  // Model for LpjDocumentItem.
  late LpjDocumentItemModel lpjDocumentItemModel2;
  // Model for LpjDocumentItem.
  late LpjDocumentItemModel lpjDocumentItemModel3;
  // Model for LpjDocumentItem.
  late LpjDocumentItemModel lpjDocumentItemModel4;

  @override
  void initState(BuildContext context) {
    lpjStatusCardModel1 = createModel(context, () => LpjStatusCardModel());
    lpjStatusCardModel2 = createModel(context, () => LpjStatusCardModel());
    lpjStatusCardModel3 = createModel(context, () => LpjStatusCardModel());
    lpjStatusCardModel4 = createModel(context, () => LpjStatusCardModel());
    textFieldModel = createModel(context, () => TextFieldModel());
    lpjDocumentItemModel1 = createModel(context, () => LpjDocumentItemModel());
    lpjDocumentItemModel2 = createModel(context, () => LpjDocumentItemModel());
    lpjDocumentItemModel3 = createModel(context, () => LpjDocumentItemModel());
    lpjDocumentItemModel4 = createModel(context, () => LpjDocumentItemModel());
  }

  @override
  void dispose() {
    lpjStatusCardModel1.dispose();
    lpjStatusCardModel2.dispose();
    lpjStatusCardModel3.dispose();
    lpjStatusCardModel4.dispose();
    textFieldModel.dispose();
    lpjDocumentItemModel1.dispose();
    lpjDocumentItemModel2.dispose();
    lpjDocumentItemModel3.dispose();
    lpjDocumentItemModel4.dispose();
  }
}
