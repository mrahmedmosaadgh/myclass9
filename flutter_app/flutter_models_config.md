# Model Classes and Configuration Files

## User Model (lib/models/user_model.dart)

```dart
class UserModel {
  final int id;
  final String name;
  final String email;
  final String? profilePhotoUrl;
  final DateTime? emailVerifiedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.profilePhotoUrl,
    this.emailVerifiedAt,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      profilePhotoUrl: json['profile_photo_url'],
      emailVerifiedAt: json['email_verified_at'] != null
          ? DateTime.parse(json['email_verified_at'])
          : null,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'profile_photo_url': profilePhotoUrl,
      'email_verified_at': emailVerifiedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
```

## Notification Model (lib/models/notification_model.dart)

```dart
class NotificationModel {
  final String id;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  final int timestamp;
  final bool read;
  
  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.data,
    required this.timestamp,
    required this.read,
  });
  
  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      title: json['title'],
      body: json['body'],
      data: json['data'],
      timestamp: json['timestamp'],
      read: json['read'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'data': data,
      'timestamp': timestamp,
      'read': read,
    };
  }
  
  NotificationModel copyWith({
    String? id,
    String? title,
    String? body,
    Map<String, dynamic>? data,
    int? timestamp,
    bool? read,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      data: data ?? this.data,
      timestamp: timestamp ?? this.timestamp,
      read: read ?? this.read,
    );
  }
}
```

## Chat Message Model (lib/models/chat_message_model.dart)

```dart
class ChatMessageModel {
  final int id;
  final int conversationId;
  final int userId;
  final String body;
  final DateTime timestamp;
  final String? attachment;
  final bool isRead;
  final UserInfo sender;
  
  ChatMessageModel({
    required this.id,
    required this.conversationId,
    required this.userId,
    required this.body,
    required this.timestamp,
    this.attachment,
    required this.isRead,
    required this.sender,
  });
  
  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'],
      conversationId: json['conversation_id'],
      userId: json['user_id'],
      body: json['body'],
      timestamp: DateTime.parse(json['created_at']),
      attachment: json['attachment'],
      isRead: json['is_read'] ?? false,
      sender: UserInfo.fromJson(json['user']),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversation_id': conversationId,
      'user_id': userId,
      'body': body,
      'created_at': timestamp.toIso8601String(),
      'attachment': attachment,
      'is_read': isRead,
      'user': sender.toJson(),
    };
  }
}

class UserInfo {
  final int id;
  final String name;
  final String? profilePhotoUrl;
  
  UserInfo({
    required this.id,
    required this.name,
    this.profilePhotoUrl,
  });
  
  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      id: json['id'],
      name: json['name'],
      profilePhotoUrl: json['profile_photo_url'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'profile_photo_url': profilePhotoUrl,
    };
  }
}
```

## API Configuration (lib/config/api_config.dart)

```dart
class ApiConfig {
  // Base URL for API requests
  static const String baseUrl = 'http://192.168.57.180:8000'; // Replace with your Laravel app URL
  
  // API endpoints
  static const String login = '/api/login';
  static const String register = '/api/register';
  static const String user = '/api/user';
  static const String conversations = '/api/conversations';
  static const String deviceTokens = '/api/device-tokens';
  static const String notifications = '/api/notifications';
  
  // Timeout durations
  static const int connectTimeout = 15000; // 15 seconds
  static const int receiveTimeout = 15000; // 15 seconds
}
```

## App Configuration (lib/config/app_config.dart)

```dart
class AppConfig {
  // App name
  static const String appName = 'ChatMe';
  
  // Firebase project ID
  static const String firebaseProjectId = 'chatme-21ea6';
  
  // Notification settings
  static const String notificationChannelId = 'high_importance_channel';
  static const String notificationChannelName = 'High Importance Notifications';
  static const String notificationChannelDescription = 'This channel is used for important notifications.';
  
  // Local storage keys
  static const String authTokenKey = 'auth_token';
  static const String fcmTokenKey = 'fcm_token';
  static const String notificationsKey = 'notifications';
  
  // App settings
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;
  static const int cacheExpirationDays = 7;
  
  // Theme settings
  static const int primaryColor = 0xFF1976D2; // Material Blue
  static const int accentColor = 0xFF26A69A; // Teal
}
```
