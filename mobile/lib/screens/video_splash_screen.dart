import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';

class VideoSplashScreen extends StatefulWidget {
  final VoidCallback onFinished;

  const VideoSplashScreen({super.key, required this.onFinished});

  @override
  State<VideoSplashScreen> createState() => _VideoSplashScreenState();
}

class _VideoSplashScreenState extends State<VideoSplashScreen> {
  late VideoPlayerController _controller;
  bool _initialized = false;
  bool _finished = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    _controller = VideoPlayerController.asset('assets/videos/introm.mp4');
    _controller.initialize().then((_) {
      if (mounted) {
        setState(() {
          _initialized = true;
        });
        _controller.play();
      }
    }).catchError((error) {
      debugPrint('Video player initialization failed: $error');
      _finish();
    });

    _controller.addListener(_checkVideoStatus);
  }

  void _checkVideoStatus() {
    if (_controller.value.position >= _controller.value.duration &&
        _controller.value.isInitialized &&
        !_controller.value.isPlaying) {
      _finish();
    }
  }

  void _finish() {
    if (_finished) return;
    _finished = true;
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    widget.onFinished();
  }

  @override
  void dispose() {
    _controller.removeListener(_checkVideoStatus);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SizedBox.expand(
        child: _initialized
            ? FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: _controller.value.size.width,
                  height: _controller.value.size.height,
                  child: VideoPlayer(_controller),
                ),
              )
            : const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
