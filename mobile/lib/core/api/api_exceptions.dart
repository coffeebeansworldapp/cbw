class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;
  final dynamic details;

  ApiException({
    required this.message,
    this.statusCode,
    this.code,
    this.details,
  });

  factory ApiException.fromResponse(
    Map<String, dynamic> response,
    int? statusCode,
  ) {
    return ApiException(
      message: response['message'] ?? 'An error occurred',
      statusCode: statusCode,
      code: response['code'],
      details: response['details'],
    );
  }

  @override
  String toString() =>
      'ApiException: $message (code: $code, status: $statusCode)';
}

class NetworkException implements Exception {
  final String message;

  NetworkException([this.message = 'Network error occurred']);

  @override
  String toString() => 'NetworkException: $message';
}

class AuthException implements Exception {
  final String message;

  AuthException([this.message = 'Authentication required']);

  @override
  String toString() => 'AuthException: $message';
}
