import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import '../../../core/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  VideoPlayerController? _videoController;
  bool _videoInitialized = false;

  @override
  void initState() {
    super.initState();
    _initVideo();
  }

  Future<void> _initVideo() async {
    try {
      _videoController = VideoPlayerController.asset(
        'assets/videos/splash.mp4',
      );
      await _videoController!.initialize();
      await _videoController!.setLooping(false);
      await _videoController!.play();

      if (mounted) {
        setState(() => _videoInitialized = true);
      }

      // Listen for video completion
      _videoController!.addListener(_onVideoProgress);
    } catch (e) {
      // If video fails to load, proceed to auth check
      debugPrint('Video failed to load: $e');
      _checkAuth();
    }
  }

  void _onVideoProgress() {
    if (_videoController != null && _videoController!.value.isInitialized) {
      final position = _videoController!.value.position;
      final duration = _videoController!.value.duration;

      // When video ends (or near end), check auth
      if (position >= duration - const Duration(milliseconds: 100)) {
        _videoController!.removeListener(_onVideoProgress);
        _checkAuth();
      }
    }
  }

  Future<void> _checkAuth() async {
    // Restore system UI before navigating away
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) {
      ref.read(authProvider.notifier).checkAuthStatus();
    }
  }

  @override
  void dispose() {
    // Ensure system UI is restored when disposed
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    _videoController?.removeListener(_onVideoProgress);
    _videoController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Hide status bar and navigation bar for true full screen
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

    // Show video if initialized
    if (_videoInitialized && _videoController != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        extendBodyBehindAppBar: true,
        extendBody: true,
        body: SizedBox.expand(
          child: FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: _videoController!.value.size.width,
              height: _videoController!.value.size.height,
              child: VideoPlayer(_videoController!),
            ),
          ),
        ),
      );
    }

    // Show black screen while video is loading (no fallback UI)
    return const Scaffold(
      backgroundColor: Colors.black,
      body: SizedBox.expand(),
    );
  }
}
