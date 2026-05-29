import '/components/button/button_widget.dart';
import '/components/faq_accordion/faq_accordion_widget.dart';
import '/components/manual_download_card/manual_download_card_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../model/panduan_help_widget.dart' show PanduanHelpWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_palette/material_palette.dart';
import 'package:provider/provider.dart';

class PanduanHelpModel extends FlutterFlowModel<PanduanHelpWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for TextField.
  late TextFieldModel textFieldModel;
  // Model for ManualDownloadCard.
  late ManualDownloadCardModel manualDownloadCardModel1;
  // Model for ManualDownloadCard.
  late ManualDownloadCardModel manualDownloadCardModel2;
  // Model for ManualDownloadCard.
  late ManualDownloadCardModel manualDownloadCardModel3;
  // Model for FaqAccordion.
  late FaqAccordionModel faqAccordionModel1;
  // Model for FaqAccordion.
  late FaqAccordionModel faqAccordionModel2;
  // Model for FaqAccordion.
  late FaqAccordionModel faqAccordionModel3;
  // Model for FaqAccordion.
  late FaqAccordionModel faqAccordionModel4;
  // Model for Button.
  late ButtonModel buttonModel;

  @override
  void initState(BuildContext context) {
    textFieldModel = createModel(context, () => TextFieldModel());
    manualDownloadCardModel1 = createModel(
      context,
      () => ManualDownloadCardModel(),
    );
    manualDownloadCardModel2 = createModel(
      context,
      () => ManualDownloadCardModel(),
    );
    manualDownloadCardModel3 = createModel(
      context,
      () => ManualDownloadCardModel(),
    );
    faqAccordionModel1 = createModel(context, () => FaqAccordionModel());
    faqAccordionModel2 = createModel(context, () => FaqAccordionModel());
    faqAccordionModel3 = createModel(context, () => FaqAccordionModel());
    faqAccordionModel4 = createModel(context, () => FaqAccordionModel());
    buttonModel = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    textFieldModel.dispose();
    manualDownloadCardModel1.dispose();
    manualDownloadCardModel2.dispose();
    manualDownloadCardModel3.dispose();
    faqAccordionModel1.dispose();
    faqAccordionModel2.dispose();
    faqAccordionModel3.dispose();
    faqAccordionModel4.dispose();
    buttonModel.dispose();
  }
}
