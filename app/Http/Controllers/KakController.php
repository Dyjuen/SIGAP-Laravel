<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKakRequest;
use App\Http\Requests\UpdateKakRequest;
use App\Models\Iku;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKIku;
use App\Models\KAKManfaat;
use App\Models\KAKTahapan;
use App\Models\KAKTarget;
use App\Models\KategoriBelanja;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KakController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = KAK::with(['status', 'tipeKegiatan', 'mataAnggaran', 'pengusul']);

        // Filter by role
        if ($user->role_id === 3) {
            // Pengusul: Only own KAKs
            $query->where('pengusul_user_id', $user->user_id);
        } elseif ($user->role_id === 2) {
            // Verifikator: Only KAKs in "Review Verifikator" status (status_id = 2)
            // and matching their Tipe Kegiatan (derived from username 'verifikatorN')
            $query->where('status_id', 2);
            if (preg_match('/verifikator(\d+)/', $user->username, $matches)) {
                $allowedTipeId = (int) $matches[1];
                $query->where('tipe_kegiatan_id', $allowedTipeId);
            } else {
                $query->whereRaw('1 = 0');
            }
        }
        // Others (Admin/PPK): Currently see all? Restrict if needed. For now allow all for visualization.

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama_kegiatan', 'ilike', "%{$search}%");
        }

        if ($request->has('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        $kaks = $query->orderBy('updated_at', 'desc')->paginate(10);

        return Inertia::render('Kak/Index', [
            'kaks' => $kaks,
            'filters' => $request->only(['search', 'status_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        if (Auth::user()->role_id !== 3) {
            abort(403, 'Hanya Pengusul yang dapat membuat KAK.');
        }

        return Inertia::render('Kak/Form', [
            'tipe_kegiatan' => TipeKegiatan::all(),
            'satuan' => Satuan::all(),
            'iku' => Iku::all(),
            'kategori_belanja' => KategoriBelanja::where('is_active', true)->orderBy('urutan')->get(),
            'master_iku' => Iku::all(), // Duplicate for clarity in props if needed
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKakRequest $request)
    {
        DB::transaction(function () use ($request) {
            $user = Auth::user();

            if ($user->role_id !== 3) {
                abort(403, 'Hanya Pengusul yang dapat membuat KAK.');
            }

            // 1. Create Parent KAK
            $kakData = $request->validated('kak');
            // Compute kurun_waktu_pelaksanaan from the two date fields
            $kakData['kurun_waktu_pelaksanaan'] = $this->computeKurunWaktu(
                $kakData['tanggal_mulai'],
                $kakData['tanggal_selesai']
            );
            $kak = KAK::create(array_merge($kakData, [
                'pengusul_user_id' => $user->user_id,
                'status_id' => 1, // Start as Draft
            ]));

            // 2. Insert Children
            $this->insertChildren($kak, $request);

            // Log creation (optional, but good practice)
        });

        return redirect()->route('kak.index')->with('success', 'KAK berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(KAK $kak)
    {
        // Permission check
        $this->authorizeAccess($kak);

        $kak->load([
            'status',
            'tipeKegiatan',
            'mataAnggaran',
            'pengusul',
            'manfaat',
            'tahapan',
            'targets',
            'ikus.iku',
            'ikus.satuan',
            'anggaran.kategoriBelanja',
            'anggaran.satuan1',
            'logStatuses.actor',
            'logStatuses.oldStatus',
            'logStatuses.newStatus',
            'approvals.approver',
        ]);

        return Inertia::render('Kak/Show', [
            'kak' => $kak,
            'tipe_kegiatan' => TipeKegiatan::all(),
            'satuan' => Satuan::all(),
            'iku' => Iku::all(),
            'kategori_belanja' => KategoriBelanja::where('is_active', true)->orderBy('urutan')->get(),
            'mata_anggaran' => \App\Models\MataAnggaran::all(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(KAK $kak)
    {
        $this->authorizeAccess($kak, true); // true = require edit permission (Pengusul only)

        // Only allow edit if Draft (1), Rejected (4), or Revision (5)
        if (! in_array($kak->status_id, [1, 4, 5])) {
            abort(403, 'Anda tidak dapat mengedit KAK ini.');
        }

        $kak->load([
            'manfaat',
            'tahapan',
            'targets',
            'ikus',
            'anggaran',
        ]);

        return Inertia::render('Kak/Form', [
            'kak' => $kak,
            'tipe_kegiatan' => TipeKegiatan::all(),
            'satuan' => Satuan::all(),
            'iku' => Iku::all(),
            'kategori_belanja' => KategoriBelanja::where('is_active', true)->orderBy('urutan')->get(),
            'mata_anggaran' => \App\Models\MataAnggaran::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateKakRequest $request, KAK $kak)
    {
        $this->authorizeAccess($kak, true);

        // Lock for update to prevent concurrent overwrites
        // Use lockForUpdate in a transaction context

        DB::transaction(function () use ($request, $kak) {
            // Re-fetch with lock
            $lockedKak = KAK::lockForUpdate()->find($kak->kak_id);

            // Only allow update if Draft (1), Rejected (4), or Revision (5)
            if (! in_array($lockedKak->status_id, [1, 4, 5])) {
                abort(403, 'Anda tidak dapat mengedit KAK ini.');
            }

            // 1. Update Parent
            $kakData = $request->validated('kak');
            // Compute kurun_waktu_pelaksanaan from the two date fields
            $kakData['kurun_waktu_pelaksanaan'] = $this->computeKurunWaktu(
                $kakData['tanggal_mulai'],
                $kakData['tanggal_selesai']
            );

            // Remove array fields from kakData (manfaat, tahapan, etc are inside 'kak' array in request but not in KAK model)
            $parentData = collect($kakData)->except(['manfaat', 'tahapan_pelaksanaan', 'indikator_kinerja'])->toArray();
            $lockedKak->update($parentData);

            // Sync Children (preserve existing rows to keep catatan_verifikator)
            $this->insertChildren($lockedKak, $request, true);
        });

        return redirect()->route('kak.index')->with('success', 'KAK berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KAK $kak)
    {
        $this->authorizeAccess($kak, true);

        if (! in_array($kak->status_id, [1, 4])) { // Draft or Rejected only
            abort(403, 'Anda hanya dapat menghapus KAK dengan status Draft atau Ditolak.');
        }

        $kak->delete(); // Cascades delete children via DB constraints usually, or manually if needed

        return redirect()->route('kak.index')->with('success', 'KAK berhasil dihapus.');
    }

    // Helper functions

    /**
     * Compute a human-readable duration string from two dates.
     */
    private function computeKurunWaktu(string $start, string $end): string
    {
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);
        $diffDays = $startDate->diffInDays($endDate) + 1; // inclusive

        if ($diffDays < 30) {
            return "{$diffDays} Hari";
        }

        $months = (int) floor($diffDays / 30);
        $days = $diffDays % 30;

        return $days > 0 ? "{$months} Bulan {$days} Hari" : "{$months} Bulan";
    }

    private function insertChildren(KAK $kak, $request, $isUpdate = false)
    {
        // 1. Manfaat (Frontend sends array of strings)
        $manfaatData = collect($request->input('kak.manfaat', []))->filter(fn ($m) => ! empty($m['manfaat']));
        $incomingManfaatIds = $manfaatData->pluck('manfaat_id')->filter()->all();
        if ($isUpdate) {
            $kak->manfaat()->whereNotIn('manfaat_id', $incomingManfaatIds)->delete();
        }
        foreach ($manfaatData as $m) {
            if (! empty($m['manfaat_id'])) {
                $kak->manfaat()->where('manfaat_id', $m['manfaat_id'])->update([
                    'manfaat' => $m['manfaat'],
                ]);
            } else {
                KAKManfaat::create([
                    'kak_id' => $kak->kak_id,
                    'manfaat' => $m['manfaat'],
                ]);
            }
        }

        // 2. Tahapan (Frontend sends array of {nama_tahapan})
        $tahapanData = collect($request->input('kak.tahapan_pelaksanaan', []))->filter(fn ($t) => ! empty($t['nama_tahapan']));
        $incomingTahapanIds = $tahapanData->pluck('tahapan_id')->filter()->all();
        if ($isUpdate) {
            $kak->tahapan()->whereNotIn('tahapan_id', $incomingTahapanIds)->delete();
        }
        foreach ($tahapanData as $idx => $t) {
            if (! empty($t['tahapan_id'])) {
                $kak->tahapan()->where('tahapan_id', $t['tahapan_id'])->update([
                    'nama_tahapan' => $t['nama_tahapan'],
                    'urutan' => $idx + 1,
                ]);
            } else {
                KAKTahapan::create([
                    'kak_id' => $kak->kak_id,
                    'nama_tahapan' => $t['nama_tahapan'],
                    'urutan' => $idx + 1,
                ]);
            }
        }

        // 3. Indikator Kinerja (mapped to t_kak_target)
        $indikatorData = $request->input('kak.indikator_kinerja', []);
        $incomingTargetIds = collect($indikatorData)->pluck('target_id')->filter()->all();
        if ($isUpdate) {
            $kak->targets()->whereNotIn('target_id', $incomingTargetIds)->delete();
        }
        foreach ($indikatorData as $i) {
            if (! empty($i['target_id'])) {
                $kak->targets()->where('target_id', $i['target_id'])->update([
                    'bulan_indikator' => $i['bulan_indikator'] ?? null,
                    'deskripsi_target' => $i['deskripsi_target'],
                    'persentase_target' => $i['persentase_target'] ?? null,
                ]);
            } else {
                KAKTarget::create([
                    'kak_id' => $kak->kak_id,
                    'bulan_indikator' => $i['bulan_indikator'] ?? null,
                    'deskripsi_target' => $i['deskripsi_target'],
                    'persentase_target' => $i['persentase_target'] ?? null,
                ]);
            }
        }

        // 4. Target IKU
        // No auto-increment ID in table t_kak_iku (composite PK kak_id, iku_id).
        $ikuData = $request->input('target_iku', []);
        $incomingIkuIds = collect($ikuData)->pluck('iku_id')->unique()->filter()->all();
        if ($isUpdate) {
            $kak->ikus()->whereNotIn('iku_id', $incomingIkuIds)->delete();
        }
        $ikuData = collect($ikuData)->unique('iku_id')->values();
        foreach ($ikuData as $i) {
            KAKIku::updateOrCreate(
                ['kak_id' => $kak->kak_id, 'iku_id' => $i['iku_id']],
                [
                    'target' => $i['target'],
                    'satuan_id' => $i['satuan_id'],
                ]
            );
        }

        // 5. RAB (Anggaran)
        $rabData = $request->input('rab', []);
        $incomingAnggaranIds = collect($rabData)->pluck('anggaran_id')->filter()->all();
        if ($isUpdate) {
            $kak->anggaran()->whereNotIn('anggaran_id', $incomingAnggaranIds)->delete();
        }
        foreach ($rabData as $r) {
            $data = [
                'kategori_belanja_id' => $r['kategori_belanja_id'],
                'uraian' => $r['uraian'],
                'volume1' => $r['volume1'],
                'satuan1_id' => $r['satuan1_id'],
                'volume2' => $r['volume2'] ?? null,
                'satuan2_id' => $r['satuan2_id'] ?? null,
                'volume3' => $r['volume3'] ?? null,
                'satuan3_id' => $r['satuan3_id'] ?? null,
                'harga_satuan' => $r['harga_satuan'],
                'jumlah_diusulkan' => ($r['volume1'] * ($r['volume2'] ?? 1) * ($r['volume3'] ?? 1) * $r['harga_satuan']),
            ];

            if (! empty($r['anggaran_id'])) {
                $kak->anggaran()->where('anggaran_id', $r['anggaran_id'])->update($data);
            } else {
                $data['kak_id'] = $kak->kak_id;
                KAKAnggaran::create($data);
            }
        }
    }

    private function authorizeAccess(KAK $kak, $requireEdit = false)
    {
        $user = Auth::user();

        // 1. Admin (Role 1) - Bypass
        if ($user->role_id === 1) {
            return;
        }

        // 2. Pengusul (Role 3)
        if ($user->role_id === 3) {
            if ($kak->pengusul_user_id !== $user->user_id) {
                abort(403, 'Anda tidak memiliki akses ke KAK ini.');
            }

            return;
        }

        // If requiring edit permission, only Pengusul (and Admin) can pass
        if ($requireEdit) {
            abort(403, 'Hanya Pengusul yang dapat mengubah data KAK.');
        }

        // 3. Verifikator (Role 2)
        if ($user->role_id === 2) {
            if (preg_match('/verifikator(\d+)/', $user->username, $matches)) {
                $allowedTipeId = (int) $matches[1];
                if ($kak->tipe_kegiatan_id !== $allowedTipeId) {
                    abort(403, 'Anda hanya dapat mengakses KAK dengan Tipe Kegiatan '.$allowedTipeId);
                }
            } else {
                abort(403, 'Username verifikator tidak valid untuk pemetaan tipe kegiatan.');
            }

            return;
        }

        // Others (PPK, etc) - Read only access allowed for now?
        // If strict restriction is needed for others, add here.
    }
}
