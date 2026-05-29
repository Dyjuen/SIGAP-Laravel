# 📱 Dashboard Integration Guide - SIGAP Mobile

## Overview

Panduan ini menjelaskan integrasi dashboard untuk semua role (Pengusul, Verifikator, PPK, Bendahara, Direktur) di aplikasi SIGAP mobile Flutter.

---

## 🏗️ Arsitektur

### Backend (Laravel)

```
routes/api.php
  └── GET /dashboard/pengusul
  └── GET /dashboard/verifikator
  └── GET /dashboard/ppk
  └── GET /dashboard/bendahara
  └── GET /dashboard/direktur
      ↓
DashboardApiController.php (role-gated authorization)
  ├── pengusulDashboard()
  ├── verifikatorDashboard()
  ├── ppkDashboard()
  ├── bendaharaDashboard()
  └── direktorDashboard()
```

### Frontend (Flutter)

```
lib/
  ├── main.dart (Dio & Service initialization)
  ├── models/
  │   └── dashboard_model.dart (DashboardStats, DashboardItem, DashboardResponse)
  ├── services/
  │   └── dashboard_service.dart (API calls)
  ├── providers/
  │   └── dashboard_provider.dart (State Management)
  ├── screens/
  │   ├── dashboard_router.dart (Role-based routing)
  │   └── dashboard/
  │       ├── pengusul_dashboard_screen.dart
  │       ├── verifikator_dashboard_screen.dart
  │       ├── ppk_dashboard_screen.dart
  │       ├── bendahara_dashboard_screen.dart
  │       └── direktor_dashboard_screen.dart
```

---

## 🚀 Setup & Running

### Prerequisites

- Flutter SDK 3.8.0+
- Dart SDK matching Flutter version
- Laravel backend running (default: `http://localhost:8000`)

### Step 1: Install Dependencies

```bash
cd mobile
flutter pub get
```

### Step 2: Update Base URL (if needed)

File: `lib/services/dashboard_service.dart`

```dart
static const String _baseUrl = 'http://your-backend-url/api';
```

### Step 3: Configure Authentication

Ensure `AuthProvider` provides user data with `roleId` (1-7):

- 1 = Admin
- 2 = Verifikator
- 3 = Pengusul
- 4 = PPK
- 5 = Wadir
- 6 = Bendahara
- 7 = Rektorat

### Step 4: Run Application

```bash
flutter run
```

---

## 📊 Dashboard Features by Role

### 1️⃣ **Pengusul Dashboard** (Role ID: 3)

**File**: `pengusul_dashboard_screen.dart`

**Features**:

- Stat cards: Total KAK, Draft, Review, Approved, Rejected
- Recent KAKs list with status badge
- Quick actions: Buat KAK, Daftar LPJ
- Refresh capability
- Error handling

**API Endpoint**: `GET /api/dashboard/pengusul`

**Response Structure**:

```json
{
  "stats": {
    "total_kak": 5,
    "draft_kak": 1,
    "review_kak": 1,
    "approved_kak": 3,
    "rejected_kak": 0
  },
  "recent_kaks": [...]
}
```

---

### 2️⃣ **Verifikator Dashboard** (Role ID: 2)

**File**: `verifikator_dashboard_screen.dart`

**Features**:

- Stat cards: Pending, Approved, Rejected, Total Verified
- KAK pending verification list
- Review button dengan quick actions
- Empty state message

**API Endpoint**: `GET /api/dashboard/verifikator`

**Response Structure**:

```json
{
  "stats": {
    "pending_count": 3,
    "approved_count": 10,
    "rejected_count": 1,
    "total_verified": 11
  },
  "pending_kaks": [...]
}
```

---

### 3️⃣ **PPK Dashboard** (Role ID: 4)

**File**: `ppk_dashboard_screen.dart`

**Features**:

- Stat cards: Pending, Approved, Rejected, Total Kegiatan
- Kegiatan pending approval list
- Process button dengan action
- Calendar & type info

**API Endpoint**: `GET /api/dashboard/ppk`

**Response Structure**:

```json
{
  "stats": {
    "pending_count": 2,
    "approved_count": 5,
    "rejected_count": 0,
    "total_kegiatan": 10
  },
  "pending_kegiatans": [...]
}
```

---

### 4️⃣ **Bendahara Dashboard** (Role ID: 6)

**File**: `bendahara_dashboard_screen.dart`

**Features**:

- Stat cards: LPJ Pending, LPJ Approved, Dana Diusulkan, Dana Dicairkan
- LPJ list dengan dana comparison
- Currency formatting (Rp)
- Process button

**API Endpoint**: `GET /api/dashboard/bendahara`

**Response Structure**:

```json
{
  "stats": {
    "lpj_pending": 4,
    "lpj_approved": 8,
    "total_dana_diusulkan": 50000000,
    "total_dana_dicairkan": 35000000
  },
  "pending_lpjs": [...]
}
```

---

### 5️⃣ **Direktur Dashboard** (Role ID: 5, 7)

**File**: `direktor_dashboard_screen.dart`

**Features**:

- Overview cards: Total KAK, Approved, Total Kegiatan, Selesai
- KPI section: Tingkat kelulusan, Penyelesaian kegiatan
- Unit/Jurusan performance grid
- Insights box
- Progress indicators

**API Endpoint**: `GET /api/dashboard/direktur`

**Response Structure**:

```json
{
  "overview": {
    "total_kak": 20,
    "kak_approved": 15,
    "total_kegiatans": 25,
    "kegiatans_completed": 18
  },
  "by_jurusan": [...],
  "recent_activities": [...]
}
```

---

## 🔄 Data Flow

```
┌──────────────────────────────────┐
│   DashboardRouter (main dispatch) │
└──────────────────────────────────┘
           ↓
    (Check user.roleId)
           ↓
┌──────────────────────────────────┐
│  Create Provider + DashboardScreen│
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│  ChangeNotifier: loadDashboard() │
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│  DashboardService.getDashboard() │
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│  Dio HTTP GET request to Laravel  │
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│  Parse JSON → DashboardResponse   │
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│  Provider.setData() + notify      │
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│  Consumer rebuilds UI with data   │
└──────────────────────────────────┘
```

---

## 🎨 Design System

### Colors

- **Primary**: `Color(0xFF33C8DA)` (Cyan)
- **Success**: `Colors.green.shade700`
- **Warning**: `Colors.orange.shade700`
- **Error**: `Colors.red.shade700`
- **Background**: `Colors.white`

### Typography

- **Headlines**: Google Fonts Figtree, Bold
- **Body**: Material default
- **Labels**: Small, Grey

### Components

- **Stat Cards**: Colored containers dengan icon
- **Item Cards**: Minimal card with status badge
- **Buttons**: ElevatedButton dengan cyan primary color
- **Loading**: CircularProgressIndicator
- **Error**: Icon + message + retry button

---

## 🛠️ Customization

### Mengubah Base URL

```dart
// File: lib/services/dashboard_service.dart
static const String _baseUrl = 'https://your-api.com/api';
```

### Menambah Field ke Dashboard

1. Update Laravel API response di `DashboardApiController`
2. Update `DashboardStats` model di `dashboard_model.dart`
3. Update UI di screen untuk menampilkan field baru

### Styling Custom

Setiap screen menggunakan:

- `Theme.of(context)` untuk konsistensi
- Material 3 components
- Custom widget classes untuk reusability

---

## 🧪 Testing

### Unit Testing (Services)

```dart
test('DashboardService.getPengusulDashboard returns data', () async {
  // Mock Dio
  // Call method
  // Assert response
});
```

### Widget Testing (Screens)

```dart
testWidgets('PengusulDashboardScreen renders stat cards', (tester) async {
  // Pump widget dengan mock provider
  // Find stat cards
  // Verify display
});
```

### Integration Testing

```dart
testWidgets('Dashboard loads data from API', (tester) async {
  // Start app
  // Wait for API response
  // Verify data displayed
});
```

---

## 📋 Checklist - Before Release

- [ ] Base URL updated ke production
- [ ] Bearer token handling di Dio interceptor
- [ ] Error messages dalam Bahasa Indonesia
- [ ] All screens tested dengan real data
- [ ] Performance optimized (no unnecessary rebuilds)
- [ ] Offline mode handled gracefully
- [ ] Empty states for all screens
- [ ] Loading animations smooth
- [ ] Navigation between dashboards working
- [ ] Logout clears cached data

---

## 🐛 Troubleshooting

### Dashboard tidak load

**Solution**: Periksa:

1. Backend running dan accessible
2. Base URL correct di `DashboardService`
3. Bearer token valid di Dio interceptor
4. API route registered di `routes/api.php`

### Data tidak update

**Solution**:

1. Pull to refresh
2. Check network connection
3. Check API response format
4. Verify model parsing

### Provider error

**Solution**:

1. Ensure provider created di `DashboardRouter`
2. Check `MultiProvider` initialization di `main.dart`
3. Verify Consumer widget wrapping screen

---

## 📚 References

- [Flutter Provider Package](https://pub.dev/packages/provider)
- [Dio HTTP Client](https://pub.dev/packages/dio)
- [Material 3 Design](https://m3.material.io/)
- Laravel API docs in this project

---

## 📞 Support

Untuk pertanyaan atau issue, hubungi tim development atau buat issue di repository.

**Last Updated**: May 22, 2026
**Version**: 1.0.0
