import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/router/app_router.dart';
import '../../../core/utils/validators.dart';
import '../../../widgets/loading.dart';

/// Screen for Email Link (Passwordless) Sign In
class EmailLinkSignInScreen extends ConsumerStatefulWidget {
  final String? emailLink;

  const EmailLinkSignInScreen({super.key, this.emailLink});

  @override
  ConsumerState<EmailLinkSignInScreen> createState() =>
      _EmailLinkSignInScreenState();
}

class _EmailLinkSignInScreenState extends ConsumerState<EmailLinkSignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _emailSent = false;
  bool _isProcessingLink = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // If we have an email link, try to complete sign in
    if (widget.emailLink != null) {
      _handleEmailLink();
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleEmailLink() async {
    setState(() {
      _isProcessingLink = true;
      _error = null;
    });

    try {
      // Get stored email
      final prefs = await SharedPreferences.getInstance();
      final storedEmail = prefs.getString('emailForSignIn');

      if (storedEmail == null) {
        // User opened link on different device, need to ask for email
        setState(() {
          _isProcessingLink = false;
        });
        _showEmailConfirmDialog();
        return;
      }

      // Complete sign in
      final success = await ref
          .read(authProvider.notifier)
          .signInWithEmailLink(storedEmail, widget.emailLink!);

      if (success) {
        // Clear stored email
        await prefs.remove('emailForSignIn');
        if (mounted && context.mounted) {
          context.go(AppRoutes.home);
        }
      } else {
        setState(() {
          _error = ref.read(authProvider).error ?? 'Sign in failed';
          _isProcessingLink = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to process sign-in link';
        _isProcessingLink = false;
      });
    }
  }

  void _showEmailConfirmDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Email'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Please enter your email address to complete sign-in.'),
            const SizedBox(height: 16),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.email_outlined),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.go(AppRoutes.login);
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (_emailController.text.isNotEmpty) {
                Navigator.pop(context);
                final success = await ref
                    .read(authProvider.notifier)
                    .signInWithEmailLink(
                      _emailController.text.trim(),
                      widget.emailLink!,
                    );
                if (success && context.mounted) {
                  context.go(AppRoutes.home);
                }
              }
            },
            child: const Text('Sign In'),
          ),
        ],
      ),
    );
  }

  Future<void> _sendSignInLink() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _error = null);

      final success = await ref
          .read(authProvider.notifier)
          .sendSignInLinkToEmail(_emailController.text.trim());

      if (success) {
        // Store email for later
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('emailForSignIn', _emailController.text.trim());

        setState(() => _emailSent = true);
      } else {
        setState(() {
          _error = ref.read(authProvider).error ?? 'Failed to send email';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    if (_isProcessingLink) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Signing you in...'),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(AppRoutes.login),
        ),
        title: const Text('Sign In with Email Link'),
      ),
      body: LoadingOverlay(
        isLoading: authState.isLoading,
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: _emailSent ? _buildEmailSentView() : _buildEmailForm(),
          ),
        ),
      ),
    );
  }

  Widget _buildEmailForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 20),
          // Icon
          const Icon(
            Icons.mark_email_unread_outlined,
            size: 80,
            color: AppColors.primary,
          ),
          const SizedBox(height: 24),
          Text(
            'Passwordless Sign In',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Enter your email address and we\'ll send you a secure sign-in link. No password needed!',
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 32),
          // Email field
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.email_outlined),
            ),
            validator: validateEmail,
            onFieldSubmitted: (_) => _sendSignInLink(),
          ),
          const SizedBox(height: 24),
          // Error message
          if (_error != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: AppColors.error),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _error!,
                      style: const TextStyle(color: AppColors.error),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
          // Send link button
          ElevatedButton.icon(
            onPressed: _sendSignInLink,
            icon: const Icon(Icons.send),
            label: const Text('Send Sign-In Link'),
          ),
          const SizedBox(height: 24),
          // Back to password login
          TextButton(
            onPressed: () => context.go(AppRoutes.login),
            child: const Text('Use password instead'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmailSentView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 40),
        // Success icon
        const Icon(
          Icons.mark_email_read_outlined,
          size: 100,
          color: AppColors.success,
        ),
        const SizedBox(height: 32),
        Text(
          'Check Your Email',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        Text(
          'We\'ve sent a sign-in link to',
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 8),
        Text(
          _emailController.text,
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              const Icon(Icons.info_outline, color: AppColors.primary),
              const SizedBox(height: 8),
              Text(
                'Click the link in the email to sign in. The link will expire in 1 hour.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        // Resend button
        OutlinedButton.icon(
          onPressed: () {
            setState(() => _emailSent = false);
          },
          icon: const Icon(Icons.refresh),
          label: const Text('Send Another Link'),
        ),
        const SizedBox(height: 16),
        // Back to login
        TextButton(
          onPressed: () => context.go(AppRoutes.login),
          child: const Text('Back to Login'),
        ),
      ],
    );
  }
}
