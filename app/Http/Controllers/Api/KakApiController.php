<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKApproval;
use App\Models\KAKLogStatus;
use App\Models\KAKManfaat;
use App\Models\KAKTahapan;
use App\Models\KAKTarget;
use App\Models\KAKIku;
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
            'target_iku' => $kak->ikus->map(fn ($ti) => [
                'iku_id' => $ti->iku_id,
                'kode_iku' => $ti->iku?->kode_iku,
                'nama_iku' => $ti->iku?->nama_iku,
                'target' => $ti->target,
                'satuan_id' => $ti->satuan_id,
                'nama_satuan' => $ti->satuan?->nama_satuan,
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
            'tahapan_pelaksanaan' => 'required|array|min:1',
            'tahapan_pelaksanaan.*.nama_tahapan' => 'required|string',
            'indikator_kinerja' => 'nullable|array',
            'indikator_kinerja.*.deskripsi_target' => 'required_with:indikator_kinerja|string',
            'indikator_kinerja.*.bulan_indikator' => 'nullable|string',
            'indikator_kinerja.*.persentase_target' => 'nullable|numeric',
            'target_iku' => 'nullable|array',
            'target_iku.*.iku_id' => 'required_with:target_iku|integer|exists:m_iku,iku_id',
            'target_iku.*.target' => 'required_with:target_iku|string',
            'target_iku.*.satuan_id' => 'nullable|integer|exists:m_satuan,satuan_id',
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
            foreach ($request->tahapan_pelaksanaan as $i => $t) {
                KAKTahapan::create([
                    'kak_id' => $kak->kak_id,
                    'nama_tahapan' => $t['nama_tahapan'],
                    'urutan' => $i + 1,
                ]);
            }

            // Indikator Kinerja
            if ($request->has('indikator_kinerja') && is_array($request->indikator_kinerja)) {
                foreach ($request->indikator_kinerja as $i) {
                    if (!empty($i['deskripsi_target'])) {
                        KAKTarget::create([
                            'kak_id' => $kak->kak_id,
                            'bulan_indikator' => $i['bulan_indikator'] ?? null,
                            'deskripsi_target' => $i['deskripsi_target'],
                            'persentase_target' => $i['persentase_target'] ?? null,
                        ]);
                    }
                }
            }

            // Target IKU
            if ($request->has('target_iku') && is_array($request->target_iku)) {
                foreach ($request->target_iku as $ti) {
                    if (!empty($ti['iku_id']) && !empty($ti['target'])) {
                        KAKIku::create([
                            'kak_id' => $kak->kak_id,
                            'iku_id' => $ti['iku_id'],
                            'target' => $ti['target'],
                            'satuan_id' => $ti['satuan_id'] ?? null,
                        ]);
                    }
                }
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
     * Update an existing KAK (Draft or Revisi only, Pengusul owner only).
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        if ($user->role_id !== 3 || $kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if (! in_array($kak->status_id, [1, 5])) {
            return response()->json(['message' => 'KAK hanya dapat diubah jika berstatus Draft atau Revisi.'], 422);
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
            'tahapan_pelaksanaan' => 'required|array|min:1',
            'tahapan_pelaksanaan.*.nama_tahapan' => 'required|string',
            'indikator_kinerja' => 'nullable|array',
            'indikator_kinerja.*.deskripsi_target' => 'required_with:indikator_kinerja|string',
            'indikator_kinerja.*.bulan_indikator' => 'nullable|string',
            'indikator_kinerja.*.persentase_target' => 'nullable|numeric',
            'target_iku' => 'nullable|array',
            'target_iku.*.iku_id' => 'required_with:target_iku|integer|exists:m_iku,iku_id',
            'target_iku.*.target' => 'required_with:target_iku|string',
            'target_iku.*.satuan_id' => 'nullable|integer|exists:m_satuan,satuan_id',
            'rab' => 'required|array|min:1',
            'rab.*.uraian' => 'required|string',
            'rab.*.volume1' => 'required|numeric|min:0',
            'rab.*.harga_satuan' => 'required|numeric|min:0',
            'rab.*.kategori_belanja_id' => 'required|integer',
        ]);

        DB::transaction(function () use ($request, $kak) {
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

            $kak->update([
                'nama_kegiatan' => $request->nama_kegiatan,
                'deskripsi_kegiatan' => $request->deskripsi_kegiatan,
                'metode_pelaksanaan' => $request->metode_pelaksanaan,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'kurun_waktu_pelaksanaan' => $kurunWaktu,
                'lokasi' => $request->lokasi,
                'tipe_kegiatan_id' => $request->tipe_kegiatan_id,
                'sasaran_utama' => $request->sasaran_utama,
            ]);

            // Delete and recreate Manfaat
            $kak->manfaat()->delete();
            foreach ($request->manfaat as $m) {
                if (! empty($m['value'])) {
                    KAKManfaat::create(['kak_id' => $kak->kak_id, 'manfaat' => $m['value']]);
                }
            }

            // Delete and recreate Tahapan
            $kak->tahapan()->delete();
            foreach ($request->tahapan_pelaksanaan as $i => $t) {
                KAKTahapan::create([
                    'kak_id' => $kak->kak_id,
                    'nama_tahapan' => $t['nama_tahapan'],
                    'urutan' => $i + 1,
                ]);
            }

            // Delete and recreate Indikator Kinerja
            $kak->targets()->delete();
            if ($request->has('indikator_kinerja') && is_array($request->indikator_kinerja)) {
                foreach ($request->indikator_kinerja as $i) {
                    if (!empty($i['deskripsi_target'])) {
                        KAKTarget::create([
                            'kak_id' => $kak->kak_id,
                            'bulan_indikator' => $i['bulan_indikator'] ?? null,
                            'deskripsi_target' => $i['deskripsi_target'],
                            'persentase_target' => $i['persentase_target'] ?? null,
                        ]);
                    }
                }
            }

            // Delete and recreate Target IKU
            $kak->ikus()->delete();
            if ($request->has('target_iku') && is_array($request->target_iku)) {
                foreach ($request->target_iku as $ti) {
                    if (!empty($ti['iku_id']) && !empty($ti['target'])) {
                        KAKIku::create([
                            'kak_id' => $kak->kak_id,
                            'iku_id' => $ti['iku_id'],
                            'target' => $ti['target'],
                            'satuan_id' => $ti['satuan_id'] ?? null,
                        ]);
                    }
                }
            }

            // Delete and recreate RAB
            $kak->anggaran()->delete();
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
        });

        return response()->json(['message' => 'KAK berhasil diperbarui.']);
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

    /**
     * Approve KAK (Verifikator only, Review → Approved).
     */
    public function approve(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        // Check if user is Verifikator (role_id 2)
        if ($user->role_id !== 2) {
            return response()->json(['message' => 'Hanya Verifikator yang dapat menyetujui KAK.'], 403);
        }

        if ($kak->status_id !== 2) {
            return response()->json(['message' => 'Hanya KAK dalam status Review yang dapat disetujui.'], 422);
        }

        DB::transaction(function () use ($kak, $user) {
            $kak->status_id = 3; // Approved
            $kak->save();

            KAKLogStatus::create([
                'kak_id' => $kak->kak_id,
                'status_id_lama' => 2,
                'status_id_baru' => 3,
                'actor_user_id' => $user->user_id,
                'created_at' => now(),
            ]);

            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => $user->user_id,
                'status' => 'Disetujui',
                'tanggal_telaah' => now(),
                'catatan' => null,
            ]);
        });

        return response()->json(['message' => 'KAK berhasil disetujui.']);
    }

    /**
     * Reject KAK (Verifikator only, Review → Rejected).
     */
    public function reject(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        // Check if user is Verifikator (role_id 2)
        if ($user->role_id !== 2) {
            return response()->json(['message' => 'Hanya Verifikator yang dapat menolak KAK.'], 403);
        }

        if ($kak->status_id !== 2) {
            return response()->json(['message' => 'Hanya KAK dalam status Review yang dapat ditolak.'], 422);
        }

        $request->validate([
            'catatan' => 'required|string|min:5',
        ]);

        DB::transaction(function () use ($request, $kak, $user) {
            $kak->status_id = 4; // Rejected
            $kak->save();

            KAKLogStatus::create([
                'kak_id' => $kak->kak_id,
                'status_id_lama' => 2,
                'status_id_baru' => 4,
                'actor_user_id' => $user->user_id,
                'created_at' => now(),
            ]);

            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => $user->user_id,
                'status' => 'Ditolak',
                'tanggal_telaah' => now(),
                'catatan' => $request->catatan,
            ]);
        });

        return response()->json(['message' => 'KAK telah ditolak.']);
    }

    /**
     * Request Revision (Verifikator only, Review → Revision).
     */
    public function requestRevision(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        // Check if user is Verifikator (role_id 2)
        if ($user->role_id !== 2) {
            return response()->json(['message' => 'Hanya Verifikator yang dapat meminta revisi.'], 403);
        }

        if ($kak->status_id !== 2) {
            return response()->json(['message' => 'Hanya KAK dalam status Review yang dapat diminta revisi.'], 422);
        }

        $request->validate([
            'catatan' => 'nullable|string',
            'catatan_kak' => 'nullable|array',
        ]);

        DB::transaction(function () use ($request, $kak, $user) {
            $kak->status_id = 5; // Revision
            
            // Clear previous revision notes first
            $kak->catatan_nama_kegiatan = null;
            $kak->catatan_deskripsi_kegiatan = null;
            $kak->catatan_tipe_kegiatan = null;
            $kak->catatan_sasaran_utama = null;
            $kak->catatan_metode_pelaksanaan = null;
            $kak->catatan_lokasi = null;
            $kak->catatan_tanggal = null;

            // Apply new revision notes
            $catatanKak = $request->input('catatan_kak', []);
            $kakFieldsMap = [
                'nama_kegiatan' => 'catatan_nama_kegiatan',
                'deskripsi_kegiatan' => 'catatan_deskripsi_kegiatan',
                'tipe_kegiatan_id' => 'catatan_tipe_kegiatan',
                'sasaran_utama' => 'catatan_sasaran_utama',
                'metode_pelaksanaan' => 'catatan_metode_pelaksanaan',
                'lokasi' => 'catatan_lokasi',
                'tanggal' => 'catatan_tanggal',
            ];

            foreach ($kakFieldsMap as $frontendKey => $dbCol) {
                if (isset($catatanKak[$frontendKey]) && ! empty($catatanKak[$frontendKey])) {
                    $kak->$dbCol = $catatanKak[$frontendKey];
                }
            }

            $kak->save();

            KAKLogStatus::create([
                'kak_id' => $kak->kak_id,
                'status_id_lama' => 2,
                'status_id_baru' => 5,
                'actor_user_id' => $user->user_id,
                'created_at' => now(),
            ]);

            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => $user->user_id,
                'status' => 'Revisi Diminta',
                'tanggal_telaah' => now(),
                'catatan' => $request->catatan,
            ]);
        });

        return response()->json(['message' => 'Pengusul diminta untuk merevisi KAK.']);
    }
}
