import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../services/chatbot_service.dart';
import '../providers/auth_provider.dart';
import '../core/navigator_key.dart';

class GitaChatbotWidget extends StatefulWidget {
  const GitaChatbotWidget({super.key});

  @override
  State<GitaChatbotWidget> createState() => _GitaChatbotWidgetState();
}

class _GitaChatbotWidgetState extends State<GitaChatbotWidget> {
  bool _isOpen = false;
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<String> _quickActions = [
    'Apa itu LPJ?',
    'Apa itu KAK?',
    'Syarat LPJ',
    'Format KAK',
  ];

  void _toggleChat() {
    setState(() {
      _isOpen = !_isOpen;
    });
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final chatbotService = context.watch<ChatbotService>();
    
    if (!chatbotService.isVisible) return const SizedBox.shrink();

    final bottomPadding = chatbotService.bottomPadding;

    return Stack(
      children: [
        // Chat Window
        Positioned(
          left: 16,
          right: 16,
          bottom: bottomPadding + 70, // Just above the FAB
          child: Align(
            alignment: Alignment.bottomRight,
            child: AnimatedScale(
              scale: _isOpen ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 250),
              curve: _isOpen ? Curves.easeOutBack : Curves.easeIn,
              alignment: Alignment.bottomRight,
              child: AnimatedOpacity(
                opacity: _isOpen ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 200),
                child: IgnorePointer(
                  ignoring: !_isOpen,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 320),
                    child: SizedBox(
                      height: MediaQuery.of(context).size.height * 0.5,
                      child: Material(
                        elevation: 12,
                        borderRadius: BorderRadius.circular(24),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                          ),
                          child: Column(
                            children: [
                              // Header
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF33C8DA), Color(0xFF2BA9B8)],
                                  ),
                                  borderRadius: BorderRadius.vertical(top: Radius.circular(23)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.forum_rounded, color: Colors.white, size: 20),
                                    const SizedBox(width: 10),
                                    const Expanded(
                                      child: Text(
                                        'GITA (Asisten Digital)',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline_rounded, color: Colors.white, size: 20),
                                      onPressed: () {
                                        // Hide chat window temporarily to show dialog on top
                                        setState(() => _isOpen = false);
                                        
                                        navigatorKey.currentState!.push(
                                          DialogRoute(
                                            context: navigatorKey.currentContext!,
                                            builder: (ctx) => AlertDialog(
                                              title: const Text('Hapus Riwayat?'),
                                              content: const Text('Semua obrolan akan dihapus permanen.'),
                                              actions: [
                                                TextButton(
                                                  onPressed: () => Navigator.pop(ctx),
                                                  child: const Text('Batal'),
                                                ),
                                                TextButton(
                                                  onPressed: () {
                                                    context.read<ChatbotService>().clearHistory();
                                                    Navigator.pop(ctx);
                                                  },
                                                  child: const Text('Hapus', style: TextStyle(color: Colors.red)),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ).then((_) {
                                          // Reopen chat window after dialog is closed
                                          if (mounted) {
                                            setState(() => _isOpen = true);
                                          }
                                        });
                                      },
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.close_rounded, color: Colors.white),
                                      onPressed: _toggleChat,
                                    ),
                                  ],
                                ),
                              ),

                              // Quick Actions
                              Container(
                                height: 45,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                color: Colors.grey[50],
                                child: ListView.separated(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  scrollDirection: Axis.horizontal,
                                  itemCount: _quickActions.length,
                                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                                  itemBuilder: (ctx, i) => Material(
                                    color: Colors.transparent,
                                    child: ActionChip(
                                      label: Text(_quickActions[i], style: const TextStyle(fontSize: 11)),
                                      backgroundColor: Colors.white,
                                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                                      onPressed: () => context.read<ChatbotService>().sendMessage(_quickActions[i]),
                                    ),
                                  ),
                                ),
                              ),

                              // Messages Area
                              Expanded(
                                child: Consumer<ChatbotService>(
                                  builder: (context, service, _) {
                                    _scrollToBottom();
                                    return ListView.builder(
                                      controller: _scrollController,
                                      padding: const EdgeInsets.all(16),
                                      itemCount: service.messages.length + (service.isLoading ? 1 : 0),
                                      itemBuilder: (ctx, i) {
                                        if (i == service.messages.length) {
                                          return const Align(
                                            alignment: Alignment.centerLeft,
                                            child: Padding(
                                              padding: EdgeInsets.only(top: 8),
                                              child: Text(
                                                'GITA sedang berpikir...',
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  fontStyle: FontStyle.italic,
                                                  color: Colors.grey,
                                                ),
                                              ),
                                            ),
                                          );
                                        }
                                        final m = service.messages[i];
                                        final isUser = m['sender'] == 'user';
                                        return Align(
                                          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                                          child: Container(
                                            margin: const EdgeInsets.only(bottom: 12),
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                            decoration: BoxDecoration(
                                              color: isUser ? const Color(0xFF33C8DA) : const Color(0xFFF1F5F9),
                                              borderRadius: BorderRadius.only(
                                                topLeft: const Radius.circular(16),
                                                topRight: const Radius.circular(16),
                                                bottomLeft: isUser ? const Radius.circular(16) : Radius.zero,
                                                bottomRight: isUser ? Radius.zero : const Radius.circular(16),
                                              ),
                                            ),
                                            child: Text(
                                              m['text'] ?? '',
                                              style: TextStyle(
                                                color: isUser ? Colors.white : Colors.black87,
                                                fontSize: 13,
                                              ),
                                            ),
                                          ),
                                        );
                                      },
                                    );
                                  },
                                ),
                              ),

                              // Input Area
                              Padding(
                                padding: const EdgeInsets.all(12),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: _controller,
                                        decoration: InputDecoration(
                                          hintText: 'Tulis pesan...',
                                          hintStyle: const TextStyle(fontSize: 13),
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
                                          focusedBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(30),
                                            borderSide: const BorderSide(color: Color(0xFF33C8DA)),
                                          ),
                                        ),
                                        style: const TextStyle(fontSize: 13),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    IconButton.filled(
                                      onPressed: () {
                                        if (_controller.text.isNotEmpty) {
                                          context.read<ChatbotService>().sendMessage(_controller.text);
                                          _controller.clear();
                                        }
                                      },
                                      icon: const Icon(Icons.send_rounded),
                                      style: IconButton.styleFrom(backgroundColor: const Color(0xFF33C8DA)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),

        // Floating Button
        Positioned(
          right: 20,
          bottom: bottomPadding,
          child: GestureDetector(
            onTap: _toggleChat,
            child: Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF33C8DA), Color(0xFF2BA9B8)],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF33C8DA).withOpacity(0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(
                Icons.forum_rounded,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
