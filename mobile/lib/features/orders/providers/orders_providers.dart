import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../models/order.dart';

// Orders list provider
final ordersProvider = FutureProvider<List<Order>>((ref) async {
  final response = await ApiClient().get(ApiConstants.orders);

  if (response.data['success'] == true) {
    final List<dynamic> data =
        response.data['orders'] ?? response.data['data'] ?? [];
    return data.map((e) => Order.fromJson(e)).toList();
  }
  throw Exception('Failed to load orders');
});

// Single order detail provider
final orderDetailProvider = FutureProvider.family<Order, String>((
  ref,
  orderId,
) async {
  final response = await ApiClient().get('${ApiConstants.orders}/$orderId');

  if (response.data['success'] == true) {
    return Order.fromJson(response.data['order'] ?? response.data['data']);
  }
  throw Exception('Failed to load order');
});

// Create order provider
class CreateOrderState {
  final bool isLoading;
  final String? error;
  final Order? order;

  const CreateOrderState({this.isLoading = false, this.error, this.order});

  CreateOrderState copyWith({bool? isLoading, String? error, Order? order}) {
    return CreateOrderState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      order: order ?? this.order,
    );
  }
}

class CreateOrderNotifier extends StateNotifier<CreateOrderState> {
  CreateOrderNotifier() : super(const CreateOrderState());

  Future<Order?> createOrder({
    required List<Map<String, dynamic>> items,
    required String fulfillmentType,
    Map<String, dynamic>? addressSnapshot,
    String? notes,
    required String paymentMethod,
  }) async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      final response = await ApiClient().post(
        ApiConstants.orders,
        data: {
          'items': items,
          'fulfillment': {
            'type': fulfillmentType,
            if (addressSnapshot != null) 'addressSnapshot': addressSnapshot,
            if (notes != null) 'notes': notes,
          },
          'payment': {'method': paymentMethod},
        },
      );

      if (response.data['success'] == true) {
        final order = Order.fromJson(
          response.data['order'] ?? response.data['data'],
        );
        state = state.copyWith(isLoading: false, order: order);
        return order;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.data['message'] ?? 'Failed to create order',
        );
        return null;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to create order. Please try again.',
      );
      return null;
    }
  }

  void reset() {
    state = const CreateOrderState();
  }
}

final createOrderProvider =
    StateNotifierProvider<CreateOrderNotifier, CreateOrderState>((ref) {
      return CreateOrderNotifier();
    });
