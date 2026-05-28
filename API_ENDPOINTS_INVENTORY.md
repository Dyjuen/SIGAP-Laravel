# SIGAP Laravel API Endpoints Inventory

**Last Updated:** May 27, 2026  
**Purpose:** Complete audit of all existing API endpoints available for mobile app integration

---

## Available Roles in System

1. **Admin** (role_id = 1)
2. **Verifikator** (role_id = 2)
3. **Pengusul** (role_id = 3)
4. **PPK** (role_id = 4)
5. **Wadir** (role_id = 5)
6. **Bendahara** (role_id = 6)
7. **Rektorat** (role_id = 7)

---

## Authentication Endpoints

### POST /api/login

- **Method:** POST
- **Authentication:** None (public)
- **Request Body:**
    ```json
    {
        "username": "string",
        "password": "string"
    }
    ```
- **Response (200):**
    ```json
    {
        "token": "string (Sanctum token)",
        "user": {
            "id": "integer",
            "username": "string",
            "nama_lengkap": "string",
            "email": "string",
            "role_id": "integer",
            "role_name": "string (Admin|Verifikator|Pengusul|PPK|Wadir|Bendahara|Rektorat)"
        }
    }
    ```
- **Error (422):** Invalid credentials
- **Accessible By:** All unauthenticated users

---

### POST /api/logout

- **Method:** POST
- **Authentication:** Required (auth:sanctum)
- **Request Body:** Empty
- **Response (200):**
    ```json
    {
        "message": "Logged out successfully"
    }
    ```
- **Accessible By:** All authenticated users

---

### GET /api/user

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **Response (200):** Returns current authenticated user object
- **Accessible By:** All authenticated users

---

## KAK (Kerangka Acuan Kerja) Endpoints

### GET /api/kak

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **Query Parameters:**
    - `search` (optional): Filter by `nama_kegiatan` (ilike search)
    - `status_id` (optional): Filter by status_id
- **Response (200):**
    ```json
    [
        {
            "kak_id": "integer",
            "nama_kegiatan": "string",
            "status_id": "integer",
            "status_nama": "string",
            "tipe": "string",
            "updated_at": "string (d M Y format)",
            "tanggal_mulai": "string (d M Y format)",
            "tanggal_selesai": "string (d M Y format)"
        }
    ]
    ```
- **Role-Based Access:**
    - **Pengusul (role_id=3):** Only sees their own KAKs (filtered by `pengusul_user_id = user_id`)
    - **Admin (role_id=1):** Sees all KAKs
    - **Others:** 403 Forbidden
- **Use Case:** List view of KAK documents

---

### GET /api/kak/{id}

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **URL Parameters:**
    - `id`: KAK ID (kak_id)
- **Response (200):**
    ```json
    {
        "kak_id": "integer",
        "nama_kegiatan": "string",
        "deskripsi_kegiatan": "string",
        "metode_pelaksanaan": "string",
        "tanggal_mulai": "string (Y-m-d format)",
        "tanggal_selesai": "string (Y-m-d format)",
        "lokasi": "string",
        "sasaran_utama": "string",
        "kurun_waktu_pelaksanaan": "string (e.g., '3 Bulan 15 Hari')",
        "status_id": "integer",
        "status_nama": "string",
        "tipe": "string",
        "tipe_kegiatan_id": "integer",
        "pengusul_nama": "string",
        "updated_at": "string (d M Y format)",
        "manfaat": [
            {
                "manfaat_id": "integer",
                "manfaat": "string"
            }
        ],
        "tahapan": [
            {
                "tahapan_id": "integer",
                "nama_tahapan": "string",
                "urutan": "integer (1-based)"
            }
        ],
        "indikator_kinerja": [
            {
                "target_id": "integer",
                "bulan_indikator": "integer",
                "deskripsi_target": "string",
                "persentase_target": "decimal"
            }
        ],
        "rab": [
            {
                "anggaran_id": "integer",
                "uraian": "string",
                "volume1": "decimal",
                "volume2": "decimal (nullable)",
                "volume3": "decimal (nullable)",
                "harga_satuan": "decimal",
                "jumlah_diusulkan": "decimal"
            }
        ],
        "approvals": [
            {
                "approver_nama": "string",
                "status": "string (e.g., 'Disetujui', 'Menunggu')",
                "catatan": "string (nullable)",
                "tanggal": "string (d M Y format, nullable)"
            }
        ]
    }
    ```
- **Role-Based Access:**
    - **Pengusul (role_id=3):** Only their own KAK (403 if not owner)
    - **Admin (role_id=1):** All KAKs
    - **Others:** 403 Forbidden
- **Use Case:** Detailed view of a single KAK with all nested data

---

### POST /api/kak

- **Method:** POST
- **Authentication:** Required (auth:sanctum)
- **Request Body:**
    ```json
    {
        "nama_kegiatan": "string (5-255 chars)",
        "deskripsi_kegiatan": "string (min 5 chars)",
        "metode_pelaksanaan": "string (min 5 chars)",
        "tanggal_mulai": "string (Y-m-d format)",
        "tanggal_selesai": "string (Y-m-d format, >= tanggal_mulai)",
        "lokasi": "string (max 255)",
        "tipe_kegiatan_id": "integer (must exist in m_tipe_kegiatan)",
        "sasaran_utama": "string (max 255)",
        "manfaat": [{ "value": "string" }],
        "tahapan": [{ "nama_tahapan": "string" }],
        "rab": [
            {
                "uraian": "string",
                "volume1": "numeric (>= 0)",
                "volume2": "numeric (optional)",
                "volume3": "numeric (optional)",
                "harga_satuan": "numeric (>= 0)",
                "kategori_belanja_id": "integer",
                "satuan1_id": "integer (optional)"
            }
        ]
    }
    ```
- **Response (201):**
    ```json
    {
        "message": "KAK berhasil dibuat.",
        "kak_id": "integer"
    }
    ```
- **Role-Based Access:**
    - **Pengusul (role_id=3):** Only allowed
    - **Others:** 403 Forbidden
- **Use Case:** Create new KAK (Draft status = 1)

---

### POST /api/kak/{id}/submit

- **Method:** POST
- **Authentication:** Required (auth:sanctum)
- **URL Parameters:**
    - `id`: KAK ID
- **Request Body:** Empty
- **Response (200):**
    ```json
    {
        "message": "KAK berhasil diajukan untuk verifikasi."
    }
    ```
- **Validation:**
    - User must be Pengusul (role_id=3) AND be the KAK owner
    - KAK status must be Draft (1) or Revisi (5)
- **Effect:** Changes status from Draft/Revisi → Review (status_id = 2)
- **Creates:** Entry in t_kak_log_status
- **Accessible By:** Pengusul (owner only)
- **Use Case:** Submit KAK for review after creation/revision

---

### DELETE /api/kak/{id}

- **Method:** DELETE
- **Authentication:** Required (auth:sanctum)
- **URL Parameters:**
    - `id`: KAK ID
- **Request Body:** Empty
- **Response (200):**
    ```json
    {
        "message": "KAK berhasil dihapus."
    }
    ```
- **Validation:**
    - User must be Pengusul (role_id=3) AND be the KAK owner
    - KAK status must be Draft (1) or Rejected (4)
- **Accessible By:** Pengusul (owner only)
- **Use Case:** Delete draft or rejected KAK

---

## Pengusul Dashboard Endpoints

### GET /api/pengusul/stats

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **Response (200):**
    ```json
    {
        "total_kak": "integer",
        "draft_kak": "integer (status_id = 1)",
        "review_kak": "integer (status_id = 2)",
        "approved_kak": "integer (status_id = 3)",
        "rejected_kak": "integer (status_id = 4 or 5)"
    }
    ```
- **Accessible By:**
    - **Pengusul (role_id=3):** Their own stats
    - **Others:** 403 Forbidden
- **Use Case:** Pengusul dashboard summary cards

---

### GET /api/pengusul/recent-kaks

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **Response (200):**
    ```json
    [
        {
            "kak_id": "integer",
            "nama_kegiatan": "string",
            "status_id": "integer",
            "status_nama": "string",
            "tipe": "string",
            "updated_at": "string (d M Y format)"
        }
    ]
    ```
- **Limit:** Last 5 KAKs ordered by updated_at DESC
- **Accessible By:**
    - **Pengusul (role_id=3):** Their own recent KAKs
    - **Others:** 403 Forbidden
- **Use Case:** Recent activity widget on Pengusul dashboard

---

## Admin Dashboard Endpoints

### GET /api/admin/stats

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **Response (200):**
    ```json
    {
        "total_kak": "integer",
        "total_kegiatan": "integer",
        "pending_approvals": "integer (KegiatanApproval with status='Aktif')",
        "total_users": "integer",
        "active_users": "integer (not soft deleted)"
    }
    ```
- **Accessible By:**
    - All authenticated users can access (no role check visible in code)
    - **Note:** This endpoint doesn't have explicit role gating visible
- **Use Case:** Admin dashboard overview cards

---

### GET /api/admin/users

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **Response (200):**
    ```json
    [
        {
            "user_id": "integer",
            "username": "string",
            "nama_lengkap": "string",
            "email": "string",
            "role_name": "string",
            "role_id": "integer",
            "created_at": "string (ISO 8601)"
        }
    ]
    ```
- **Sorting:** By created_at DESC
- **Accessible By:**
    - **Admin (role_id=1):** Full access
    - **Others:** 403 Forbidden
- **Use Case:** List all users in system

---

### POST /api/admin/users

- **Method:** POST
- **Authentication:** Required (auth:sanctum)
- **Request Body:**
    ```json
    {
        "username": "string (unique)",
        "password": "string (min 4 chars)",
        "nama_lengkap": "string",
        "email": "string (unique, valid email)",
        "role_id": "integer"
    }
    ```
- **Response (201):**
    ```json
    {
        "message": "User berhasil ditambahkan.",
        "user": {
            "user_id": "integer",
            "username": "string",
            "nama_lengkap": "string",
            "email": "string",
            "role_name": "string",
            "role_id": "integer"
        }
    }
    ```
- **Accessible By:**
    - **Admin (role_id=1):** Only
    - **Others:** 403 Forbidden
- **Use Case:** Create new user account

---

### DELETE /api/admin/users/{id}

- **Method:** DELETE
- **Authentication:** Required (auth:sanctum)
- **URL Parameters:**
    - `id`: User ID (user_id)
- **Response (200):**
    ```json
    {
        "message": "User berhasil dihapus."
    }
    ```
- **Validation:**
    - Cannot delete own account (403 if user_id matches current user)
- **Accessible By:**
    - **Admin (role_id=1):** Only
    - **Others:** 403 Forbidden
- **Use Case:** Delete user account

---

### GET /api/admin/logs

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **Response (200):**
    ```json
    [
        {
            "log_id": "integer",
            "log_type": "string",
            "created_at": "string (ISO 8601)",
            "user_name": "string",
            "user_role": "string",
            "context_title": "string",
            "description": "string"
        }
    ]
    ```
- **Limit:** Last 10 logs ordered by created_at DESC
- **Accessible By:**
    - **Admin (role_id=1):** Only
    - **Others:** 403 Forbidden
- **Use Case:** View system activity logs

---

### GET /api/admin/panduan

- **Method:** GET
- **Authentication:** Required (auth:sanctum)
- **Response (200):**
    ```json
    [
        {
            "id": "integer (panduan_id)",
            "title": "string (judul_panduan)",
            "type": "string (document|video|null)",
            "path": "string (path_media)",
            "target_role_id": "integer (nullable)"
        }
    ]
    ```
- **Sorting:** By panduan_id DESC
- **Accessible By:**
    - All authenticated users can read
    - **Note:** No explicit role check for reading
- **Use Case:** Get list of system guides/videos/documents

---

### POST /api/admin/panduan

- **Method:** POST
- **Authentication:** Required (auth:sanctum)
- **Request Body:**
    ```json
    {
        "title": "string",
        "type": "string (document|video)",
        "path": "string"
    }
    ```
- **Response (201):**
    ```json
    {
        "message": "Panduan berhasil ditambahkan.",
        "guide": {
            "id": "integer",
            "title": "string",
            "type": "string",
            "path": "string"
        }
    }
    ```
- **Accessible By:**
    - **Admin (role_id=1):** Only
    - **Others:** 403 Forbidden
- **Use Case:** Create new system guide/video

---

### DELETE /api/admin/panduan/{id}

- **Method:** DELETE
- **Authentication:** Required (auth:sanctum)
- **URL Parameters:**
    - `id`: Panduan ID
- **Response (200):**
    ```json
    {
        "message": "Panduan berhasil dihapus."
    }
    ```
- **Accessible By:**
    - **Admin (role_id=1):** Only
    - **Others:** 403 Forbidden
- **Use Case:** Delete system guide

---

## Master Data Endpoints (Public/All Users)

### GET /master/iku

- **Method:** GET
- **Authentication:** Not required (public)
- **Response (200):**
    ```json
    {
      "success": true,
      "data": [
        {
          "iku_id": "integer",
          "kode_iku": "string",
          "nama_iku": "string",
          ...
        }
      ],
      "message": "Data IKU berhasil diambil."
    }
    ```
- **Use Case:** Dropdown data for IKU (Indikator Kinerja Utama) in forms

---

### GET /master/tipe-kegiatan

- **Method:** GET
- **Authentication:** Not required (public)
- **Response (200):**
    ```json
    {
      "success": true,
      "data": [
        {
          "tipe_kegiatan_id": "integer",
          "nama_tipe": "string",
          ...
        }
      ],
      "message": "Data Tipe Kegiatan berhasil diambil."
    }
    ```
- **Sorting:** By tipe_kegiatan_id
- **Use Case:** Dropdown for activity type selection

---

### GET /master/satuan

- **Method:** GET
- **Authentication:** Not required (public)
- **Response (200):**
    ```json
    {
      "success": true,
      "data": [
        {
          "satuan_id": "integer",
          "nama_satuan": "string",
          ...
        }
      ],
      "message": "Data Satuan berhasil diambil."
    }
    ```
- **Use Case:** Dropdown for unit of measurement

---

### GET /master/kategori-belanja

- **Method:** GET
- **Authentication:** Not required (public)
- **Response (200):**
    ```json
    {
      "success": true,
      "data": [
        {
          "kategori_belanja_id": "integer",
          "nama_kategori": "string",
          "is_active": "boolean",
          "urutan": "integer",
          ...
        }
      ],
      "message": "Data Kategori Belanja berhasil diambil."
    }
    ```
- **Filtering:** Only active categories (is_active = true)
- **Sorting:** By urutan
- **Use Case:** Dropdown for budget category selection

---

### GET /master/mata-anggaran

- **Method:** GET
- **Authentication:** Not required (public)
- **Response (200):**
    ```json
    {
      "success": true,
      "data": [
        {
          "mata_anggaran_id": "integer",
          "kode_mata_anggaran": "string",
          "nama_mata_anggaran": "string",
          ...
        }
      ],
      "message": "Data Mata Anggaran berhasil diambil."
    }
    ```
- **Use Case:** Dropdown for budget head selection

---

## Summary Table

| Endpoint                    | Method | Auth | Roles                   | Purpose                   |
| --------------------------- | ------ | ---- | ----------------------- | ------------------------- |
| `/api/login`                | POST   | No   | All                     | User authentication       |
| `/api/logout`               | POST   | Yes  | All                     | User logout               |
| `/api/user`                 | GET    | Yes  | All                     | Current user info         |
| `/api/kak`                  | GET    | Yes  | Pengusul, Admin         | List KAKs                 |
| `/api/kak`                  | POST   | Yes  | Pengusul                | Create KAK                |
| `/api/kak/{id}`             | GET    | Yes  | Pengusul (owner), Admin | KAK detail                |
| `/api/kak/{id}/submit`      | POST   | Yes  | Pengusul (owner)        | Submit for review         |
| `/api/kak/{id}`             | DELETE | Yes  | Pengusul (owner)        | Delete KAK                |
| `/api/pengusul/stats`       | GET    | Yes  | Pengusul                | Dashboard stats           |
| `/api/pengusul/recent-kaks` | GET    | Yes  | Pengusul                | Recent activities         |
| `/api/admin/stats`          | GET    | Yes  | All (no check)          | System overview           |
| `/api/admin/users`          | GET    | Yes  | Admin                   | List all users            |
| `/api/admin/users`          | POST   | Yes  | Admin                   | Create user               |
| `/api/admin/users/{id}`     | DELETE | Yes  | Admin                   | Delete user               |
| `/api/admin/logs`           | GET    | Yes  | Admin                   | Activity logs             |
| `/api/admin/panduan`        | GET    | Yes  | All                     | List guides               |
| `/api/admin/panduan`        | POST   | Yes  | Admin                   | Create guide              |
| `/api/admin/panduan/{id}`   | DELETE | Yes  | Admin                   | Delete guide              |
| `/master/iku`               | GET    | No   | All                     | Master IKU data           |
| `/master/tipe-kegiatan`     | GET    | No   | All                     | Master activity types     |
| `/master/satuan`            | GET    | No   | All                     | Master units              |
| `/master/kategori-belanja`  | GET    | No   | All                     | Master expense categories |
| `/master/mata-anggaran`     | GET    | No   | All                     | Master budget heads       |

---

## Key Observations

### Missing for Mobile App

The following role-based dashboards/stats exist on **web** but NOT as API endpoints yet:

- `/api/verifikator/stats` - Verifikator pending approvals (role_id=2)
- `/api/ppk/stats` - PPK pending activities (role_id=4)
- `/api/wadir/stats` - Wadir pending approvals (role_id=5)
- `/api/bendahara/stats` - Bendahara fund requests (role_id=6)
- `/api/rektorat/stats` - Rektorat overview (role_id=7)

### Missing Endpoints for Complete Workflow

- **No approval endpoints** - Verifikator/PPK/Wadir/Bendahara cannot approve/reject via API
- **No Kegiatan API** - Cannot manage activities via API
- **No Pencairan API** - Cannot manage fund releases via API
- **No LPJ API** - Cannot manage reports via API
- **No attachment/file upload** - No endpoint for file uploads

### Data Model Notes

- **KAK Status Values:** 1=Draft, 2=Review, 3=Approved, 4=Rejected, 5=Revisi
- **Approval Level Values:** PPK, Wadir2, Bendahara-Setor (used in KegiatanApproval)
- **Approval Status:** Aktif (pending), Disetujui (approved), Ditolak (rejected)

---

## Recommendations for Mobile App

### Priority 1: Use Existing Endpoints

✅ POST /api/login - Already implemented  
✅ GET /api/user - For profile data  
✅ GET /api/kak - For KAK listing  
✅ GET /api/kak/{id} - For KAK details  
✅ GET /api/pengusul/stats - For Pengusul dashboard  
✅ GET /api/pengusul/recent-kaks - For recent activity  
✅ GET /master/\* - All master data endpoints for dropdowns

### Priority 2: Create New Endpoints (if needed)

- [ ] GET `/api/{role}/stats` - For each role's dashboard
- [ ] POST `/api/{role}/approve` - For approval workflows
- [ ] GET `/api/kegiatan` - For activity listing
- [ ] GET `/api/kegiatan/{id}` - For activity details
- [ ] GET `/api/lpj` - For report management

---

## Testing Notes

**Base URL:** Typically `http://localhost:8000/api/` (adjust for your environment)

**Authentication Header:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Sample Login Request:**

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"pengusul1","password":"password"}'
```

**Sample KAK List Request:**

```bash
curl -X GET http://localhost:8000/api/kak \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```
