<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
});
