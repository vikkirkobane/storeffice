# STOREFFICE FLUTTER INTEGRATION GUIDE

## Overview

The Storeffice database schema has been designed to be **fully compatible with both Flutter mobile app and Next.js web app**. This guide covers everything needed for seamless Flutter integration.

## 🚀 Schema Features for Flutter

### ✅ Mobile-Optimized Fields

**Profiles Table:**
```sql
-- Flutter-specific fields
device_tokens TEXT[], -- FCM tokens for push notifications
preferences JSONB, -- App preferences, language settings
last_seen TIMESTAMP, -- For online status
app_version TEXT, -- Track app version compatibility
platform TEXT, -- 'flutter', 'ios', 'android'
is_online BOOLEAN, -- Real-time online status
```

**All Listing Tables (office_spaces, storage_spaces, products):**
```sql
-- Mobile optimization
thumbnail_photo TEXT, -- Compressed images for mobile lists
search_keywords TEXT[], -- Optimized mobile search
view_count INTEGER, -- Track listing views
favorite_count INTEGER, -- Track favorites
is_featured BOOLEAN, -- Promoted listings
verification_status TEXT -- Content verification
```

**Orders Table:**
```sql
-- Mobile tracking features
tracking_number TEXT,
estimated_delivery TIMESTAMP,
actual_delivery TIMESTAMP,
delivery_instructions TEXT
```

**Notifications Table:**
```sql
-- Push notification fields
click_action TEXT, -- Deep links for mobile
image_url TEXT, -- Rich notification images
sound TEXT, -- Custom notification sounds
badge_count INTEGER, -- App badge counter
is_sent BOOLEAN, -- Track delivery status
expires_at TIMESTAMP -- Notification expiry
```

### 🔐 Flutter-Specific Functions

**1. Online Status Management:**
```sql
-- Update user's last seen and online status
SELECT public.update_last_seen();

-- Set user offline
SELECT public.set_user_offline();
```

**2. Push Notification Token Management:**
```sql
-- Update FCM device token
SELECT public.update_device_token('fcm_token_here', 'flutter');
```

**3. Location-Based Queries:**
```sql
-- Get nearby office spaces (perfect for mobile maps)
SELECT * FROM public.get_nearby_office_spaces(
  40.7128, -- user latitude
  -74.0060, -- user longitude
  10 -- radius in kilometers
);
```

## 📱 Flutter SDK Integration

### 1. Supabase Flutter Setup

```dart
// pubspec.yaml
dependencies:
  supabase_flutter: ^2.0.0
  geolocator: ^9.0.0
  firebase_messaging: ^14.0.0
```

```dart
// main.dart
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  );
  runApp(MyApp());
}

final supabase = Supabase.instance.client;
```

### 2. Authentication with Platform Tracking

```dart
// auth_service.dart
class AuthService {
  static Future<AuthResponse> signUp({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
  }) async {
    return await supabase.auth.signUp(
      email: email,
      password: password,
      data: {
        'first_name': firstName,
        'last_name': lastName,
        'platform': 'flutter',
      },
    );
  }

  static Future<void> updateOnlineStatus() async {
    await supabase.rpc('update_last_seen');
  }

  static Future<void> setOffline() async {
    await supabase.rpc('set_user_offline');
  }
}
```

### 3. Push Notifications Setup

```dart
// notification_service.dart
import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  static Future<void> setupPushNotifications() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    
    // Request permissions
    NotificationSettings settings = await messaging.requestPermission();
    
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // Get FCM token
      String? token = await messaging.getToken();
      
      if (token != null) {
        // Update token in database
        await supabase.rpc('update_device_token', params: {
          'token': token,
          'platform': 'flutter'
        });
      }
    }
    
    // Handle foreground notifications
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // Show in-app notification
      _showNotification(message);
    });
    
    // Handle notification tap
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationTap(message);
    });
  }

  static void _handleNotificationTap(RemoteMessage message) {
    // Handle deep links
    String? clickAction = message.data['click_action'];
    if (clickAction != null) {
      // Navigate to specific screen based on click_action
      _navigateToScreen(clickAction);
    }
  }
}
```

### 4. Real-time Features

```dart
// realtime_service.dart
class RealtimeService {
  static RealtimeChannel? _messagesChannel;
  static RealtimeChannel? _notificationsChannel;

  static void subscribeToMessages(String userId) {
    _messagesChannel = supabase
        .channel('messages:$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'receiver_id',
            value: userId,
          ),
          callback: (payload) {
            // Handle new message
            _handleNewMessage(payload.newRecord);
          },
        )
        .subscribe();
  }

  static void subscribeToNotifications(String userId) {
    _notificationsChannel = supabase
        .channel('notifications:$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            // Handle new notification
            _handleNewNotification(payload.newRecord);
          },
        )
        .subscribe();
  }
}
```

### 5. Location-Based Features

```dart
// location_service.dart
import 'package:geolocator/geolocator.dart';

class LocationService {
  static Future<List<Map<String, dynamic>>> getNearbyOfficeSpaces() async {
    Position position = await Geolocator.getCurrentPosition();
    
    final response = await supabase.rpc('get_nearby_office_spaces', params: {
      'user_lat': position.latitude,
      'user_lng': position.longitude,
      'radius_km': 10,
    });
    
    return List<Map<String, dynamic>>.from(response);
  }
}
```

### 6. Offline Support

```dart
// cache_service.dart
import 'package:hive/hive.dart';

class CacheService {
  static late Box _cacheBox;

  static Future<void> init() async {
    _cacheBox = await Hive.openBox('storeffice_cache');
  }

  static Future<void> cacheOfficeSpaces(List<Map<String, dynamic>> spaces) async {
    await _cacheBox.put('office_spaces', spaces);
  }

  static List<Map<String, dynamic>>? getCachedOfficeSpaces() {
    return _cacheBox.get('office_spaces')?.cast<Map<String, dynamic>>();
  }

  static Future<void> syncWhenOnline() async {
    // Sync cached data when connection restored
    if (await _hasConnection()) {
      // Upload cached data
      await _uploadCachedData();
      // Download latest data
      await _downloadLatestData();
    }
  }
}
```

## 🏗️ Flutter App Architecture

### Recommended Folder Structure

```
lib/
├── main.dart
├── app/
│   ├── app.dart
│   └── routes.dart
├── core/
│   ├── constants/
│   ├── services/
│   │   ├── supabase_service.dart
│   │   ├── auth_service.dart
│   │   ├── notification_service.dart
│   │   └── location_service.dart
│   └── utils/
├── features/
│   ├── auth/
│   ├── office_spaces/
│   ├── storage_spaces/
│   ├── products/
│   ├── bookings/
│   ├── orders/
│   ├── messages/
│   └── profile/
└── shared/
    ├── models/
    │   ├── user.dart
    │   ├── office_space.dart
    │   ├── storage_space.dart
    │   ├── product.dart
    │   └── booking.dart
    ├── widgets/
    └── providers/
```

### Data Models

```dart
// models/user.dart
class UserProfile {
  final String id;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? profilePhoto;
  final List<String> roles;
  final List<String> deviceTokens;
  final Map<String, dynamic> preferences;
  final DateTime? lastSeen;
  final String? platform;
  final bool isVerified;
  final bool isActive;
  final bool isOnline;

  UserProfile({
    required this.id,
    required this.email,
    this.firstName,
    this.lastName,
    this.phone,
    this.profilePhoto,
    this.roles = const ['customer'],
    this.deviceTokens = const [],
    this.preferences = const {},
    this.lastSeen,
    this.platform,
    this.isVerified = false,
    this.isActive = true,
    this.isOnline = false,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      email: json['email'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      phone: json['phone'],
      profilePhoto: json['profile_photo'],
      roles: List<String>.from(json['roles'] ?? ['customer']),
      deviceTokens: List<String>.from(json['device_tokens'] ?? []),
      preferences: json['preferences'] ?? {},
      lastSeen: json['last_seen'] != null 
          ? DateTime.parse(json['last_seen']) 
          : null,
      platform: json['platform'],
      isVerified: json['is_verified'] ?? false,
      isActive: json['is_active'] ?? true,
      isOnline: json['is_online'] ?? false,
    );
  }
}
```

```dart
// models/office_space.dart
class OfficeSpace {
  final String id;
  final String ownerId;
  final String title;
  final String? description;
  final Map<String, dynamic> location;
  final List<String> photos;
  final String? thumbnailPhoto;
  final List<String> amenities;
  final int capacity;
  final Map<String, dynamic> pricing;
  final List<Map<String, dynamic>> availability;
  final double rating;
  final int reviewCount;
  final int viewCount;
  final int favoriteCount;
  final bool isActive;
  final bool isFeatured;
  final String verificationStatus;

  OfficeSpace({
    required this.id,
    required this.ownerId,
    required this.title,
    this.description,
    required this.location,
    this.photos = const [],
    this.thumbnailPhoto,
    this.amenities = const [],
    required this.capacity,
    required this.pricing,
    this.availability = const [],
    this.rating = 0.0,
    this.reviewCount = 0,
    this.viewCount = 0,
    this.favoriteCount = 0,
    this.isActive = true,
    this.isFeatured = false,
    this.verificationStatus = 'pending',
  });

  factory OfficeSpace.fromJson(Map<String, dynamic> json) {
    return OfficeSpace(
      id: json['id'],
      ownerId: json['owner_id'],
      title: json['title'],
      description: json['description'],
      location: json['location'],
      photos: List<String>.from(json['photos'] ?? []),
      thumbnailPhoto: json['thumbnail_photo'],
      amenities: List<String>.from(json['amenities'] ?? []),
      capacity: json['capacity'],
      pricing: json['pricing'],
      availability: List<Map<String, dynamic>>.from(json['availability'] ?? []),
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['review_count'] ?? 0,
      viewCount: json['view_count'] ?? 0,
      favoriteCount: json['favorite_count'] ?? 0,
      isActive: json['is_active'] ?? true,
      isFeatured: json['is_featured'] ?? false,
      verificationStatus: json['verification_status'] ?? 'pending',
    );
  }
}
```

## 🔄 Data Synchronization Strategy

### 1. Online/Offline Handling

```dart
// sync_service.dart
class SyncService {
  static bool _isOnline = true;
  static final List<Map<String, dynamic>> _pendingOperations = [];

  static Future<void> performOperation({
    required String table,
    required String operation,
    required Map<String, dynamic> data,
  }) async {
    if (_isOnline) {
      try {
        await _executeOperation(table, operation, data);
      } catch (e) {
        // If operation fails, add to pending
        _addToPending(table, operation, data);
      }
    } else {
      // Add to pending operations
      _addToPending(table, operation, data);
    }
  }

  static Future<void> syncPendingOperations() async {
    if (!_isOnline) return;

    for (final operation in List.from(_pendingOperations)) {
      try {
        await _executeOperation(
          operation['table'],
          operation['operation'],
          operation['data'],
        );
        _pendingOperations.remove(operation);
      } catch (e) {
        // Keep in pending if still fails
      }
    }
  }
}
```

### 2. Real-time Updates

```dart
// realtime_manager.dart
class RealtimeManager {
  static final Map<String, RealtimeChannel> _channels = {};

  static void subscribeToTable({
    required String table,
    String? userId,
    required Function(Map<String, dynamic>) onInsert,
    required Function(Map<String, dynamic>) onUpdate,
    required Function(Map<String, dynamic>) onDelete,
  }) {
    final channel = supabase.channel('$table${userId != null ? ':$userId' : ''}');
    
    channel.onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: table,
      callback: (payload) => onInsert(payload.newRecord),
    );
    
    channel.onPostgresChanges(
      event: PostgresChangeEvent.update,
      schema: 'public',
      table: table,
      callback: (payload) => onUpdate(payload.newRecord),
    );
    
    channel.onPostgresChanges(
      event: PostgresChangeEvent.delete,
      schema: 'public',
      table: table,
      callback: (payload) => onDelete(payload.oldRecord),
    );
    
    channel.subscribe();
    _channels['$table${userId != null ? ':$userId' : ''}'] = channel;
  }
}
```

## 📊 Analytics Integration

```dart
// analytics_service.dart
class AnalyticsService {
  static Future<void> trackEvent({
    required String eventType,
    Map<String, dynamic>? eventData,
  }) async {
    await supabase.from('analytics_events').insert({
      'user_id': supabase.auth.currentUser?.id,
      'event_type': eventType,
      'event_data': eventData ?? {},
      'platform': 'flutter',
      'app_version': await _getAppVersion(),
      'session_id': _getCurrentSessionId(),
    });
  }

  static Future<void> trackScreenView(String screenName) async {
    await trackEvent(
      eventType: 'screen_view',
      eventData: {'screen_name': screenName},
    );
  }

  static Future<void> trackUserAction({
    required String action,
    String? targetId,
    String? targetType,
  }) async {
    await trackEvent(
      eventType: 'user_action',
      eventData: {
        'action': action,
        'target_id': targetId,
        'target_type': targetType,
      },
    );
  }
}
```

## 🚀 Deployment Checklist

### Supabase Setup

1. **Create Supabase Project**
2. **Run Schema**
   ```sql
   -- Copy and paste the entire schema.sql content in Supabase SQL Editor
   ```

3. **Environment Configuration**
   ```dart
   // lib/core/config/supabase_config.dart
   class SupabaseConfig {
     static const String supabaseUrl = 'YOUR_SUPABASE_URL';
     static const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   }
   ```

4. **Enable Authentication Providers**
   - Email/Password ✅
   - Google OAuth (optional)
   - Apple OAuth (for iOS)

5. **Configure Row Level Security**
   - All policies are included in schema ✅

6. **Setup Storage Buckets**
   ```sql
   -- Create storage buckets
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('avatars', 'avatars', true),
   ('listings', 'listings', true),
   ('messages', 'messages', false);
   ```

### Flutter App Configuration

1. **Firebase Setup** (for push notifications)
   - Add `google-services.json` (Android)
   - Add `GoogleService-Info.plist` (iOS)

2. **Permissions**
   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   ```

3. **Build Configuration**
   ```yaml
   # pubspec.yaml
   name: storeffice
   version: 1.0.0+1
   
   environment:
     sdk: '>=3.0.0 <4.0.0'
     flutter: ">=3.10.0"
   ```

## ✅ Testing Strategy

### Unit Tests
```dart
// test/services/auth_service_test.dart
void main() {
  group('AuthService', () {
    test('should sign up user with correct data', () async {
      // Test implementation
    });
    
    test('should update online status', () async {
      // Test implementation
    });
  });
}
```

### Integration Tests
```dart
// integration_test/app_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Storeffice App', () {
    testWidgets('complete user flow', (tester) async {
      // Test complete user journey
    });
  });
}
```

## 🎯 Performance Optimization

1. **Image Optimization**
   - Use `thumbnail_photo` for list views
   - Implement lazy loading
   - Cache images locally

2. **Database Queries**
   - Use pagination for large lists
   - Implement search with debouncing
   - Cache frequently accessed data

3. **Real-time Subscriptions**
   - Subscribe only to relevant channels
   - Unsubscribe when leaving screens
   - Batch updates to prevent UI flicker

## 🔗 Deep Linking

```dart
// lib/core/routing/app_router.dart
class AppRouter {
  static const String officeSpaceDetail = '/office-space/:id';
  static const String productDetail = '/product/:id';
  static const String bookingDetail = '/booking/:id';
  
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case officeSpaceDetail:
        final id = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => OfficeSpaceDetailScreen(id: id),
        );
      // ... other routes
    }
  }
}
```

---

## 📞 Support

For Flutter-specific implementation questions:
1. Check the [Supabase Flutter Documentation](https://supabase.com/docs/reference/dart)
2. Review the [Flutter Documentation](https://flutter.dev/docs)
3. Reference this integration guide

## 🎉 Ready to Deploy!

Your Storeffice schema is **100% Flutter-ready** with:
- ✅ Mobile-optimized data structure
- ✅ Push notification support
- ✅ Real-time features
- ✅ Offline capabilities
- ✅ Location-based queries
- ✅ Cross-platform compatibility
- ✅ Performance optimizations
- ✅ Complete security policies

**Both your Flutter mobile app and Next.js web app can now use the same Supabase backend seamlessly!** 🚀