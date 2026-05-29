---
description: Convert a feature from SIGAP-Laravel (web) to Flutter Mobile App.
---

1.  **ANALYZE**:
    -   Locate existing web features in the current directory (`SIGAP-Laravel`).
    -   Backend Logic/API: `app/Http/Controllers/`, `routes/api.php`, `routes/web.php`.
    -   Web UI (sebagai referensi): `resources/js/Pages/<Feature>`.
    -   Flutter Source: folder `mobile/lib/`.
2.  **PLAN (Spec)**: In `implementation_plan.md`:
    -   Identifikasi apakah Endpoint API di Laravel sudah siap untuk dikonsumsi mobile. Jika belum, rencanakan pembuatan `API Controller` & `Resource`.
    -   Petakan halaman React/Inertia menjadi Flutter Screens & Widgets.
    -   Tentukan arsitektur data/state management (misalnya Riverpod, Bloc, atau Provider) untuk fitur mobile tersebut.
3.  **REVIEW**: Ajukan rencana kepada user untuk disetujui.
4.  **TEST (Red)**: 
    -   **Backend**: Tulis *Feature tests* di Laravel untuk endpoint API baru.
    -   **Mobile**: Tulis *Widget/Unit tests* di folder `mobile/test/` yang awalnya gagal (failing tests).
5.  **IMPLEMENT (Green)**: Bangun secara bertahap (End-to-End):
    -   **Backend**: Update/Buat Route API → API Controller → JSON Resource.
    -   **Mobile**: Buat Data Model (Dart) → API Service/Repository → State Controller → UI Screen.
6.  **UI VERIFY**: Gunakan alat verifikasi Android/iOS atau jalankan emulator untuk memastikan UI & Interaksi fitur Flutter berjalan baik.
7.  **VERIFY**: Pastikan semua pengujian lulus (`composer test` di backend, dan `flutter test` di folder mobile).
8.  **TRACK**: Perbarui dokumen pelacakan seperti `.agent/docs/mobile-conversion-tracker.md` (jika ada) untuk menandai fitur selesai.
