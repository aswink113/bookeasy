import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'signup_screen.dart';
import 'customer_home.dart';
import 'merchant_dashboard.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final result = await ApiService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (mounted) {
        final role = result['user']['role'];
        if (role == 'customer') {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const CustomerHome()));
        } else {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const MerchantDashboard()));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'Welcome Back',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ).animate().fadeIn(duration: 400.ms).slideX(begin: -0.1),
                const SizedBox(height: 8),
                Text(
                  'Log in to your Bokivo account.',
                  style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                ).animate().fadeIn(delay: 100.ms),
                const SizedBox(height: 48),

                _buildTextField(
                  label: 'Email Address',
                  hint: 'name@example.com',
                  icon: FontAwesomeIcons.envelope,
                  controller: _emailController,
                  validator: (val) => val!.isEmpty ? 'Enter your email' : null,
                ),
                const SizedBox(height: 24),

                _buildTextField(
                  label: 'Password',
                  hint: '••••••••',
                  icon: FontAwesomeIcons.lock,
                  obscureText: _obscurePassword,
                  controller: _passwordController,
                  validator: (val) => val!.isEmpty ? 'Enter your password' : null,
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? FontAwesomeIcons.eyeSlash : FontAwesomeIcons.eye, size: 18),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: const Text('Forgot Password?', style: TextStyle(color: Color(0xFF38B6FF))),
                  ),
                ),
                
                const SizedBox(height: 40),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    child: _isLoading 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Sign In'),
                  ),
                ).animate().scale(delay: 400.ms),
                
                const SizedBox(height: 32),
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const SignupScreen())),
                    child: RichText(
                      text: TextSpan(
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                        children: const [
                          TextSpan(text: "Don't have an account? "),
                          TextSpan(text: "Sign Up", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    TextEditingController? controller,
    String? Function(String?)? validator,
    Widget? suffixIcon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, size: 18, color: Colors.grey.shade400),
            suffixIcon: suffixIcon,
          ),
        ),
      ],
    );
  }
}
