import 'dart:ui';
import 'package:flutter/material.dart';

class FloatingCircleWidget extends StatelessWidget {
  const FloatingCircleWidget({super.key, this.color, this.size = 300.0});

  final Color? color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: 0.15,
      child: ClipRect(
        child: ImageFiltered(
          imageFilter: ImageFilter.blur(sigmaX: 40, sigmaY: 40),
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: color ?? Theme.of(context).colorScheme.primary,
              borderRadius: BorderRadius.circular(9999),
              shape: BoxShape.rectangle,
            ),
          ),
        ),
      ),
    );
  }
}
