<?php

use App\Http\Controllers\Api\AdminApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\DeviceTokenController;
use App\Http\Controllers\Api\KakApiController;
use App\Http\Controllers\Api\KegiatanApiController;
use App\Http\Controllers\Api\LpjApiController;
use App\Http\Controllers\Api\MasterDataApiController;
use App\Http\Controllers\Api\NotificationApiController;
use App\Http\Controllers\Api\PencairanApiController;
use App\Http\Controllers\Api\ProfileApiController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\LampiranController;
use App\Http\Controllers\MasterDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

// Chatbot Route (Public for Landing Page guests)
Route::post('/chatbot/chat', [ChatbotController::class, 'chat'])
    ->name('chatbot.chat')
    ->middleware('throttle:20,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Admin API Routes
    Route::middleware('role:Admin')->group(function () {
        Route::get('/admin/stats', [AdminApiController::class, 'getStats']);
        Route::get('/admin/users', [AdminApiController::class, 'getUsers']);
        Route::post('/admin/users', [AdminApiController::class, 'createUser']);
        Route::put('/admin/users/{user}', [AdminApiController::class, 'updateUser']);
        Route::put('/admin/users/{user}/change-password', [AdminApiController::class, 'changePasswordUser']);
        Route::delete('/admin/users/{id}', [AdminApiController::class, 'deleteUser']);
        Route::get('/admin/logs', [AdminApiController::class, 'getLogs']);
        Route::get('/admin/panduan', [AdminApiController::class, 'getPanduan']);
        Route::post('/admin/panduan', [AdminApiController::class, 'createPanduan']);
        Route::put('/admin/panduan/{panduan}', [AdminApiController::class, 'updatePanduan']);
        Route::delete('/admin/panduan/{id}', [AdminApiController::class, 'deletePanduan']);
        Route::get('/admin/spk', [AdminApiController::class, 'getSpk']);
        Route::post('/admin/spk/config', [AdminApiController::class, 'updateSpkConfig']);

        // Admin Master Data CRUD API Routes
        Route::get('/admin/master', [MasterDataApiController::class, 'index']);
        Route::get('/admin/master/{type}', [MasterDataApiController::class, 'indexResource']);
        Route::post('/admin/master/{type}', [MasterDataApiController::class, 'store']);
        Route::put('/admin/master/{type}/{id}', [MasterDataApiController::class, 'update']);
        Route::delete('/admin/master/{type}/{id}', [MasterDataApiController::class, 'destroy']);
    });

    // KAK API Routes (Pengusul & Admin, role-gated inside controller where specific)
    Route::get('/kak', [KakApiController::class, 'index']);
    Route::post('/kak', [KakApiController::class, 'store']);
    Route::get('/kak/{id}', [KakApiController::class, 'show']);
    Route::put('/kak/{id}', [KakApiController::class, 'update']);
    Route::post('/kak/{id}/submit', [KakApiController::class, 'submit']);
    Route::post('/kak/{id}/approve', [KakApiController::class, 'approve']);
    Route::post('/kak/{id}/reject', [KakApiController::class, 'reject']);
    Route::post('/kak/{id}/revise', [KakApiController::class, 'revise']);
    Route::post('/kak/{id}/resubmit', [KakApiController::class, 'resubmit']);
    Route::delete('/kak/{id}', [KakApiController::class, 'destroy']);

    // Pengusul dashboard stats & recent activity
    Route::get('/pengusul/stats', [KakApiController::class, 'dashboardStats']);
    Route::get('/pengusul/recent-kaks', [KakApiController::class, 'recentKaks']);

    // Dashboard API Routes (Role-specific dashboards)
    Route::middleware('role:Verifikator')->group(function () {
        Route::get('/verifikator/dashboard', [DashboardApiController::class, 'verifikator']);
    });
    Route::middleware('role:PPK')->group(function () {
        Route::get('/ppk/dashboard', [DashboardApiController::class, 'ppk']);
    });
    Route::middleware('role:Wadir')->group(function () {
        Route::get('/wadir/dashboard', [DashboardApiController::class, 'wadir']);
    });
    Route::middleware('role:Bendahara')->group(function () {
        Route::get('/bendahara/dashboard', [DashboardApiController::class, 'bendahara']);
    });
    Route::middleware('role:Direktur,Rektorat,Admin')->group(function () {
        Route::get('/direktur/dashboard', [DashboardApiController::class, 'direktur']);
    });

    // Kegiatan API Routes
    Route::middleware('role:Admin,Pengusul,PPK,Wadir,Verifikator,Direktur,Rektorat')->group(function () {
        Route::get('/kegiatan/monitoring', [KegiatanApiController::class, 'monitoring']);
    });

    Route::middleware('role:Admin,Pengusul,PPK,Wadir,Direktur,Rektorat')->group(function () {
        Route::get('/kegiatan', [KegiatanApiController::class, 'index']);
    });

    Route::middleware('role:Admin,Pengusul,PPK,Wadir')->group(function () {
        Route::post('/kegiatan', [KegiatanApiController::class, 'store'])->middleware('throttle:60,1');
        Route::match(['put', 'patch'], '/kegiatan/{kegiatan}', [KegiatanApiController::class, 'update']);
        Route::post('/kegiatan/{kegiatan}/approve', [KegiatanApiController::class, 'approve']);
    });

    Route::middleware('role:Admin,Pengusul,PPK,Wadir,Bendahara,Verifikator,Direktur,Rektorat')->group(function () {
        Route::get('/kegiatan/{kegiatan}', [KegiatanApiController::class, 'show']);
    });

    // Pencairan API Routes
    Route::middleware('role:Bendahara,Admin')->group(function () {
        Route::get('/pencairan', [PencairanApiController::class, 'index']);
        Route::post('/kegiatan/{kegiatan}/pencairan', [PencairanApiController::class, 'store']);
        Route::post('/kegiatan/{kegiatan}/pencairan/selesai', [PencairanApiController::class, 'selesai']);
    });
    Route::get('/kegiatan/{kegiatan}/pencairan/sisa-dana', [PencairanApiController::class, 'sisaDana']);

    // Notification API Routes
    Route::get('/notifications', [NotificationApiController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationApiController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationApiController::class, 'markAllAsRead']);

    // Device Token API Routes
    Route::post('/device-token', [DeviceTokenController::class, 'store']);
    Route::delete('/device-token', [DeviceTokenController::class, 'destroy']);

    // Profile API Routes
    Route::get('/profile', [ProfileApiController::class, 'show']);
    Route::patch('/profile', [ProfileApiController::class, 'update']);
    Route::delete('/profile', [ProfileApiController::class, 'destroy']);

    // Lampiran (Attachments) API Routes
    Route::get('/lampiran/anggaran/{anggaran}', [LampiranController::class, 'index']);
    Route::post('/lampiran/anggaran/{anggaran}', [LampiranController::class, 'store']);
    Route::get('/lampiran/{lampiran}', [LampiranController::class, 'show']);
    Route::get('/lampiran/{lampiran}/stream', [LampiranController::class, 'stream']);
    Route::delete('/lampiran/{lampiran}', [LampiranController::class, 'destroy']);
    Route::post('/lampiran/{lampiran}/catatan', [LampiranController::class, 'saveCatatan']);
    Route::post('/lampiran/{lampiran}/approve', [LampiranController::class, 'approve']);
    Route::post('/lampiran/{lampiran}/resubmit', [LampiranController::class, 'resubmit']);
    Route::get('/lampiran/{lampiran}/history', [LampiranController::class, 'history']);

    // LPJ (Laporan Pertanggungjawaban) API Routes
    Route::get('/lpj', [LpjApiController::class, 'index']);
    Route::get('/lpj/{kegiatan}', [LpjApiController::class, 'show']);
    Route::post('/kegiatan/{kegiatan}/lpj/submit', [LpjApiController::class, 'submit']);
    Route::post('/kegiatan/{kegiatan}/lpj/approve', [LpjApiController::class, 'approve']);
    Route::post('/kegiatan/{kegiatan}/lpj/revise', [LpjApiController::class, 'revise']);
    Route::post('/kegiatan/{kegiatan}/lpj/resubmit', [LpjApiController::class, 'resubmit']);
    Route::post('/kegiatan/{kegiatan}/lpj/complete', [LpjApiController::class, 'complete']);
});

// Master Data Routes (public, used for KAK form dropdowns, with throttle)
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/master/iku', [MasterDataController::class, 'getIku']);
    Route::get('/master/tipe-kegiatan', [MasterDataController::class, 'getTipeKegiatan']);
    Route::get('/master/satuan', [MasterDataController::class, 'getSatuan']);
    Route::get('/master/kategori-belanja', [MasterDataController::class, 'getKategoriBelanja']);
    Route::get('/master/mata-anggaran', [MasterDataController::class, 'getMataAnggaran']);
});

// KAK PDF Routes (Public/Manual authentication via token query parameter)
Route::get('/kak/{id}/pdf/preview-blob', [KakApiController::class, 'previewPdfBlob']);
Route::get('/kak/{id}/pdf/preview', [KakApiController::class, 'previewPdf']);
Route::get('/kak/{id}/pdf/download', [KakApiController::class, 'downloadPdf']);
