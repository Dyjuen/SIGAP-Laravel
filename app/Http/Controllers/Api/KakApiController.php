<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKLogStatus;
use App\Models\KAKManfaat;
use App\Models\KAKTahapan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KakApiController extends Controller
{
    /**
     * List KAKs for the current user (role-aware).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = KAK::with(['status', 'tipeKegiatan']);

        if ($user->role_id === 3) {
            // Pengusul: only own KAKs
            $query->where('pengusul_user_id', $user->user_id);
        } elseif ($user->role_id === 1) {
            // Admin: sees all
        } else {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if ($request->filled('search')) {
            $query->where('nama_kegiatan', 'ilike', '%'.$request->search.'%');
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        $kaks = $query->orderBy('updated_at', 'desc')->get()->map(fn ($kak) => [
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => $kak->nama_kegiatan,
            'status_id' => $kak->status_id,
            'status_nama' => $kak->status?->nama_status ?? 'Draft',
            'tipe' => $kak->tipeKegiatan?->nama_tipe,
            'updated_at' => $kak->updated_at?->format('d M Y'),
            'tanggal_mulai' => $kak->tanggal_mulai?->format('d M Y'),
            'tanggal_selesai' => $kak->tanggal_selesai?->format('d M Y'),
        ]);

        return response()->json($kaks);
    }

    /**
     * Get Pengusul's dashboard stats (real data per their user_id).
     */
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        if ($user->role_id === 3) {
            $uid = $user->user_id;

            return response()->json([
                'total_kak' => KAK::where('pengusul_user_id', $uid)->count(),
                'draft_kak' => KAK::where('pengusul_user_id', $uid)->where('status_id', 1)->count(),
                'review_kak' => KAK::where('pengusul_user_id', $uid)->where('status_id', 2)->count(),
                'approved_kak' => KAK::where('pengusul_user_id', $uid)->where('status_id', 3)->count(),
                'rejected_kak' => KAK::where('pengusul_user_id', $uid)->whereIn('status_id', [4, 5])->count(),
            ]);
        }

        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    /**
     * Get recent KAKs for Pengusul dashboard.
     */
    public function recentKaks(Request $request)
    {
        $user = $request->user();

        if ($user->role_id !== 3) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $kaks = KAK::with(['status', 'tipeKegiatan'])
            ->where('pengusul_user_id', $user->user_id)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($kak) => [
                'kak_id' => $kak->kak_id,
                'nama_kegiatan' => $kak->nama_kegiatan,
                'status_id' => $kak->status_id,
                'status_nama' => $kak->status?->nama_status ?? 'Draft',
                'tipe' => $kak->tipeKegiatan?->nama_tipe,
                'updated_at' => $kak->updated_at?->format('d M Y'),
            ]);

        return response()->json($kaks);
    }

    /**
     * Show a single KAK detail.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::with([
            'status', 'tipeKegiatan', 'pengusul',
            'manfaat', 'tahapan', 'targets',
            'ikus.iku', 'ikus.satuan',
            'anggaran',
            'approvals.approver',
        ])->findOrFail($id);

        // Pengusul can only see own KAKs
        if ($user->role_id === 3 && $kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return response()->json([
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => $kak->nama_kegiatan,
            'deskripsi_kegiatan' => $kak->deskripsi_kegiatan,
            'metode_pelaksanaan' => $kak->metode_pelaksanaan,
            'tanggal_mulai' => $kak->tanggal_mulai?->format('Y-m-d'),
            'tanggal_selesai' => $kak->tanggal_selesai?->format('Y-m-d'),
            'lokasi' => $kak->lokasi,
            'sasaran_utama' => $kak->sasaran_utama,
            'kurun_waktu_pelaksanaan' => $kak->kurun_waktu_pelaksanaan,
            'status_id' => $kak->status_id,
            'status_nama' => $kak->status?->nama_status,
            'tipe' => $kak->tipeKegiatan?->nama_tipe,
            'tipe_kegiatan_id' => $kak->tipe_kegiatan_id,
            'pengusul_nama' => $kak->pengusul?->nama_lengkap,
            'updated_at' => $kak->updated_at?->format('d M Y'),
            'manfaat' => $kak->manfaat->map(fn ($m) => [
                'manfaat_id' => $m->manfaat_id,
                'manfaat' => $m->manfaat,
            ]),
            'tahapan' => $kak->tahapan->map(fn ($t) => [
                'tahapan_id' => $t->tahapan_id,
                'nama_tahapan' => $t->nama_tahapan,
                'urutan' => $t->urutan,
            ])->sortBy('urutan')->values(),
            'indikator_kinerja' => $kak->targets->map(fn ($t) => [
                'target_id' => $t->target_id,
                'bulan_indikator' => $t->bulan_indikator,
                'deskripsi_target' => $t->deskripsi_target,
                'persentase_target' => $t->persentase_target,
            ]),
            'rab' => $kak->anggaran->map(fn ($a) => [
                'anggaran_id' => $a->anggaran_id,
                'uraian' => $a->uraian,
                'volume1' => $a->volume1,
                'volume2' => $a->volume2,
                'volume3' => $a->volume3,
                'harga_satuan' => $a->harga_satuan,
                'jumlah_diusulkan' => $a->jumlah_diusulkan,
            ]),
            'approvals' => $kak->approvals->map(fn ($a) => [
                'approver_nama' => $a->approver?->nama_lengkap,
                'status' => $a->status,
                'catatan' => $a->catatan,
                'tanggal' => $a->tanggal_telaah?->format('d M Y'),
            ]),
        ]);
    }

    /**
     * Create a new KAK (Pengusul only).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role_id !== 3) {
            return response()->json(['message' => 'Hanya Pengusul yang dapat membuat KAK.'], 403);
        }

        $request->validate([
            'nama_kegiatan' => 'required|string|min:5|max:255',
            'deskripsi_kegiatan' => 'required|string|min:5',
            'metode_pelaksanaan' => 'required|string|min:5',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'lokasi' => 'required|string|max:255',
            'tipe_kegiatan_id' => 'required|exists:m_tipe_kegiatan,tipe_kegiatan_id',
            'sasaran_utama' => 'required|string|max:255',
            'manfaat' => 'required|array|min:1',
            'manfaat.*.value' => 'required|string',
            'tahapan' => 'required|array|min:1',
            'tahapan.*.nama_tahapan' => 'required|string',
            'rab' => 'required|array|min:1',
            'rab.*.uraian' => 'required|string',
            'rab.*.volume1' => 'required|numeric|min:0',
            'rab.*.harga_satuan' => 'required|numeric|min:0',
            'rab.*.kategori_belanja_id' => 'required|integer',
        ]);

        $kak = DB::transaction(function () use ($request, $user) {
            $start = Carbon::parse($request->tanggal_mulai);
            $end = Carbon::parse($request->tanggal_selesai);
            $diffDays = $start->diffInDays($end) + 1;
            if ($diffDays < 30) {
                $kurunWaktu = "{$diffDays} Hari";
            } else {
                $months = (int) floor($diffDays / 30);
                $days = $diffDays % 30;
                $kurunWaktu = $days > 0 ? "{$months} Bulan {$days} Hari" : "{$months} Bulan";
            }

            $kak = KAK::create([
                'nama_kegiatan' => $request->nama_kegiatan,
                'deskripsi_kegiatan' => $request->deskripsi_kegiatan,
                'metode_pelaksanaan' => $request->metode_pelaksanaan,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'kurun_waktu_pelaksanaan' => $kurunWaktu,
                'lokasi' => $request->lokasi,
                'tipe_kegiatan_id' => $request->tipe_kegiatan_id,
                'sasaran_utama' => $request->sasaran_utama,
                'pengusul_user_id' => $user->user_id,
                'status_id' => 1, // Draft
            ]);

            // Manfaat
            foreach ($request->manfaat as $m) {
                if (! empty($m['value'])) {
                    KAKManfaat::create(['kak_id' => $kak->kak_id, 'manfaat' => $m['value']]);
                }
            }

            // Tahapan
            foreach ($request->tahapan as $i => $t) {
                KAKTahapan::create([
                    'kak_id' => $kak->kak_id,
                    'nama_tahapan' => $t['nama_tahapan'],
                    'urutan' => $i + 1,
                ]);
            }

            // RAB
            foreach ($request->rab as $r) {
                $vol1 = $r['volume1'];
                $vol2 = $r['volume2'] ?? 1;
                $vol3 = $r['volume3'] ?? 1;
                $harga = $r['harga_satuan'];
                KAKAnggaran::create([
                    'kak_id' => $kak->kak_id,
                    'uraian' => $r['uraian'],
                    'volume1' => $vol1,
                    'volume2' => $r['volume2'] ?? null,
                    'volume3' => $r['volume3'] ?? null,
                    'harga_satuan' => $harga,
                    'jumlah_diusulkan' => $vol1 * $vol2 * $vol3 * $harga,
                    'kategori_belanja_id' => $r['kategori_belanja_id'],
                    'satuan1_id' => $r['satuan1_id'] ?? null,
                ]);
            }

            return $kak;
        });

        return response()->json([
            'message' => 'KAK berhasil dibuat.',
            'kak_id' => $kak->kak_id,
        ], 201);
    }

    /**
     * Submit KAK for review (Draft/Revisi → Review).
     */
    public function submit(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        if ($user->role_id !== 3 || $kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if (! in_array($kak->status_id, [1, 5])) {
            return response()->json(['message' => 'KAK hanya dapat diajukan jika berstatus Draft atau Revisi.'], 422);
        }

        DB::transaction(function () use ($kak, $user) {
            $old = $kak->status_id;
            $kak->status_id = 2;
            $kak->save();

            KAKLogStatus::create([
                'kak_id' => $kak->kak_id,
                'status_id_lama' => $old,
                'status_id_baru' => 2,
                'actor_user_id' => $user->user_id,
                'created_at' => now(),
            ]);
        });

        return response()->json(['message' => 'KAK berhasil diajukan untuk verifikasi.']);
    }

    /**
     * Delete KAK (Draft or Rejected only, Pengusul owner only).
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        if ($user->role_id !== 3 || $kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if (! in_array($kak->status_id, [1, 4])) {
            return response()->json(['message' => 'KAK hanya dapat dihapus jika berstatus Draft atau Ditolak.'], 422);
        }

        $kak->delete();

        return response()->json(['message' => 'KAK berhasil dihapus.']);
    }
}
