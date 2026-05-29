import 'package:flutter/material.dart';

class BlueStatCard extends StatelessWidget {
  final Color bg;
  final String label;
  final String subtitle;
  final Color textColor;
  final String value;
  final BoxBorder? border;

  const BlueStatCard({
    super.key,
    required this.bg,
    required this.label,
    required this.subtitle,
    required this.textColor,
    required this.value,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 140),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(24),
        border: border,
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Stack(
          alignment: Alignment.topLeft,
          children: [
            Align(
              alignment: Alignment.bottomRight,
              child: Opacity(
                opacity: 0.08,
                child: Text(
                  value,
                  style: TextStyle(
                    fontFamily: 'Figtree',
                    fontWeight: FontWeight.w900,
                    fontSize: 64,
                    color: textColor,
                    height: 1.1,
                  ),
                ),
              ),
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: TextStyle(
                    fontFamily: 'Figtree',
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 4),
                Opacity(
                  opacity: 0.7,
                  child: Text(
                    subtitle.toUpperCase(),
                    style: TextStyle(
                      fontFamily: 'Figtree',
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                      color: textColor,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  value,
                  style: TextStyle(
                    fontFamily: 'Figtree',
                    fontWeight: FontWeight.w900,
                    fontSize: 32,
                    color: textColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
