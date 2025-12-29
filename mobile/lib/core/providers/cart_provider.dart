import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/local_storage.dart';
import '../../models/cart.dart';
import '../../models/product.dart';

class CartNotifier extends StateNotifier<Cart> {
  CartNotifier() : super(Cart()) {
    _loadCart();
  }

  void _loadCart() {
    final cartJson = LocalStorageService.getCartItems();
    if (cartJson != null) {
      try {
        final List<dynamic> items = json.decode(cartJson);
        final cartItems = items.map((e) => CartItem.fromJson(e)).toList();
        state = Cart(items: cartItems);
      } catch (e) {
        // Invalid cart data, start fresh
        state = Cart();
      }
    }
  }

  Future<void> _saveCart() async {
    final cartJson = json.encode(state.items.map((e) => e.toJson()).toList());
    await LocalStorageService.saveCartItems(cartJson);
  }

  void addToCart(Product product, ProductVariant variant, int qty) {
    final item = CartItem.fromProduct(product, variant, qty);
    state = state.addItem(item);
    _saveCart();
  }

  void updateQuantity(String productId, String variantId, int qty) {
    state = state.updateItemQty(productId, variantId, qty);
    _saveCart();
  }

  void removeFromCart(String productId, String variantId) {
    state = state.removeItem(productId, variantId);
    _saveCart();
  }

  void clearCart() {
    state = state.clear();
    _saveCart();
  }

  bool isInCart(String productId, String variantId) {
    return state.items.any(
      (item) => item.productId == productId && item.variantId == variantId,
    );
  }

  int getItemQuantity(String productId, String variantId) {
    final item = state.items.firstWhere(
      (item) => item.productId == productId && item.variantId == variantId,
      orElse: () => CartItem(
        productId: '',
        variantId: '',
        productName: '',
        variantLabel: '',
        unitPrice: 0,
        qty: 0,
      ),
    );
    return item.qty;
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, Cart>((ref) {
  return CartNotifier();
});

// Computed providers
final cartItemCountProvider = Provider<int>((ref) {
  return ref.watch(cartProvider).totalItems;
});

final cartSubtotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider).subtotal;
});
