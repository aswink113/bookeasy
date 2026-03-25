import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../widgets/terms_modal.dart';
import 'customer_home.dart';
import 'subscription_screen.dart';
import 'login_screen.dart';
import '../services/api_service.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  _SignupScreenState createState() => _SignupScreenState();
}

enum UserRole { customer, merchant }

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  UserRole _selectedRole = UserRole.customer;
  bool _acceptedTerms = false;
  bool _obscurePassword = true;
  bool _isLoading = false;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _shopNameController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _serviceTypeController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _shopNameController.dispose();
    _addressController.dispose();
    _serviceTypeController.dispose();
    super.dispose();
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_acceptedTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please accept terms and conditions')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final result = await ApiService.signup(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        role: _selectedRole == UserRole.customer ? 'customer' : 'merchant',
        shopName: _selectedRole == UserRole.merchant ? _shopNameController.text.trim() : null,
        address: _selectedRole == UserRole.merchant ? _addressController.text.trim() : null,
        serviceType: _selectedRole == UserRole.merchant ? _serviceTypeController.text.trim() : null,
        base_price: _selectedRole == UserRole.merchant ? 0.0 : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Account created successfully!'), backgroundColor: Colors.green),
        );
        
        if (_selectedRole == UserRole.customer) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const CustomerHome()));
        } else {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const SubscriptionScreen()));
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
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Create Account',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ).animate().fadeIn(duration: 400.ms).slideX(begin: -0.1),
                const SizedBox(height: 8),
                Text(
                  'Start your journey with BookEasy today.',
                  style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                ).animate().fadeIn(delay: 100.ms),
                const SizedBox(height: 40),

                // Professional Role Selector
                Row(
                  children: [
                    Expanded(
                      child: _RoleCard(
                        title: 'Customer',
                        icon: FontAwesomeIcons.user,
                        isSelected: _selectedRole == UserRole.customer,
                        onTap: () => setState(() => _selectedRole = UserRole.customer),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _RoleCard(
                        title: 'Merchant',
                        icon: FontAwesomeIcons.store,
                        isSelected: _selectedRole == UserRole.merchant,
                        onTap: () => setState(() => _selectedRole = UserRole.merchant),
                      ),
                    ),
                  ],
                ).animate().fadeIn(delay: 200.ms),
                const SizedBox(height: 32),

                _buildTextField(
                  label: 'Full Name',
                  hint: 'John Doe',
                  icon: FontAwesomeIcons.userCircle,
                  controller: _nameController,
                  validator: (val) => val!.isEmpty ? 'Enter your name' : null,
                ),
                const SizedBox(height: 20),
                _buildTextField(
                  label: 'Email Address',
                  hint: 'name@example.com',
                  icon: FontAwesomeIcons.envelope,
                  keyboardType: TextInputType.emailAddress,
                  controller: _emailController,
                  validator: (val) => val!.contains('@') ? null : 'Enter valid email',
                ),
                const SizedBox(height: 20),
                
                // Animated Merchant Fields
                if (_selectedRole == UserRole.merchant)
                  Column(
                    children: [
                      _buildTextField(
                        label: 'Business Name',
                        hint: 'Your Shop Name',
                        icon: FontAwesomeIcons.shop,
                        controller: _shopNameController,
                        validator: (val) => val!.isEmpty ? 'Enter shop name' : null,
                      ),
                      const SizedBox(height: 20),
                      _buildTextField(
                        label: 'Business Address',
                        hint: 'Street, City, Zip',
                        icon: FontAwesomeIcons.locationDot,
                        controller: _addressController,
                        validator: (val) => val!.isEmpty ? 'Enter address' : null,
                      ),
                      const SizedBox(height: 20),
                      _buildTextField(
                        label: 'Service Type',
                        hint: 'Airlines, Spa, Hotel',
                        icon: FontAwesomeIcons.briefcase,
                        controller: _serviceTypeController,
                      ),
                      const SizedBox(height: 20),
                    ],
                  ).animate().fadeIn().slideY(begin: 0.1),

                _buildTextField(
                  label: 'Password',
                  hint: '••••••••',
                  icon: FontAwesomeIcons.lock,
                  obscureText: _obscurePassword,
                  controller: _passwordController,
                  validator: (val) => val!.length < 6 ? 'Min 6 characters' : null,
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? FontAwesomeIcons.eyeSlash : FontAwesomeIcons.eye, size: 18),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                const SizedBox(height: 16),

                Row(
                  children: [
                    SizedBox(
                      height: 24,
                      width: 24,
                      child: Checkbox(
                        value: _acceptedTerms,
                        onChanged: (val) => setState(() => _acceptedTerms = val!),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text('I agree to the ', style: TextStyle(fontSize: 14)),
                    GestureDetector(
                      onTap: () => showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (context) => const TermsModal(),
                      ),
                      child: const Text(
                        'Terms & Conditions',
                        style: TextStyle(color: Color(0xFF38B6FF), fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 40),

                ElevatedButton(
                  onPressed: _isLoading ? null : _handleSignup,
                  child: _isLoading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Create Account'),
                ).animate().scale(delay: 400.ms),
                
                const SizedBox(height: 24),
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const LoginScreen())),
                    child: RichText(
                      text: TextSpan(
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                        children: const [
                          TextSpan(text: "Already have an account? "),
                          TextSpan(text: "Sign In", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
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
    TextInputType? keyboardType,
    Widget? suffixIcon,
    TextEditingController? controller,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
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

class _RoleCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: 250.ms,
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? const Color(0xFF0F172A) : Colors.grey.shade200, width: 2),
          boxShadow: isSelected ? [BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4))] : [],
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? Colors.white : Colors.grey.shade400, size: 28),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey.shade600,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
