<?php

use App\Http\Controllers\Api\AdminApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\KakApiController;
use App\Http\Controllers\MasterDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin API Routes (role-gated inside controller)
    Route::get('/admin/stats', [AdminApiController::class, 'getStats']);
    Route::get('/admin/users', [AdminApiController::class, 'getUsers']);
    Route::post('/admin/users', [AdminApiController::class, 'createUser']);
    Route::delete('/admin/users/{id}', [AdminApiController::class, 'deleteUser']);
    Route::get('/admin/logs', [AdminApiController::class, 'getLogs']);
    Route::get('/admin/panduan', [AdminApiController::class, 'getPanduan']);
    Route::post('/admin/panduan', [AdminApiController::class, 'createPanduan']);
    Route::delete('/admin/panduan/{id}', [AdminApiController::class, 'deletePanduan']);

    // KAK API Routes (Pengusul & Admin, role-gated inside controller)
    Route::get('/kak', [KakApiController::class, 'index']);
    Route::post('/kak', [KakApiController::class, 'store']);
    Route::get('/kak/{id}', [KakApiController::class, 'show']);
    Route::put('/kak/{id}', [KakApiController::class, 'update']);
    Route::post('/kak/{id}/submit', [KakApiController::class, 'submit']);
    Route::post('/kak/{id}/approve', [KakApiController::class, 'approve']);
    Route::post('/kak/{id}/reject', [KakApiController::class, 'reject']);
    Route::post('/kak/{id}/request-revision', [KakApiController::class, 'requestRevision']);
    Route::delete('/kak/{id}', [KakApiController::class, 'destroy']);

    // Pengusul dashboard stats & recent activity
    Route::get('/pengusul/stats', [KakApiController::class, 'dashboardStats']);
    Route::get('/pengusul/recent-kaks', [KakApiController::class, 'recentKaks']);

    // Dashboard API Routes (Role-specific dashboards)
    Route::get('/verifikator/dashboard', [DashboardApiController::class, 'verifikator']);
    Route::get('/ppk/dashboard', [DashboardApiController::class, 'ppk']);
    Route::get('/wadir/dashboard', [DashboardApiController::class, 'wadir']);
    Route::get('/bendahara/dashboard', [DashboardApiController::class, 'bendahara']);
    Route::get('/direktur/dashboard', [DashboardApiController::class, 'direktur']);
});

// Master Data Routes (public, used for KAK form dropdowns)
Route::get('/master/iku', [MasterDataController::class, 'getIku']);
Route::get('/master/tipe-kegiatan', [MasterDataController::class, 'getTipeKegiatan']);
Route::get('/master/satuan', [MasterDataController::class, 'getSatuan']);
Route::get('/master/kategori-belanja', [MasterDataController::class, 'getKategoriBelanja']);
Route::get('/master/mata-anggaran', [MasterDataController::class, 'getMataAnggaran']);
