---
description: Inertia.js and React patterns for SIGAP-Laravel frontend. Triggers: creating/editing React pages, components, forms.
---

# Inertia & React Patterns

## Page Components
-   Place in `resources/js/Pages/`.
-   Use **PascalCase** for filenames (e.g., `UserProfile.tsx`).
-   Receive data as props from Laravel controllers.
-   Use `Head` component for document titles.

## Shared Components
-   Place in `resources/js/Components/`.
-   Keep them stateless and reusable where possible.

## Inertia Forms
-   Use the `useForm` hook for form handling.
    ```javascript
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });
    ```
-   Display validation errors inline using the `errors` object.
-   Disable submit button while `processing` is true.

## Routing
-   Use `Link` component for internal navigation (avoids full page reload).
    ```javascript
    <Link href={route('dashboard')}>Dashboard</Link>
    ```
-   Use `router.visit()` for programmatic navigation.

## Flash Messages
-   Handle flash messages (success, error) from the `usePage` props.
-   Display them as toasts or alerts.

## Indonesian UI Language (Bahasa Indonesia)
-   **MANDATORY**: All user-facing text must be in Indonesian.
-   **Common Translations**:
    -   "Dashboard" -> "Dasbor"
    -   "Settings" -> "Pengaturan"
    -   "Users" -> "Pengguna"
    -   "Create" -> "Buat" / "Tambah"
    -   "Edit" -> "Ubah"
    -   "Delete" -> "Hapus"
    -   "Save" -> "Simpan"
    -   "Cancel" -> "Batal"
    -   "Back" -> "Kembali"
    -   "Success" -> "Berhasil"
    -   "Error" -> "Kesalahan" / "Gagal"
    -   "Loading..." -> "Memuat..."
    -   "Please wait" -> "Mohon tunggu"
    -   "Logout" -> "Keluar"
    -   "Login" -> "Masuk"
