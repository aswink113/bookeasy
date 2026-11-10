import 'package:flutter/material.dart';
import 'screens/intro_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const BokivoApp());
}

class BokivoApp extends StatelessWidget {
  const BokivoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bokivo',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      // The app starts with the Intro/Splash screen
      home: const IntroScreen(),
    );
  }
}
