# Flutter App Structure for Laravel Chat Notifications

## Project Structure
```
chatme_app/
├── android/
│   └── app/
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml
│               └── res/
│                   └── values/
│                       └── strings.xml
├── ios/
│   └── Runner/
│       ├── AppDelegate.swift
│       └── Info.plist
├── lib/
│   ├── main.dart
│   ├── firebase_options.dart
│   ├── config/
│   │   ├── api_config.dart
│   │   └── app_config.dart
│   ├── models/
│   │   ├── user_model.dart
│   │   ├── notification_model.dart
│   │   └── chat_message_model.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── api_service.dart
│   │   ├── notification_service.dart
│   │   └── chat_service.dart
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── chat_screen.dart
│   │   └── notification_screen.dart
│   ├── widgets/
│   │   ├── notification_item.dart
│   │   ├── chat_bubble.dart
│   │   └── loading_indicator.dart
│   └── utils/
│       ├── notification_helper.dart
│       └── storage_helper.dart
├── pubspec.yaml
└── README.md
```

## Key Files and Their Purpose

### Configuration Files
- **firebase_options.dart**: Contains Firebase configuration for the Flutter app
- **api_config.dart**: Contains API endpoints and configuration
- **app_config.dart**: Contains app-wide configuration settings

### Service Files
- **auth_service.dart**: Handles authentication with Laravel backend
- **api_service.dart**: Handles API requests to Laravel backend
- **notification_service.dart**: Manages Firebase Cloud Messaging
- **chat_service.dart**: Handles chat functionality

### Model Files
- **user_model.dart**: User data model
- **notification_model.dart**: Notification data model
- **chat_message_model.dart**: Chat message data model

### Screen Files
- **login_screen.dart**: Login screen
- **home_screen.dart**: Main screen with notification summary
- **chat_screen.dart**: Chat interface
- **notification_screen.dart**: Detailed notification view

### Widget Files
- **notification_item.dart**: Individual notification display
- **chat_bubble.dart**: Chat message bubble
- **loading_indicator.dart**: Loading indicator for async operations

### Utility Files
- **notification_helper.dart**: Helper functions for notifications
- **storage_helper.dart**: Local storage helper functions
