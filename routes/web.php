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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
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
