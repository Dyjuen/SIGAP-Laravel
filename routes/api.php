<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\Api\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Master Data Routes
use App\Http\Controllers\MasterDataController;

Route::get('/master/iku', [MasterDataController::class, 'getIku']);
Route::get('/master/tipe-kegiatan', [MasterDataController::class, 'getTipeKegiatan']);
Route::get('/master/satuan', [MasterDataController::class, 'getSatuan']);
Route::get('/master/kategori-belanja', [MasterDataController::class, 'getKategoriBelanja']);
Route::get('/master/mata-anggaran', [MasterDataController::class, 'getMataAnggaran']);
