# Conversion Tracker: SIGAP-PNJ → SIGAP-Laravel

This document tracks the migration of features from the native PHP application to Laravel.

| Feature Area | Native Controller | Native Model(s) | Status | Logic Mapped? | Tests Passed? | UI Verified? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `AuthController` | `User`, `Role` | ✅ Completed | ✅ | ✅ | ✅ |
| **Accounts** | `AccountController` | `User` | ✅ Completed | ✅ | ✅ | ✅ |
| **Master Data** | `MasterController` | `Iku`, `Satuan`, `TipeKegiatan`, `MataAnggaran`, `KategoriBelanja` | ✅ Completed | ✅ | ✅ | ✅ |
| **Panduan (Guides)** | `PanduanController` | `Panduan` | ✅ Completed | ✅ | ✅ | ✅ |
| **KAK (Activities)** | `KAKController` | `KAK`, `KAKAnggaran`, `KAKIndikator`, `KAKTarget`, `KAKTahapan`, `KAKManfaat` | ✅ Completed | ✅ | ✅ | ✅ |
| **Kegiatan (Realization)** | `KegiatanController` | `Kegiatan`, `KegiatanAnggaran`, `KegiatanLampiran` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Lampiran (Attachments)** | `LampiranController` | `KegiatanLampiran` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Pencairan (Disbursement)** | `PencairanController` | `PencairanDana` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **LPJ (Reports)** | `LpjController` | (Logic mainly in controller) | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Dashboard** | `DashboardController` | - | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Dashboard Direktur** | `DashboardDirekturController` | - | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Notifications** | `NotificationController` | `Notifikasi` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Logs** | `LogController` | `Log` | ✅ Completed | ✅ | ✅ | ✅ |
| **Wadir / Rektorat** | `WadirController` | - | ⬜ Not Started | ⬜ | ⬜ | ⬜ |

## Legend
-   ⬜ Not Started
-   🚧 In Progress
-   ✅ Completed
