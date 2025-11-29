# Additional UI Screens and Widgets

## Chat Screen (lib/screens/chat_screen.dart)

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/chat_message_model.dart';
import '../services/chat_service.dart';
import '../services/auth_service.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/loading_indicator.dart';

class ChatScreen extends StatefulWidget {
  final int conversationId;
  
  const ChatScreen({
    Key? key,
    required this.conversationId,
  }) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<ChatMessageModel> _messages = [];
  bool _isLoading = true;
  late ChatService _chatService;
  late int _currentUserId;
  
  @override
  void initState() {
    super.initState();
    _initChat();
  }
  
  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
  
  Future<void> _initChat() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    _currentUserId = authService.currentUser?.id ?? 0;
    
    // Create chat service
    final apiService = Provider.of<ApiService>(context, listen: false);
    _chatService = ChatService(apiService);
    
    // Load messages
    await _loadMessages();
    
    // Listen for new messages
    _chatService.listenForNewMessages(widget.conversationId, _currentUserId)
      .listen((message) {
        if (!_messages.any((m) => m.id == message.id)) {
          setState(() {
            _messages.add(message);
          });
          _scrollToBottom();
        }
      });
  }
  
  Future<void> _loadMessages() async {
    try {
      final messages = await _chatService.getMessages(widget.conversationId);
      setState(() {
        _messages = messages;
        _isLoading = false;
      });
      
      // Scroll to bottom after messages load
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading messages: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
  
  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }
  
  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;
    
    _messageController.clear();
    
    try {
      final sentMessage = await _chatService.sendMessage(
        widget.conversationId,
        message,
      );
      
      setState(() {
        _messages.add(sentMessage);
      });
      
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error sending message: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
        elevation: 1,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Messages list
                Expanded(
                  child: _messages.isEmpty
                      ? const Center(
                          child: Text('No messages yet. Start a conversation!'),
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: _messages.length,
                          itemBuilder: (context, index) {
                            final message = _messages[index];
                            final isMe = message.userId == _currentUserId;
                            
                            return ChatBubble(
                              message: message,
                              isMe: isMe,
                            );
                          },
                        ),
                ),
                
                // Message input
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8.0,
                    vertical: 8.0,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        spreadRadius: 1,
                        blurRadius: 3,
                        offset: const Offset(0, -1),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Attachment button
                      IconButton(
                        icon: const Icon(Icons.attach_file),
                        onPressed: () {
                          // Implement attachment functionality
                        },
                      ),
                      
                      // Text input
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          decoration: const InputDecoration(
                            hintText: 'Type a message...',
                            border: InputBorder.none,
                          ),
                          textCapitalization: TextCapitalization.sentences,
                          keyboardType: TextInputType.multiline,
                          maxLines: null,
                        ),
                      ),
                      
                      // Send button
                      IconButton(
                        icon: const Icon(Icons.send),
                        color: Theme.of(context).primaryColor,
                        onPressed: _sendMessage,
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
```

## Notification Screen (lib/screens/notification_screen.dart)

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';

class NotificationScreen extends StatefulWidget {
  final NotificationModel notification;
  
  const NotificationScreen({
    Key? key,
    required this.notification,
  }) : super(key: key);

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  @override
  void initState() {
    super.initState();
    _markAsRead();
  }
  
  Future<void> _markAsRead() async {
    if (!widget.notification.read) {
      final notificationService = Provider.of<NotificationService>(context, listen: false);
      await notificationService.markAsRead(widget.notification.id);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Text(
              widget.notification.title,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            
            // Timestamp
            Text(
              _formatTimestamp(widget.notification.timestamp),
              style: const TextStyle(
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 16),
            
            // Divider
            const Divider(),
            const SizedBox(height: 16),
            
            // Body
            Text(
              widget.notification.body,
              style: const TextStyle(
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 24),
            
            // Data section if available
            if (widget.notification.data.isNotEmpty) ...[
              const Text(
                'Additional Information',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              
              // Display data
              ...widget.notification.data.entries.map((entry) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${entry.key}: ',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          entry.value.toString(),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ],
          ],
        ),
      ),
    );
  }
  
  String _formatTimestamp(int timestamp) {
    final date = DateTime.fromMillisecondsSinceEpoch(timestamp);
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
```

## Chat Bubble Widget (lib/widgets/chat_bubble.dart)

```dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/chat_message_model.dart';

class ChatBubble extends StatelessWidget {
  final ChatMessageModel message;
  final bool isMe;
  
  const ChatBubble({
    Key? key,
    required this.message,
    required this.isMe,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar (only for received messages)
          if (!isMe) ...[
            CircleAvatar(
              radius: 16,
              backgroundImage: message.sender.profilePhotoUrl != null
                  ? NetworkImage(message.sender.profilePhotoUrl!)
                  : null,
              child: message.sender.profilePhotoUrl == null
                  ? Text(message.sender.name.substring(0, 1))
                  : null,
            ),
            const SizedBox(width: 8),
          ],
          
          // Message content
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 10.0,
              ),
              decoration: BoxDecoration(
                color: isMe
                    ? Theme.of(context).primaryColor
                    : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sender name (only for received messages)
                  if (!isMe) ...[
                    Text(
                      message.sender.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                  ],
                  
                  // Message text
                  Text(
                    message.body,
                    style: TextStyle(
                      color: isMe ? Colors.white : Colors.black,
                    ),
                  ),
                  
                  // Timestamp
                  Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Text(
                      _formatTimestamp(message.timestamp),
                      style: TextStyle(
                        fontSize: 10,
                        color: isMe ? Colors.white70 : Colors.black54,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Space after sent messages
          if (isMe) const SizedBox(width: 8),
        ],
      ),
    );
  }
  
  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(
      timestamp.year,
      timestamp.month,
      timestamp.day,
    );
    
    if (messageDate == today) {
      return DateFormat.Hm().format(timestamp);
    } else {
      return DateFormat.MMMd().add_Hm().format(timestamp);
    }
  }
}
```

## Loading Indicator Widget (lib/widgets/loading_indicator.dart)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class LoadingIndicator extends StatelessWidget {
  final double size;
  final Color color;
  
  const LoadingIndicator({
    Key? key,
    this.size = 24.0,
    this.color = Colors.blue,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SpinKitFadingCircle(
        color: color,
        size: size,
      ),
    );
  }
}
```
