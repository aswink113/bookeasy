import 'package:flutter/material.dart';

class TermsModal extends StatelessWidget {
  const TermsModal({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Terms & Conditions',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: SingleChildScrollView(
              child: const Text(
                '1. Acceptance of Terms: By using this app, you agree to comply with and be bound by these terms.\n\n'
                '2. Service Description: BookEasy provides a platform for booking appointments with local merchants.\n\n'
                '3. User Obligations: Users must provide accurate information during signup. Merchants are responsible for their services.\n\n'
                '4. Privacy: We value your privacy and handle data as per our Privacy Policy.\n\n'
                '5. Subscriptions: Merchant subscriptions are non-refundable after the trial period.\n\n'
                '6. Termination: We reserve the right to terminate accounts that violate our community guidelines.\n\n'
                '7. Liability: BookEasy is not liable for disputes between customers and merchants.',
                style: TextStyle(fontSize: 16),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ),
        ],
      ),
    );
  }
}
