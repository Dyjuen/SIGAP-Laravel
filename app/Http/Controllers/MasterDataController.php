<?php

namespace App\Http\Controllers;

use App\Models\Iku;
use App\Models\KategoriBelanja;
use App\Models\MataAnggaran;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use Illuminate\Http\JsonResponse;

class MasterDataController extends Controller
{
    public function getIku(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Iku::all(),
            'message' => 'Data IKU berhasil diambil.',
        ]);
    }

    public function getTipeKegiatan(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => TipeKegiatan::orderBy('tipe_kegiatan_id')->get(),
            'message' => 'Data Tipe Kegiatan berhasil diambil.',
        ]);
    }

    public function getSatuan(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Satuan::all(),
            'message' => 'Data Satuan berhasil diambil.',
        ]);
    }

    public function getKategoriBelanja(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => KategoriBelanja::where('is_active', true)
                ->orderBy('urutan')
                ->get(),
            'message' => 'Data Kategori Belanja berhasil diambil.',
        ]);
    }

    public function getMataAnggaran(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => MataAnggaran::all(),
            'message' => 'Data Mata Anggaran berhasil diambil.',
        ]);
    }
}
