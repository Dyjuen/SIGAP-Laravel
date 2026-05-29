import '/components/button/button_widget.dart';
import '/components/profile_info_row/profile_info_row_widget.dart';
import '/components/settings_tile/settings_tile_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '../../model/user_profile_widget.dart' show UserProfileWidget;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class UserProfileModel extends FlutterFlowModel<UserProfileWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for ProfileInfoRow.
  late ProfileInfoRowModel profileInfoRowModel1;
  // Model for ProfileInfoRow.
  late ProfileInfoRowModel profileInfoRowModel2;
  // Model for ProfileInfoRow.
  late ProfileInfoRowModel profileInfoRowModel3;
  // Model for ProfileInfoRow.
  late ProfileInfoRowModel profileInfoRowModel4;
  // Model for SettingsTile.
  late SettingsTileModel settingsTileModel1;
  // Model for SettingsTile.
  late SettingsTileModel settingsTileModel2;
  // Model for SettingsTile.
  late SettingsTileModel settingsTileModel3;
  // Model for SettingsTile.
  late SettingsTileModel settingsTileModel4;
  // Model for Button.
  late ButtonModel buttonModel;

  @override
  void initState(BuildContext context) {
    profileInfoRowModel1 = createModel(context, () => ProfileInfoRowModel());
    profileInfoRowModel2 = createModel(context, () => ProfileInfoRowModel());
    profileInfoRowModel3 = createModel(context, () => ProfileInfoRowModel());
    profileInfoRowModel4 = createModel(context, () => ProfileInfoRowModel());
    settingsTileModel1 = createModel(context, () => SettingsTileModel());
    settingsTileModel2 = createModel(context, () => SettingsTileModel());
    settingsTileModel3 = createModel(context, () => SettingsTileModel());
    settingsTileModel4 = createModel(context, () => SettingsTileModel());
    buttonModel = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    profileInfoRowModel1.dispose();
    profileInfoRowModel2.dispose();
    profileInfoRowModel3.dispose();
    profileInfoRowModel4.dispose();
    settingsTileModel1.dispose();
    settingsTileModel2.dispose();
    settingsTileModel3.dispose();
    settingsTileModel4.dispose();
    buttonModel.dispose();
  }
}
