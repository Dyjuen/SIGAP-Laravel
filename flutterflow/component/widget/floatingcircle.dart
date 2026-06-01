import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'floating_circle_model.dart';
export 'floating_circle_model.dart';

class FloatingCircleWidget extends StatefulWidget {
  const FloatingCircleWidget({super.key, Color? color, double? size})
      : this.color = color ?? const Color(0x00000000),
        this.size = size ?? 300.0;

  final Color color;
  final double size;

  @override
  State<FloatingCircleWidget> createState() => _FloatingCircleWidgetState();
}

class _FloatingCircleWidgetState extends State<FloatingCircleWidget> {
  late FloatingCircleModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FloatingCircleModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: 0.15,
      child: ClipRect(
        child: ImageFiltered(
          imageFilter: ImageFilter.blur(sigmaX: 40, sigmaY: 40),
          child: Container(
            width: valueOrDefault<double>(widget.size, 300.0),
            height: valueOrDefault<double>(widget.size, 300.0),
            decoration: BoxDecoration(
              color: valueOrDefault<Color>(
                widget.color,
                FlutterFlowTheme.of(context).primary,
              ),
              borderRadius: BorderRadius.circular(9999),
              shape: BoxShape.rectangle,
            ),
          ),
        ),
      ),
    );
  }
}
