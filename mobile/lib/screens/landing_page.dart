import 'package:flutter/material.dart';
import '../widgets/landing/hero_section.dart';
import '../widgets/landing/features_section.dart';
import '../widgets/landing/roles_section.dart';
import '../widgets/landing/faq_section.dart';
import '../widgets/landing/contact_section.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('SIGAP PNJ', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: const [
            HeroSection(),
            FeaturesSection(),
            RolesSection(),
            FaqSection(),
            ContactSection(),
          ],
        ),
      ),
    );
  }
}
