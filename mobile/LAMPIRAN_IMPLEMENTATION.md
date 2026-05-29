# Lampiran (File Uploads) Implementation - Documentation

## Overview
Complete implementation of file upload functionality for the SIGAP mobile app. This allows users to upload documents (PDFs, images) as attachments for KAK and Kegiatan items.

## What Was Implemented

### Backend (Laravel API)
1. **LampiranApiController** (`app/Http/Controllers/Api/LampiranApiController.php`)
   - Upload file endpoint: `POST /api/lampiran/anggaran/{anggaran}`
   - Get lampiran list: `GET /api/lampiran/anggaran/{anggaran}`
   - Get lampiran detail: `GET /api/lampiran/{lampiran}`
   - Delete/archive: `DELETE /api/lampiran/{lampiran}`
   - Approve: `POST /api/lampiran/{lampiran}/approve`
   - Request revision: `POST /api/lampiran/{lampiran}/catatan`
   - Resubmit: `POST /api/lampiran/{lampiran}/resubmit`
   - History: `GET /api/lampiran/{lampiran}/history`

2. **API Routes** (`routes/api.php`)
   - Added all Lampiran routes in authenticated middleware
   - Proper authorization checks (Pengusul, Verifikator, PPK, Wadir, Bendahara, Admin)

### Mobile (Flutter)
1. **Models** (`lib/models/lampiran_model.dart`)
   - `LampiranModel` class with all database fields
   - Helper methods for status checking and file type detection
   - JSON serialization/deserialization

2. **Services** (`lib/services/lampiran_service.dart`)
   - `LampiranService` class for API communication
   - Methods: upload, resubmit, delete, approve, get history, etc.
   - Error handling and Dio exception management

3. **Providers** (`lib/providers/lampiran_provider.dart`)
   - `LampiranProvider` for state management
   - Upload progress tracking
   - Loading states and error handling
   - Notification updates to UI

4. **UI Widgets**
   - `LampiranListWidget` (`lib/widgets/lampiran_list_widget.dart`)
     - Display list of lampiran files
     - Show status, uploader info, dates
     - Delete, download buttons
     - Status-based color coding
   
   - `LampiranUploadPage` (`lib/screens/lampiran_upload_page.dart`)
     - Full-screen file picker integration
     - File upload with progress indication
     - Optional notes/catatan
     - Supported formats: JPG, JPEG, PNG, PDF (max 10MB)

5. **Dependencies** (Updated `pubspec.yaml`)
   - Added `file_picker: ^6.1.0` for file selection

6. **Integration** (`lib/main.dart`)
   - Added `LampiranService` provider
   - Added `LampiranProvider` for state management

## File Structure
```
lib/
├── models/lampiran_model.dart          # Data model
├── services/lampiran_service.dart      # API communication
├── providers/lampiran_provider.dart    # State management
├── screens/
│   ├── lampiran_upload_page.dart       # Upload UI
│   └── example_lampiran_integration.dart # Usage example
└── widgets/lampiran_list_widget.dart   # Display component
```

## How to Use

### In Your Pages
```dart
// 1. Load lampiran when page initializes
@override
void initState() {
  super.initState();
  final provider = Provider.of<LampiranProvider>(context, listen: false);
  provider.fetchLampiran(anggaranId);
}

// 2. Display list of files
LampiranListWidget(
  anggaranId: anggaran.anggaran_id,
  readOnly: false,
  onDelete: (lampiran) {
    provider.deleteLampiran(lampiran.lampiranId);
  },
)

// 3. Open upload dialog
ElevatedButton(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LampiranUploadPage(
          anggaranId: anggaranId,
          anggaranNama: 'Item Name',
          onUploadSuccess: () {
            provider.fetchLampiran(anggaranId);
          },
        ),
      ),
    );
  },
  child: const Text('Upload File'),
)
```

### For Different User Roles
```dart
// Pengusul: Can upload/delete their own lampiran
LampiranListWidget(
  anggaranId: anggaranId,
  readOnly: false,
  onDelete: (lampiran) => deleteFile(lampiran),
)

// Verifikator/PPK/Wadir: Can review and approve
LampiranListWidget(
  anggaranId: anggaranId,
  readOnly: true,
  onApprove: (lampiran) => approveLampiran(lampiran),
  onRevise: (lampiran) => requestRevision(lampiran),
)

// Admin: Full access
LampiranListWidget(
  anggaranId: anggaranId,
  readOnly: false,
)
```

## Status Types
- **pending**: Waiting for approval
- **approved**: Approved by reviewer
- **revision_requested**: Needs revision
- **archived**: Deleted/archived

## File Type Support
- **Images**: JPG, JPEG, PNG
- **Documents**: PDF
- **Max Size**: 10MB per file
- **Max Files**: 10 per anggaran item

## API Authorization
- **Upload**: Pengusul (owner), Admin, Bendahara
- **Delete**: Pengusul (owner), Admin
- **Approve**: Verifikator, PPK, Wadir, Admin, Bendahara
- **View**: Pengusul (owner), Verifikator, PPK, Wadir, Admin, Bendahara

## Next Steps
1. Integrate lampiran upload into KAK detail page
2. Add lampiran approval workflow for verifikators
3. Implement file download/preview functionality
4. Add lampiran to Kegiatan and LPJ pages
5. Add lampiran history view

## Testing
To test:
1. Build/run the mobile app: `flutter run`
2. Login as a Pengusul user
3. Navigate to a KAK item
4. Click upload button
5. Select a PDF or image file
6. Submit and verify success notification

## Known Issues / Future Improvements
- Download/stream functionality needs PDF viewer implementation
- File preview not yet implemented
- Batch upload not supported
- Drag-and-drop file selection could be added
