# KAK Detail Page - Architecture & Flow Diagram

## Complete Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Flutter App                              │
│                     (main.dart - MultiProvider)                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ├─── Provider<Dio> ────────────────┐
                 │                                  │
                 ├─── ChangeNotifierProvider ◄──────┼─── AuthProvider
                 │                                  │
                 ├─── Provider<KakService> ◄────────┼─── Uses Dio
                 │                                  │
                 └─── ChangeNotifierProvider ◄──────┼─── KakDetailProvider
                                                    │
                                          ┌─────────┘
                                          │
                                          ▼
                                    KakService
                                    (GET /api/kak/{id})
```

## Data Flow - From User Click to Display

```
User taps "Lihat Detail"
        │
        ▼
KegiatanMonitoringPage
    .onDetailTap()
        │
        ├─ Navigator.push()
        │
        ▼
KakDetailPage(kakId: item.id)
    │
    ├─ initState
    │   │
    │   └─ provider.loadKakDetail(kakId)
    │
    ├─ KakDetailProvider.loadKakDetail()
    │   │
    │   ├─ _isLoading = true
    │   ├─ notifyListeners() ◄─── UI REBUILDS (shows spinner)
    │   │
    │   └─ kakService.getKakDetail(kakId)
    │       │
    │       └─ Dio.get('/kak/{kakId}')
    │           │
    │           └─ API returns JSON with all KAK fields
    │               │
    │               ├─ kak_id, nama_kegiatan, deskripsi...
    │               ├─ manfaat: [{...}, {...}]
    │               ├─ tahapan: [{...}, {...}]
    │               ├─ indikator_kinerja: [{...}]
    │               ├─ rab: [{...}, {...}]
    │               └─ approvals: [{...}]
    │
    ├─ KakDetail.fromJson(response)
    │   │
    │   └─ Model created with all fields populated
    │
    ├─ _kakDetail = model
    ├─ _isLoading = false
    ├─ notifyListeners() ◄─── UI REBUILDS (shows content)
    │
    └─ Consumer<KakDetailProvider>
        │
        └─ Conditional rendering:
            │
            ├─ if isLoading → CircularProgressIndicator
            ├─ if isError → Error message with retry button
            ├─ if !hasData → Empty state
            │
            └─ if hasData → Build complete page:
                │
                ├─ _HeaderSection (name, ID, status)
                ├─ _InfoUmumSection (deskripsi, metode, tanggal)
                ├─ _SasaranTargetSection (sasaran_utama)
                ├─ _ManfaatSection (list manfaat[])
                ├─ _TahapanSection (list tahapan[] with order)
                ├─ _IndikatorKinerjaSection (table indikator_kinerja[])
                ├─ _RabSection (list rab[] + total budget)
                ├─ _ApprovalsSection (timeline approvals[])
                └─ _ActionsSection (buttons: Edit, Submit, Close)
```

## State Management Layers

```
┌────────────────────────────────────────────────────────┐
│            KakDetailProvider (ChangeNotifier)           │
│                                                         │
│  Properties:                                            │
│  ├─ _kakDetail: KakDetail?                             │
│  ├─ _isLoading: bool                                   │
│  ├─ _errorMessage: String?                             │
│                                                         │
│  Methods:                                              │
│  ├─ loadKakDetail(kakId) → Future<void>               │
│  ├─ submitKak() → Future<bool>                         │
│  ├─ deleteKak() → Future<bool>                         │
│  └─ retry(kakId) → Future<void>                        │
│                                                         │
│  Getters:                                              │
│  ├─ kakDetail → KakDetail?                             │
│  ├─ isLoading → bool                                   │
│  ├─ isError → bool                                     │
│  └─ hasData → bool                                     │
└────────────────────────────────────────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │   KakService         │
    │                      │
    │ Methods:             │
    │ ├─ getKakDetail()   │
    │ ├─ getAllKaks()     │
    │ ├─ createKak()      │
    │ ├─ updateKak()      │
    │ ├─ submitKak()      │
    │ └─ deleteKak()      │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │   Dio (HTTP Client)  │
    │                      │
    │ GET /api/kak/{id}   │
    │ POST /api/kak       │
    │ PUT /api/kak/{id}   │
    │ DELETE /api/kak/{id}│
    │ POST /api/kak/{id}/ │
    │      submit         │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │   Laravel API        │
    │   (KakApiController) │
    │                      │
    │ Response includes:   │
    │ ├─ kak fields       │
    │ ├─ manfaat[]        │
    │ ├─ tahapan[]        │
    │ ├─ indikator_kinerja│
    │ ├─ rab[]            │
    │ └─ approvals[]      │
    └──────────────────────┘
```

## Model Relationships

```
KakDetail (Main)
│
├─ kakId: String
├─ namaKegiatan: String
├─ deskripsiKegiatan: String
├─ metodePelaksanaan: String
├─ tanggalMulai: String
├─ tanggalSelesai: String
├─ lokasi: String
├─ sasaranUtama: String
├─ kurunWaktuPelaksanaan: String
├─ statusId: int
├─ statusNama: String
├─ tipeKegiatanId: int?
├─ tipe: String?
├─ pengusulNama: String?
├─ updatedAt: String
│
├─ manfaat: List<KakManfaat>
│   │
│   └─ KakManfaat
│       ├─ manfaatId: String
│       └─ manfaat: String
│
├─ tahapan: List<KakTahapan>
│   │
│   └─ KakTahapan
│       ├─ tahapanId: String
│       ├─ namaTahapan: String
│       └─ urutan: int
│
├─ indikatorKinerja: List<KakIndikatorKinerja>
│   │
│   └─ KakIndikatorKinerja
│       ├─ targetId: String
│       ├─ bulanIndikator: String
│       ├─ deskripsiTarget: String
│       └─ persentaseTarget: double
│
├─ rab: List<KakRab>
│   │
│   └─ KakRab
│       ├─ anggaranId: String
│       ├─ uraian: String
│       ├─ volume1/2/3: double?
│       ├─ hargaSatuan: double?
│       └─ jumlahDiusulkan: double?
│
└─ approvals: List<KakApproval>
    │
    └─ KakApproval
        ├─ approverNama: String
        ├─ status: String
        ├─ catatan: String?
        └─ tanggal: String?
```

## Navigation Flow

```
Landing/Login Screen
        │
        └─ AuthProvider.login()
            │
            └─ Success: Authenticated
                │
                └─ DashboardRouter
                    │
                    └─ PengusulDashboardScreen
                        │
                        │ Click "Monitoring"
                        ▼
                    KegiatanMonitoringPage
                        │
                        │ Click "Lihat Detail" on card
                        ▼
                    KakDetailPage(kakId)
                        │
                        ├─ Load data
                        │
                        ├─ View all sections
                        │
                        ├─ [Submit button] (if draft)
                        │   └─ Call provider.submitKak()
                        │       └─ Returns to page with updated status
                        │
                        └─ [Close button]
                            └─ Navigator.pop()
                                │
                                └─ Back to KegiatanMonitoringPage
```

## UI Component Hierarchy

```
KakDetailPage (StatefulWidget)
│
├─ AppBar
│   ├─ Back button
│   └─ Title: "Detail KAK"
│
└─ Scaffold.body
    │
    └─ Consumer<KakDetailProvider>
        │
        ├─ if (isLoading)
        │   └─ CircularProgressIndicator
        │
        ├─ else if (isError)
        │   └─ ErrorWidget (error message + retry button)
        │
        ├─ else if (!hasData)
        │   └─ EmptyWidget (data not found message)
        │
        └─ else (hasData = true)
            │
            └─ SingleChildScrollView
                │
                ├─ _HeaderSection
                │   ├─ KAK name + ID
                │   ├─ Status badge (color-coded)
                │   └─ Meta info (Tipe, Pengusul, Updated date)
                │
                ├─ _InfoUmumSection
                │   ├─ Deskripsi kegiatan
                │   ├─ Metode pelaksanaan
                │   ├─ Tanggal mulai/selesai
                │   ├─ Lokasi
                │   └─ Kurun waktu
                │
                ├─ _SasaranTargetSection
                │   └─ Sasaran utama
                │
                ├─ _ManfaatSection (if manfaat.isNotEmpty)
                │   └─ List<ManfaatItem>
                │       └─ [Number] Manfaat text
                │
                ├─ _TahapanSection (if tahapan.isNotEmpty)
                │   └─ List<TahapanItem>
                │       ├─ Circle with sequence number
                │       └─ Tahapan name
                │
                ├─ _IndikatorKinerjaSection (if indikatorKinerja.isNotEmpty)
                │   └─ DataTable
                │       ├─ Bulan | Deskripsi | %
                │       └─ Rows...
                │
                ├─ _RabSection (if rab.isNotEmpty)
                │   ├─ List<RabItem>
                │   │   ├─ Uraian
                │   │   ├─ Volumes
                │   │   ├─ Harga satuan
                │   │   └─ Jumlah diusulkan
                │   │
                │   └─ Total Budget Box (highlighted)
                │
                ├─ _ApprovalsSection (if approvals.isNotEmpty)
                │   └─ Timeline
                │       ├─ Circle (status icon)
                │       ├─ Approver name
                │       ├─ Status label
                │       ├─ Date
                │       └─ Comments (if exists)
                │
                └─ _ActionsSection
                    ├─ [Edit] button (if editable)
                    ├─ [Submit] button (if editable)
                    └─ [Close] button
```

## Color Coding (Status)

```
Status ID | Name       | Background     | Text Color
----------|-----------|-----------------|----------
1         | Draft     | #FFF3E0 (Orange)| #E65100
2         | Review    | #E3F2FD (Blue) | #1565C0
3         | Disetujui | #E8F5E9 (Green)| #2E7D32
4/5       | Ditolak   | #FFEBEE (Red)  | #C62828
```

## Error Handling Flow

```
User clicks "Lihat Detail"
        │
        ▼
KakDetailPage loads
        │
        ├─ provider.loadKakDetail()
        │
        ├─ Try: kakService.getKakDetail()
        │   │
        │   ├─ Success: Set _kakDetail, _errorMessage = null
        │   │
        │   └─ Catch DioException:
        │       │
        │       ├─ Check if response exists
        │       ├─ Extract message from response.data['message']
        │       ├─ Set _errorMessage
        │       │
        │       └─ UI shows error with message + [Coba Lagi] button
        │           │
        │           └─ User clicks [Coba Lagi]
        │               │
        │               └─ provider.retry(kakId)
        │                   │
        │                   └─ Retry the loadKakDetail()
```

## Summary

- **Files**: 4 new + 3 modified
- **Models**: 6 Dart classes with fromJson/toJson
- **State Management**: Provider pattern with ChangeNotifier
- **API Integration**: Single endpoint GET /api/kak/{id}
- **UI Sections**: 9 organized sections
- **Error Handling**: Loading, error, empty states
- **Design**: Material 3 with custom colors
- **Navigation**: From monitoring → detail → back
