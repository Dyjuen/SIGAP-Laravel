import '/components/button/button_widget.dart';
import '/components/faq_item/faq_item_widget.dart';
import '/components/feature_card/feature_card_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../widget/landing_page_widget.dart' show LandingPageWidget;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_palette/material_palette.dart';
import 'package:provider/provider.dart';

class LandingPageModel extends FlutterFlowModel<LandingPageWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for Button.
  late ButtonModel buttonModel2;
  // Model for Button.
  late ButtonModel buttonModel3;
  // Model for FeatureCard.
  late FeatureCardModel featureCardModel1;
  // Model for FeatureCard.
  late FeatureCardModel featureCardModel2;
  // Model for FeatureCard.
  late FeatureCardModel featureCardModel3;
  // Model for FaqItem.
  late FaqItemModel faqItemModel1;
  // Model for FaqItem.
  late FaqItemModel faqItemModel2;
  // Model for FaqItem.
  late FaqItemModel faqItemModel3;

  @override
  void initState(BuildContext context) {
    buttonModel1 = createModel(context, () => ButtonModel());
    buttonModel2 = createModel(context, () => ButtonModel());
    buttonModel3 = createModel(context, () => ButtonModel());
    featureCardModel1 = createModel(context, () => FeatureCardModel());
    featureCardModel2 = createModel(context, () => FeatureCardModel());
    featureCardModel3 = createModel(context, () => FeatureCardModel());
    faqItemModel1 = createModel(context, () => FaqItemModel());
    faqItemModel2 = createModel(context, () => FaqItemModel());
    faqItemModel3 = createModel(context, () => FaqItemModel());
  }

  @override
  void dispose() {
    buttonModel1.dispose();
    buttonModel2.dispose();
    buttonModel3.dispose();
    featureCardModel1.dispose();
    featureCardModel2.dispose();
    featureCardModel3.dispose();
    faqItemModel1.dispose();
    faqItemModel2.dispose();
    faqItemModel3.dispose();
  }
}
