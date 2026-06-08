import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class ChatbotService extends ChangeNotifier {
  final List<Map<String, String>> _messages = [];
  bool _isLoading = false;
  bool _isVisible = true;
  double _bottomPadding = 20.0;

  List<Map<String, String>> get messages => _messages;
  bool get isLoading => _isLoading;
  bool get isVisible => _isVisible;
  double get bottomPadding => _bottomPadding;

  ChatbotService() {
    _loadHistory();
  }

  void setVisible(bool visible) {
    if (_isVisible != visible) {
      _isVisible = visible;
      notifyListeners();
    }
  }

  void setBottomPadding(double padding) {
    if (_bottomPadding != padding) {
      _bottomPadding = padding;
      notifyListeners();
    }
  }

  Future<void> _loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final historyJson = prefs.getString('sigap_chat_history');
    if (historyJson != null) {
      final List<dynamic> list = jsonDecode(historyJson);
      _messages.addAll(list.map((e) => Map<String, String>.from(e)));
    } else {
      _messages.add({
        'sender': 'bot',
        'text': 'Halo! Saya asisten LPJ & KAK. Bagaimana saya bisa membantu Anda hari ini?'
      });
    }
    notifyListeners();
  }

  Future<void> _saveHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('sigap_chat_history', jsonEncode(_messages));
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty || _isLoading) return;

    _messages.add({'sender': 'user', 'text': text});
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.post('/chatbot/chat', {'message': text});
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _messages.add({'sender': 'bot', 'text': data['reply']});
      } else if (response.statusCode == 429) {
        _messages.add({
          'sender': 'bot',
          'text': 'Terlalu banyak permintaan. Mohon tunggu sebentar.'
        });
      } else {
        _messages.add({
          'sender': 'bot',
          'text': 'Terjadi kesalahan saat menghubungi asisten. Silakan coba lagi.'
        });
      }
    } catch (e) {
      _messages.add({
        'sender': 'bot',
        'text': 'Koneksi bermasalah. Pastikan internet Anda aktif.'
      });
    } finally {
      _isLoading = false;
      await _saveHistory();
      notifyListeners();
    }
  }

  void clearHistory() async {
    _messages.clear();
    _messages.add({
      'sender': 'bot',
      'text': 'Halo! Saya asisten LPJ & KAK. Bagaimana saya bisa membantu Anda hari ini?'
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('sigap_chat_history');
    notifyListeners();
  }
}
