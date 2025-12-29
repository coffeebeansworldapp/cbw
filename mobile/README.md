# Coffee Beans World - Mobile App

Flutter mobile application for the Coffee Beans World e-commerce platform.

## Features

- **Authentication**: User registration, login with JWT tokens
- **Home Screen**: Premium beans showcase, categories, featured products
- **Product Catalog**: Browse products by category, search, filtering
- **Product Details**: View variants (weight/grind), pricing, add to cart
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout**: Delivery/pickup options, address selection, Cash on Delivery
- **Orders**: Order history, tracking, status timeline
- **Profile**: User details, saved addresses management

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── core/
│   ├── api/                     # Dio HTTP client, exceptions
│   ├── constants/               # API URLs, app constants, storage keys
│   ├── providers/               # Auth & cart state management
│   ├── router/                  # go_router navigation
│   ├── storage/                 # Secure & local storage services
│   ├── theme/                   # Material 3 app theme
│   └── utils/                   # Formatters, validators
├── models/                      # Data models with JSON serialization
├── widgets/                     # Shared UI components
└── features/
    ├── auth/                    # Login, Register, Splash screens
    ├── home/                    # Home screen, MainShell with bottom nav
    ├── products/                # Product list & detail screens
    ├── cart/                    # Cart screen
    ├── checkout/                # Checkout flow
    ├── orders/                  # Orders list & detail screens
    └── profile/                 # Profile, addresses screens
```

## Tech Stack

- **State Management**: Riverpod
- **Navigation**: go_router
- **HTTP Client**: Dio with JWT interceptor
- **Local Storage**: flutter_secure_storage, shared_preferences
- **Code Generation**: freezed, json_serializable
- **Images**: cached_network_image

## Getting Started

### Prerequisites

- Flutter SDK 3.9.2+
- Dart SDK 3.4+
- iOS Simulator / Android Emulator
- Backend server running on port 4000

### Installation

```bash
# Install dependencies
flutter pub get

# Generate model serialization code
flutter pub run build_runner build --delete-conflicting-outputs

# Run on iOS Simulator
flutter run -d ios

# Run on Android Emulator
flutter run -d android
```

### API Configuration

Update `lib/core/constants/api_constants.dart` for your environment:

```dart
// iOS Simulator uses localhost
static const String baseUrl = 'http://localhost:4000/api';

// Android Emulator uses 10.0.2.2
static const String baseUrl = 'http://10.0.2.2:4000/api';

// Physical device uses machine's IP
static const String baseUrl = 'http://192.168.x.x:4000/api';
```

## App Screenshots

| Home | Products | Cart |
|------|----------|------|
| Premium beans, categories | Product listing with filters | Cart with quantities |

| Product Detail | Checkout | Orders |
|----------------|----------|--------|
| Variants, add to cart | Address, payment | Order history |

## Related Projects

- **Backend**: Express.js API server (`../backend`)
- **Admin Panel**: React admin dashboard (`../admin`)
- **Frontend**: Customer web app (`../frontend`)
