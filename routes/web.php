<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // KAK Routes
    Route::resource('kak', \App\Http\Controllers\KakController::class);

    // KAK Workflow Routes
    Route::post('/kak/{kak}/submit', [\App\Http\Controllers\KakWorkflowController::class, 'submit'])->name('kak.submit');
    Route::post('/kak/{kak}/approve', [\App\Http\Controllers\KakWorkflowController::class, 'approve'])->name('kak.approve');
    Route::post('/kak/{kak}/reject', [\App\Http\Controllers\KakWorkflowController::class, 'reject'])->name('kak.reject');
    Route::post('/kak/{kak}/revise', [\App\Http\Controllers\KakWorkflowController::class, 'revise'])->name('kak.revise');
    Route::post('/kak/{kak}/resubmit', [\App\Http\Controllers\KakWorkflowController::class, 'resubmit'])->name('kak.resubmit');

    // Kegiatan Routes
    Route::get('/kegiatan/monitoring', [\App\Http\Controllers\KegiatanController::class, 'monitoring'])->name('kegiatan.monitoring');
    Route::resource('kegiatan', \App\Http\Controllers\KegiatanController::class)->only(['index', 'store', 'show']);
    Route::post('/kegiatan/{kegiatan}/approve', [\App\Http\Controllers\KegiatanController::class, 'approve'])->name('kegiatan.approve');

    // Pencairan Routes
    Route::get('/pencairan', [\App\Http\Controllers\PencairanController::class, 'index'])->name('pencairan.index');
    Route::get('/kegiatan/{kegiatan}/pencairan/sisa-dana', [\App\Http\Controllers\PencairanController::class, 'sisaDana'])->name('pencairan.sisa-dana');
    Route::post('/kegiatan/{kegiatan}/pencairan', [\App\Http\Controllers\PencairanController::class, 'store'])->name('pencairan.store');
    Route::post('/kegiatan/{kegiatan}/pencairan/selesai', [\App\Http\Controllers\PencairanController::class, 'selesai'])->name('pencairan.selesai');

    // Lampiran (Attachments)
    Route::prefix('lampiran')->group(function () {
        Route::get('/anggaran/{anggaran}', [\App\Http\Controllers\LampiranController::class, 'index'])->name('lampiran.index');
        Route::post('/anggaran/{anggaran}', [\App\Http\Controllers\LampiranController::class, 'store'])->name('lampiran.store');
        Route::get('/{lampiran}', [\App\Http\Controllers\LampiranController::class, 'show'])->name('lampiran.show');
        Route::get('/{lampiran}/stream', [\App\Http\Controllers\LampiranController::class, 'stream'])->name('lampiran.stream');
        Route::delete('/{lampiran}', [\App\Http\Controllers\LampiranController::class, 'destroy'])->name('lampiran.destroy');
        Route::post('/{lampiran}/catatan', [\App\Http\Controllers\LampiranController::class, 'saveCatatan'])->name('lampiran.catatan');
        Route::post('/{lampiran}/approve', [\App\Http\Controllers\LampiranController::class, 'approve'])->name('lampiran.approve');
        Route::post('/{lampiran}/resubmit', [\App\Http\Controllers\LampiranController::class, 'resubmit'])->name('lampiran.resubmit');
        Route::get('/{lampiran}/history', [\App\Http\Controllers\LampiranController::class, 'history'])->name('lampiran.history');
    });

    // LPJ (Laporan Pertanggungjawaban)
    Route::prefix('kegiatan/{kegiatan}/lpj')->group(function () {
        Route::get('/review', [\App\Http\Controllers\LpjController::class, 'review'])->name('lpj.review');
        Route::post('/submit', [\App\Http\Controllers\LpjController::class, 'submit'])->name('lpj.submit');
        Route::post('/revise', [\App\Http\Controllers\LpjController::class, 'revise'])->name('lpj.revise');
        Route::post('/resubmit', [\App\Http\Controllers\LpjController::class, 'resubmit'])->name('lpj.resubmit');
        Route::post('/approve', [\App\Http\Controllers\LpjController::class, 'approve'])->name('lpj.approve');
        Route::post('/complete', [\App\Http\Controllers\LpjController::class, 'complete'])->name('lpj.complete');
    });
});

require __DIR__.'/auth.php';

Route::middleware(['auth', 'role:Admin'])->prefix('admin')->group(function () {
    Route::get('/user-management', [\App\Http\Controllers\Admin\AccountController::class, 'index'])->name('admin.users.index');
    Route::post('/user-management', [\App\Http\Controllers\Admin\AccountController::class, 'store'])->name('admin.users.store');
    Route::put('/user-management/{user}', [\App\Http\Controllers\Admin\AccountController::class, 'update'])->name('admin.users.update');
    Route::put('/user-management/{user}/change-password', [\App\Http\Controllers\Admin\AccountController::class, 'changePassword'])->name('admin.users.change-password');
    Route::delete('/user-management/{user}', [\App\Http\Controllers\Admin\AccountController::class, 'destroy'])->name('admin.users.destroy');

    // Panduan Routes
    Route::get('/panduan', [\App\Http\Controllers\Admin\PanduanController::class, 'index'])->name('admin.panduan.index');
    Route::post('/panduan', [\App\Http\Controllers\Admin\PanduanController::class, 'store'])->name('admin.panduan.store');
    Route::put('/panduan/{panduan}', [\App\Http\Controllers\Admin\PanduanController::class, 'update'])->name('admin.panduan.update');
    Route::delete('/panduan/{panduan}', [\App\Http\Controllers\Admin\PanduanController::class, 'destroy'])->name('admin.panduan.destroy');
    Route::get('/panduan/{panduan}/download', [\App\Http\Controllers\Admin\PanduanController::class, 'download'])->name('admin.panduan.download');

    // Logs Routes
    Route::get('/logs', [\App\Http\Controllers\Admin\LogController::class, 'index'])->name('admin.logs.index');

    // Master Data Routes
    Route::prefix('master')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\MasterDataController::class, 'index'])->name('admin.master.index');
        Route::get('/{type}', [\App\Http\Controllers\Admin\MasterDataController::class, 'indexResource'])->name('admin.master.resource.index');
        Route::post('/{type}', [\App\Http\Controllers\Admin\MasterDataController::class, 'store'])->name('admin.master.store');
        Route::put('/{type}/{id}', [\App\Http\Controllers\Admin\MasterDataController::class, 'update'])->name('admin.master.update');
        Route::delete('/{type}/{id}', [\App\Http\Controllers\Admin\MasterDataController::class, 'destroy'])->name('admin.master.destroy');
    });
});
