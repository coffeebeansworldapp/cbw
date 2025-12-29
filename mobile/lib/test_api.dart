import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'core/api/api_client.dart';
import 'core/constants/api_constants.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('API Test')),
        body: const TestScreen(),
      ),
    );
  }
}

class TestScreen extends StatefulWidget {
  const TestScreen({super.key});

  @override
  State<TestScreen> createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  String _result = 'Press button to test API';
  bool _loading = false;

  Future<void> _testProducts() async {
    setState(() {
      _loading = true;
      _result = 'Loading...';
    });

    try {
      developer.log('🔍 Testing products API...', name: 'APITest');

      final response = await ApiClient().get(
        ApiConstants.products,
        queryParameters: {'limit': 3},
      );

      developer.log('✅ Response received', name: 'APITest');
      developer.log('Status: ${response.statusCode}', name: 'APITest');
      developer.log('Data type: ${response.data.runtimeType}', name: 'APITest');
      developer.log('Data keys: ${response.data.keys}', name: 'APITest');
      developer.log('Success: ${response.data['success']}', name: 'APITest');

      if (response.data['success'] == true) {
        final List<dynamic> data =
            response.data['products'] ?? response.data['data'] ?? [];
        developer.log('Products count: ${data.length}', name: 'APITest');
        developer.log(
          'First product: ${data.isNotEmpty ? data[0] : "none"}',
          name: 'APITest',
        );

        setState(() {
          _result =
              'Success!\nFound ${data.length} products\n\n'
              'Response keys: ${response.data.keys.join(", ")}\n\n'
              'First product: ${data.isNotEmpty ? data[0]["name"] : "none"}';
          _loading = false;
        });
      } else {
        setState(() {
          _result = 'API returned success=false';
          _loading = false;
        });
      }
    } catch (e, stack) {
      developer.log(
        '❌ Error: $e',
        name: 'APITest',
        error: e,
        stackTrace: stack,
      );
      setState(() {
        _result = 'Error: $e';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_result, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            if (_loading)
              const CircularProgressIndicator()
            else
              ElevatedButton(
                onPressed: _testProducts,
                child: const Text('Test Products API'),
              ),
          ],
        ),
      ),
    );
  }
}
