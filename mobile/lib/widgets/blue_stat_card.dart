import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BlueStatCard extends StatelessWidget {
  final Color bg;
  final String label;
  final Color textColor;
  final String value;

  const BlueStatCard({
    super.key,
    this.bg = const Color(0xFF00BCD4),
    this.label = 'PENCAIRAN',
    this.textColor = Colors.white,
    this.value = '12',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 180),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(32),
      ),
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Stack(
          alignment: Alignment.topLeft,
          children: [
            // Background number (opacity)
            Opacity(
              opacity: 0.05,
              child: Align(
                alignment: Alignment.bottomRight,
                child: Text(
                  value,
                  style: TextStyle(
                    fontSize: 80,
                    fontWeight: FontWeight.w900,
                    color: Colors.grey[800],
                    fontFamily: 'Figtree',
                  ),
                ),
              ),
            ),
            // Main content
            Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children:
                  [
                        Text(
                          label,
                          style: GoogleFonts.figtree(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: textColor,
                            letterSpacing: 0,
                            height: 1.35,
                          ),
                        ),
                        Opacity(
                          opacity: 0.7,
                          child: Text(
                            'USULAN',
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: textColor,
                              letterSpacing: 0,
                              height: 1.2,
                            ),
                          ),
                        ),
                        Text(
                          value,
                          style: GoogleFonts.figtree(
                            fontSize: 48,
                            fontWeight: FontWeight.w900,
                            color: textColor,
                            letterSpacing: 0,
                            height: 1.15,
                          ),
                        ),
                      ]
                      .map(
                        (widget) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: widget,
                        ),
                      )
                      .toList()
                    ..removeLast(),
            ),
          ],
        ),
      ),
    );
  }
}
