<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\PanduanController;
use App\Http\Controllers\Admin\SpkController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardDirekturController;
use App\Http\Controllers\KakController;
use App\Http\Controllers\KakWorkflowController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\LampiranController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\LpjController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PencairanController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageController::class);
Route::post('/chatbot/chat', [ChatbotController::class, 'chat'])
    ->name('chatbot.chat')
    ->middleware('throttle:20,1');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

Route::middleware(['auth', 'role:Rektorat'])->group(function () {
    Route::get('/dashboard/direktur', [DashboardDirekturController::class, 'index'])->name('dashboard.direktur');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // KAK Routes
    Route::middleware('role:Admin,Verifikator,Pengusul,Bendahara,Rektorat')->group(function () {
        Route::resource('kak', KakController::class);
        Route::get('/kak/{kak}/pdf/preview', [KakController::class, 'previewPdf'])->name('kak.pdf.preview');
        Route::get('/kak/{kak}/pdf/preview-blob', [KakController::class, 'previewPdfBlob'])->name('kak.pdf.preview-blob');
        Route::get('/kak/{kak}/pdf/download', [KakController::class, 'exportPdf'])->name('kak.pdf.download');

        // KAK Workflow Routes
        Route::post('/kak/{kak}/submit', [KakWorkflowController::class, 'submit'])->name('kak.submit');
        Route::post('/kak/{kak}/approve', [KakWorkflowController::class, 'approve'])->name('kak.approve');
        Route::post('/kak/{kak}/reject', [KakWorkflowController::class, 'reject'])->name('kak.reject');
        Route::post('/kak/{kak}/revise', [KakWorkflowController::class, 'revise'])->name('kak.revise');
        Route::post('/kak/{kak}/resubmit', [KakWorkflowController::class, 'resubmit'])->name('kak.resubmit');
    });

    // Kegiatan Routes
    Route::middleware('role:Admin,Pengusul,PPK,Wadir')->group(function () {
        Route::get('/kegiatan/monitoring', [KegiatanController::class, 'monitoring'])->name('kegiatan.monitoring');
        Route::get('/kegiatan', [KegiatanController::class, 'index'])->name('kegiatan.index');
        Route::post('/kegiatan', [KegiatanController::class, 'store'])->name('kegiatan.store')->middleware('throttle:60,1');
        Route::match(['put', 'patch'], '/kegiatan/{kegiatan}', [KegiatanController::class, 'update'])->name('kegiatan.update');
        Route::post('/kegiatan/{kegiatan}/approve', [KegiatanController::class, 'approve'])->name('kegiatan.approve');
    });

    Route::middleware('role:Admin,Pengusul,PPK,Wadir,Bendahara')->group(function () {
        Route::get('/kegiatan/{kegiatan}', [KegiatanController::class, 'show'])->name('kegiatan.show');
    });

    // Pencairan Routes
    Route::get('/pencairan', [PencairanController::class, 'index'])->name('pencairan.index');
    Route::get('/kegiatan/{kegiatan}/pencairan/sisa-dana', [PencairanController::class, 'sisaDana'])->name('pencairan.sisa-dana');
    Route::post('/kegiatan/{kegiatan}/pencairan', [PencairanController::class, 'store'])->name('pencairan.store');
    Route::post('/kegiatan/{kegiatan}/pencairan/selesai', [PencairanController::class, 'selesai'])->name('pencairan.selesai');

    // Lampiran (Attachments)
    Route::prefix('lampiran')->group(function () {
        Route::get('/anggaran/{anggaran}', [LampiranController::class, 'index'])->name('lampiran.index');
        Route::post('/anggaran/{anggaran}', [LampiranController::class, 'store'])->name('lampiran.store');
        Route::get('/{lampiran}', [LampiranController::class, 'show'])->name('lampiran.show');
        Route::get('/{lampiran}/stream', [LampiranController::class, 'stream'])->name('lampiran.stream');
        Route::delete('/{lampiran}', [LampiranController::class, 'destroy'])->name('lampiran.destroy');
        Route::post('/{lampiran}/catatan', [LampiranController::class, 'saveCatatan'])->name('lampiran.catatan');
        Route::post('/{lampiran}/approve', [LampiranController::class, 'approve'])->name('lampiran.approve');
        Route::post('/{lampiran}/resubmit', [LampiranController::class, 'resubmit'])->name('lampiran.resubmit');
        Route::get('/{lampiran}/history', [LampiranController::class, 'history'])->name('lampiran.history');
    });

    // LPJ (Laporan Pertanggungjawaban)
    Route::get('/lpj', [LpjController::class, 'index'])->name('lpj.index');
    Route::prefix('kegiatan/{kegiatan}/lpj')->group(function () {
        Route::get('/review', [LpjController::class, 'review'])->name('lpj.review');
        Route::post('/submit', [LpjController::class, 'submit'])->name('lpj.submit');
        Route::post('/revise', [LpjController::class, 'revise'])->name('lpj.revise');
        Route::post('/resubmit', [LpjController::class, 'resubmit'])->name('lpj.resubmit');
        Route::post('/approve', [LpjController::class, 'approve'])->name('lpj.approve');
        Route::post('/complete', [LpjController::class, 'complete'])->name('lpj.complete');
    });

    // Notifications
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
});

require __DIR__.'/auth.php';

Route::middleware(['auth', 'role:Admin'])->prefix('admin')->group(function () {
    Route::get('/user-management', [AccountController::class, 'index'])->name('admin.users.index');
    Route::post('/user-management', [AccountController::class, 'store'])->name('admin.users.store');
    Route::put('/user-management/{user}', [AccountController::class, 'update'])->name('admin.users.update');
    Route::put('/user-management/{user}/change-password', [AccountController::class, 'changePassword'])->name('admin.users.change-password');
    Route::delete('/user-management/{user}', [AccountController::class, 'destroy'])->name('admin.users.destroy');

    // Panduan Routes
    Route::get('/panduan', [PanduanController::class, 'index'])->name('admin.panduan.index');
    Route::post('/panduan', [PanduanController::class, 'store'])->name('admin.panduan.store');
    Route::put('/panduan/{panduan}', [PanduanController::class, 'update'])->name('admin.panduan.update');
    Route::delete('/panduan/{panduan}', [PanduanController::class, 'destroy'])->name('admin.panduan.destroy');

    // Logs Routes
    Route::get('/logs', [LogController::class, 'index'])->name('admin.logs.index');

    // SPK Management Routes
    Route::get('/spk', [SpkController::class, 'index'])->name('admin.spk.index');
    Route::post('/spk/config', [SpkController::class, 'updateConfig'])->name('admin.spk.config.update');

    // Master Data Routes
    Route::prefix('master')->group(function () {
        Route::get('/', [MasterDataController::class, 'index'])->name('admin.master.index');
        Route::get('/{type}', [MasterDataController::class, 'indexResource'])->name('admin.master.resource.index');
        Route::post('/{type}', [MasterDataController::class, 'store'])->name('admin.master.store');
        Route::put('/{type}/{id}', [MasterDataController::class, 'update'])->name('admin.master.update');
        Route::delete('/{type}/{id}', [MasterDataController::class, 'destroy'])->name('admin.master.destroy');
    });
});

Route::middleware(['auth'])->group(function () {
    Route::get('/panduan/{panduan}/download', [PanduanController::class, 'download'])->name('admin.panduan.download');
});
