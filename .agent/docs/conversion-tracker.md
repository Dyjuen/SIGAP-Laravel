# Conversion Tracker: SIGAP-PNJ → SIGAP-Laravel

This document tracks the migration of features from the native PHP application to Laravel.

| Feature Area | Native Controller | Native Model(s) | Status | Logic Mapped? | Tests Passed? | UI Verified? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `AuthController` | `User`, `Role` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Accounts** | `AccountController` | `User` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Master Data** | `MasterController` | `Iku`, `Satuan`, `TipeKegiatan`, `MataAnggaran`, `KategoriBelanja` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Panduan (Guides)** | `PanduanController` | `Panduan` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **KAK (Activities)** | `KAKController` | `KAK`, `KAKAnggaran`, `KAKIndikator`, `KAKTarget`, `KAKTahapan`, `KAKManfaat` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Kegiatan (Realization)** | `KegiatanController` | `Kegiatan`, `KegiatanAnggaran`, `KegiatanLampiran` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Lampiran (Attachments)** | `LampiranController` | `KegiatanLampiran` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Pencairan (Disbursement)** | `PencairanController` | `PencairanDana` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **LPJ (Reports)** | `LpjController` | (Logic mainly in controller) | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Dashboard** | `DashboardController` | - | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Dashboard Direktur** | `DashboardDirekturController` | - | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Notifications** | `NotificationController` | `Notifikasi` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Logs** | `LogController` | `Log` | ⬜ Not Started | ⬜ | ⬜ | ⬜ |
| **Wadir / Rektorat** | `WadirController` | - | ⬜ Not Started | ⬜ | ⬜ | ⬜ |

## Legend
-   ⬜ Not Started
-   🚧 In Progress
-   ✅ Completed
