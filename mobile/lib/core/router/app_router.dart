import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/auth/presentation/email_link_sign_in_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/home/presentation/main_shell.dart';
import '../../features/products/presentation/product_list_screen.dart';
import '../../features/products/presentation/product_detail_screen.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/checkout/presentation/checkout_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/orders/presentation/order_detail_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/profile/presentation/addresses_screen.dart';
import '../../features/profile/presentation/address_form_screen.dart';

// Route names
class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const register = '/register';
  static const emailLinkSignIn = '/email-link-sign-in';
  static const home = '/home';
  static const products = '/products';
  static const productDetail = '/products/:id';
  static const cart = '/cart';
  static const checkout = '/checkout';
  static const orders = '/orders';
  static const orderDetail = '/orders/:id';
  static const profile = '/profile';
  static const addresses = '/profile/addresses';
  static const addAddress = '/profile/addresses/add';
  static const editAddress = '/profile/addresses/:id';
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      final isLoggedIn = authState.status == AuthStatus.authenticated;
      final isGuest = authState.status == AuthStatus.guest;
      final canBrowse = isLoggedIn || isGuest;
      final isLoggingIn =
          state.matchedLocation == AppRoutes.login ||
          state.matchedLocation == AppRoutes.register ||
          state.matchedLocation == AppRoutes.emailLinkSignIn;
      final isSplash = state.matchedLocation == AppRoutes.splash;

      // Still loading, show splash
      if (authState.status == AuthStatus.initial) {
        return isSplash ? null : AppRoutes.splash;
      }

      // Not logged in and not guest, redirect to login (except for login/register/email-link pages)
      if (!canBrowse && !isLoggingIn) {
        return AppRoutes.login;
      }

      // Can browse but on login/register page, redirect to home
      if (canBrowse && isLoggingIn) {
        return AppRoutes.home;
      }

      // Can browse and on splash, redirect to home
      if (canBrowse && isSplash) {
        return AppRoutes.home;
      }

      return null;
    },
    routes: [
      // Splash
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth routes
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: AppRoutes.emailLinkSignIn,
        builder: (context, state) {
          // Get email link from query parameters if coming from deep link
          final emailLink = state.uri.queryParameters['link'];
          return EmailLinkSignInScreen(emailLink: emailLink);
        },
      ),

      // Main shell with bottom navigation
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: HomeScreen()),
          ),
          GoRoute(
            path: AppRoutes.products,
            pageBuilder: (context, state) {
              final category = state.uri.queryParameters['category'];
              return NoTransitionPage(
                child: ProductListScreen(category: category),
              );
            },
          ),
          GoRoute(
            path: AppRoutes.productDetail,
            builder: (context, state) {
              final productId = state.pathParameters['id']!;
              return ProductDetailScreen(productId: productId);
            },
          ),
          GoRoute(
            path: AppRoutes.cart,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: CartScreen()),
          ),
          GoRoute(
            path: AppRoutes.orders,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: OrdersScreen()),
          ),
          GoRoute(
            path: AppRoutes.profile,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ProfileScreen()),
          ),
        ],
      ),

      // Full screen routes (no bottom nav)
      GoRoute(
        path: AppRoutes.checkout,
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: AppRoutes.orderDetail,
        builder: (context, state) {
          final orderId = state.pathParameters['id']!;
          return OrderDetailScreen(orderId: orderId);
        },
      ),
      GoRoute(
        path: AppRoutes.addresses,
        builder: (context, state) => const AddressesScreen(),
      ),
      GoRoute(
        path: AppRoutes.addAddress,
        builder: (context, state) => const AddressFormScreen(),
      ),
      GoRoute(
        path: AppRoutes.editAddress,
        builder: (context, state) {
          final addressId = state.pathParameters['id']!;
          return AddressFormScreen(addressId: addressId);
        },
      ),
    ],
  );
});
