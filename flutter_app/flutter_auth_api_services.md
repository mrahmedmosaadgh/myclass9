# Authentication and API Services for Flutter App

## Authentication Service (lib/services/auth_service.dart)

```dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';

class AuthService extends ChangeNotifier {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  UserModel? _currentUser;
  String? _token;
  bool _isLoading = false;
  
  UserModel? get currentUser => _currentUser;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;
  
  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      _token = token;
      await _getUserProfile();
      return true;
    }
    return false;
  }
  
  // Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['token'];
        await _storage.write(key: 'auth_token', value: _token);
        await _getUserProfile();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  // Register device token
  Future<bool> registerDeviceToken(String fcmToken) async {
    if (_token == null) return false;
    
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/device-tokens'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: json.encode({
          'token': fcmToken,
          'device_type': defaultTargetPlatform.name.toLowerCase(),
        }),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
  
  // Get user profile
  Future<void> _getUserProfile() async {
    if (_token == null) return;
    
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/user'),
        headers: {
          'Authorization': 'Bearer $_token',
        },
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _currentUser = UserModel.fromJson(data);
        notifyListeners();
      }
    } catch (e) {
      print('Error getting user profile: $e');
    }
  }
  
  // Logout
  Future<void> logout() async {
    if (_token != null) {
      try {
        // Get FCM token
        final fcmToken = await _storage.read(key: 'fcm_token');
        
        if (fcmToken != null) {
          // Unregister device token
          await http.delete(
            Uri.parse('${ApiConfig.baseUrl}/api/device-tokens'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_token',
            },
            body: json.encode({
              'token': fcmToken,
            }),
          );
        }
        
        // Logout from server
        await http.post(
          Uri.parse('${ApiConfig.baseUrl}/api/logout'),
          headers: {
            'Authorization': 'Bearer $_token',
          },
        );
      } catch (e) {
        print('Error during logout: $e');
      }
    }
    
    // Clear local storage
    await _storage.delete(key: 'auth_token');
    _token = null;
    _currentUser = null;
    notifyListeners();
  }
}
```

## API Service (lib/services/api_service.dart)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/chat_message_model.dart';

class ApiService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  // Get auth token
  Future<String?> _getToken() async {
    return await _storage.read(key: 'auth_token');
  }
  
  // Create headers with auth token
  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
  
  // Generic GET request
  Future<dynamic> get(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/$endpoint'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load data: ${response.statusCode}');
    }
  }
  
  // Generic POST request
  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/$endpoint'),
      headers: headers,
      body: json.encode(data),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to post data: ${response.statusCode}');
    }
  }
  
  // Get conversations
  Future<List<dynamic>> getConversations() async {
    final data = await get('api/conversations');
    return data['conversations'];
  }
  
  // Get messages for a conversation
  Future<List<ChatMessageModel>> getMessages(int conversationId) async {
    final data = await get('api/conversations/$conversationId/messages');
    return (data['messages'] as List)
        .map((message) => ChatMessageModel.fromJson(message))
        .toList();
  }
  
  // Send a message
  Future<ChatMessageModel> sendMessage(int conversationId, String message) async {
    final data = await post('api/conversations/$conversationId/messages', {
      'body': message,
    });
    return ChatMessageModel.fromJson(data['message']);
  }
  
  // Get unread notifications count
  Future<int> getUnreadNotificationsCount() async {
    final data = await get('api/notifications/unread-count');
    return data['count'];
  }
  
  // Mark notification as read
  Future<void> markNotificationAsRead(String notificationId) async {
    await post('api/notifications/$notificationId/read', {});
  }
}
```

## Chat Service (lib/services/chat_service.dart)

```dart
import 'dart:async';
import 'package:firebase_database/firebase_database.dart';
import '../models/chat_message_model.dart';
import 'api_service.dart';

class ChatService {
  final ApiService _apiService;
  final FirebaseDatabase _database = FirebaseDatabase.instance;
  
  ChatService(this._apiService);
  
  // Listen for new messages in a conversation
  Stream<ChatMessageModel> listenForNewMessages(int conversationId, int userId) {
    final controller = StreamController<ChatMessageModel>();
    
    // Listen to Firebase for real-time updates
    final ref = _database.ref('private_chat_notifications/$userId/$conversationId');
    ref.onChildAdded.listen((event) async {
      // When a new notification is added, fetch the actual message from the API
      try {
        final messages = await _apiService.getMessages(conversationId);
        if (messages.isNotEmpty) {
          // Find the newest message
          final latestMessage = messages.reduce((a, b) => 
            a.timestamp.isAfter(b.timestamp) ? a : b);
          controller.add(latestMessage);
        }
      } catch (e) {
        print('Error fetching new message: $e');
      }
    });
    
    return controller.stream;
  }
  
  // Send a message
  Future<ChatMessageModel> sendMessage(int conversationId, String message) async {
    return await _apiService.sendMessage(conversationId, message);
  }
  
  // Get messages for a conversation
  Future<List<ChatMessageModel>> getMessages(int conversationId) async {
    return await _apiService.getMessages(conversationId);
  }
  
  // Get conversations
  Future<List<dynamic>> getConversations() async {
    return await _apiService.getConversations();
  }
}
```
