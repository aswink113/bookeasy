import 'package:flutter/material.dart';
import 'screens/intro_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const BookEasyApp());
}

class BookEasyApp extends StatelessWidget {
  const BookEasyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BookEasy',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      // The app starts with the Intro/Splash screen
      home: const IntroScreen(),
    );
  }
}
