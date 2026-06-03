/* ============================================================
   PRESETS.JS — Pre-defined flowgraph data for SIGAP modules
   (Hanya mencakup fungsi dengan Cyclomatic Complexity > 1)
   ============================================================ */

const PRESETS = {
    // ════════════════════════════════════════════════════════════
    // MODUL 1: MANAJEMEN PANDUAN
    // ════════════════════════════════════════════════════════════

    "PanduanService:store": {
        module: "Modul Manajemen Panduan",
        node: `# PanduanService:store
1:entry:public function store(array $data, ?UploadedFile $file = null):0
2:stmt:$pathMedia = null;:0
3:if:$data['tipe_media'] === 'video':1
4:stmt:$pathMedia = $data['path_media']:0
5:elseif:$file:1
6:stmt:$pathMedia = $file->store('panduan', 'supabase'):0
7:stmt:Panduan::create([...]):0
8:exit:return $panduan:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
4->7
5->6(TRUE)
5->7(FALSE)
6->7
7->8`,
    },

    "PanduanService:update": {
        module: "Modul Manajemen Panduan",
        node: `# PanduanService:update
1:entry:public function update(Panduan $panduan, array $data, ?UploadedFile $file = null):0
2:stmt:$panduan->judul_panduan = $data['judul_panduan']; $panduan->target_role_id = $data['target_role_id'] ?? null;:0
3:if:$data['tipe_media'] === 'video':1
4:if:$panduan->tipe_media === 'document' && $panduan->path_media:2
5:stmt:Storage::disk('supabase')->delete($panduan->path_media):0
6:stmt:$panduan->tipe_media = 'video'; $panduan->path_media = $data['path_media']:0
7:if:$file:1
8:if:$panduan->tipe_media === 'document' && $panduan->path_media:2
9:stmt:Storage::disk('supabase')->delete($panduan->path_media):0
10:stmt:$path = $file->store('panduan', 'supabase'); $panduan->tipe_media = 'document'; $panduan->path_media = $path:0
11:stmt:$panduan->tipe_media = 'document':0
12:stmt:$panduan->save():0
13:exit:return $panduan:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->7(FALSE)
4->5(TRUE)
4->6(FALSE)
5->6
6->12
7->8(TRUE)
7->11(FALSE)
8->9(TRUE)
8->10(FALSE)
9->10
10->12
11->12
12->13`,
    },

    "PanduanController:download": {
        module: "Modul Manajemen Panduan",
        node: `# PanduanController:download
1:entry:public function download(Panduan $panduan):0
2:if:$panduan->tipe_media === 'video':1
3:exit:return redirect()->away($panduan->path_media):0
4:if:$panduan->path_media && Storage::disk('supabase')->exists($panduan->path_media):2
5:stmt:$extension = pathinfo(...); $filename = ...;:0
6:if:request()->query('stream'):1
7:exit:return Storage::disk('supabase')->response(...):0
8:exit:return Storage::disk('supabase')->download(...):0
9:exit:abort(404, 'File tidak ditemukan'):0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5(TRUE)
4->9(FALSE)
5->6
6->7(TRUE)
6->8(FALSE)`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 2: DASHBOARD
    // ════════════════════════════════════════════════════════════

    "DashboardController:index": {
        module: "Modul Dashboard",
        node: `# DashboardController:index
1:entry:public function index(Request $request):0
2:stmt:$user = $request->user(); $role = $user->getRoleName(); $panduans = $this->dashboardService->getPanduans(...);:0
3:if:$role === 'Rektorat':1
4:exit:return redirect()->route('dashboard.direktur');:0
5:if:$role === 'Bendahara':1
6:exit:return $this->bendaharaDashboard(...):0
7:elseif:$role === 'Pengusul':1
8:exit:return $this->pengusulDashboard(...):0
9:elseif:$role === 'PPK':1
10:exit:return $this->ppkDashboard(...):0
11:elseif:$role === 'Wadir':1
12:exit:return $this->wadirDashboard(...):0
13:elseif:$role === 'Verifikator':1
14:exit:return $this->verifikatorDashboard(...):0
15:exit:return $this->defaultDashboard(...):0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6(TRUE)
5->7(FALSE)
7->8(TRUE)
7->9(FALSE)
9->10(TRUE)
9->11(FALSE)
11->12(TRUE)
11->13(FALSE)
13->14(TRUE)
13->15(FALSE)`,
    },

    "DashboardService:getVerifikatorStatsAndRecent": {
        module: "Modul Dashboard",
        node: `# DashboardService:getVerifikatorStatsAndRecent
1:entry:public function getVerifikatorStatsAndRecent(User $user, int $limit = 5):0
2:stmt:$tipeKegiatanId = null;:0
3:if:preg_match('/verifikator(\\d+)/', $user->username, $matches):1
4:stmt:$tipeKegiatanId = (int) $matches[1];:0
5:stmt:$pendingKak = KAK::...count(); $approvedKak = ...count(); $totalKak = ...count(); $recentKaks = ...get();:0
6:exit:return [...];:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
4->5
5->6`,
    },

    "DashboardDirekturController:calculateTopsis": {
        module: "Modul Dashboard",
        node: `# DashboardDirekturController:calculateTopsis
1:entry:private function calculateTopsis($kegiatans, $config):0
2:if:$kegiatans->isEmpty():1
3:exit:return collect();:0
4:loop:foreach ($kegiatans as $k):1
5:if:! is_null($k->spk_kesesuaian_waktu):1
6:stmt:$c1 = (int) $k->spk_kesesuaian_waktu;:0
7:elseif:$k->kak->tanggal_mulai && ...:1
8:stmt:$c1 = (int) max(50, min(100, round(100 - $deviasiPersen)));:0
9:stmt:$c1 = (int) ($config->waktu_max ?? 100);:0
10:if:! is_null($k->spk_ketepatan_anggaran):1
11:stmt:$c2 = (int) $k->spk_ketepatan_anggaran;:0
12:stmt:$c2 = (int) max(50, min(100, round(100 - $deviasiPersen))); (or default):0
13:if:! is_null($k->spk_kesesuaian_output):1
14:stmt:$c3 = (int) $k->spk_kesesuaian_output;:0
15:stmt:$c3 = (int) $persenIku;:0
16:if:! is_null($k->spk_ketepatan_lpj):1
17:stmt:$c4 = (int) $k->spk_ketepatan_lpj;:0
18:stmt:$c4 = (int) max(50, ($config->lpj_max ?? 100) - $daysLate);:0
19:stmt:$alternatives[] = [...];:0
20:stmt:$normC1 = sqrt($sumC1); ... (Normalization):0
21:stmt:$weighted = [...]; (Weighting):0
22:stmt:$idealPos = [...]; $idealNeg = [...]; (Ideal Solutions):0
23:loop:foreach ($weighted as $wAlt):1
24:stmt:$score = $sNeg / ($sPos + $sNeg);:0
25:exit:return collect($results);:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5(Loop Body)
5->6(TRUE)
5->7(FALSE)
7->8(TRUE)
7->9(FALSE)
8->10
9->10
6->10
10->11(TRUE)
10->12(FALSE)
11->13
12->13
13->14(TRUE)
13->15(FALSE)
14->16
15->16
16->17(TRUE)
16->18(FALSE)
17->19
18->19
19->4(Next Iteration)
4->20(Loop Exit)
20->21
21->22
22->23
23->24(Loop Body)
24->23(Next Iteration)
23->25(Loop Exit)`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 3: PPK-WD2 WORKFLOW
    // ════════════════════════════════════════════════════════════

    "KakWorkflowService:submit": {
        module: "Modul PPK-WD2",
        node: `# KakWorkflowService:submit
1:entry:public function submit(KAK $kak, User $actor):0
2:if:! in_array($kak->status_id, [1, 5]):1
3:exit:throw new KakWorkflowException(...):0
4:stmt:DB::transaction(function () { ... });:0
5:stmt:$kak->status_id = 2; $kak->save(); $this->logStatus(...); event(new KakSubmitted(...));:0
6:exit:void:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5
5->6`,
    },

    "KakWorkflowService:approve": {
        module: "Modul PPK-WD2",
        node: `# KakWorkflowService:approve
1:entry:public function approve(KAK $kak, array $data, User $actor):0
2:if:$kak->status_id !== 2:1
3:exit:throw new KakWorkflowException(...):0
4:stmt:DB::transaction(function () { ... });:0
5:if:! empty($data['mata_anggaran_id']):1
6:stmt:$mataAnggaranId = $data['mata_anggaran_id']:0
7:stmt:$mataAnggaran = MataAnggaran::firstOrCreate(...); $mataAnggaranId = $mataAnggaran->mata_anggaran_id;:0
8:stmt:$kak->status_id = 3; $kak->mata_anggaran_id = $mataAnggaranId; $this->clearCatatan($kak); $kak->save();:0
9:stmt:KAKApproval::create([...]); event(new KakApproved($kak));:0
10:exit:void:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5
5->6(TRUE)
5->7(FALSE)
6->8
7->8
8->9
9->10`,
    },

    "KakWorkflowService:revise": {
        module: "Modul PPK-WD2",
        node: `# KakWorkflowService:revise
1:entry:public function revise(KAK $kak, array $data, User $actor):0
2:if:$kak->status_id !== 2:1
3:exit:throw new KakWorkflowException(...):0
4:stmt:DB::transaction(function () { ... });:0
5:stmt:$kak->status_id = 5; $this->clearCatatan($kak);:0
6:loop:foreach ($kakFieldsMap as $frontendKey => $dbCol):1
7:if:isset($catatanKak[$frontendKey]):1
8:stmt:$kak->$dbCol = $catatanKak[$frontendKey];:0
9:stmt:$kak->save(); KAKApproval::create(...);:0
10:loop:foreach ($childMaps as $table => $map):1
11:if:isset($anak[$table]) && is_array($anak[$table]):2
12:loop:foreach ($anak[$table] as $itemNote):1
13:if:isset($itemNote['id']) && array_key_exists($noteCol, $itemNote):2
14:stmt:$kak->$relation()->where(...)->update(...);:0
15:stmt:event(new KakRevised(...));:0
16:exit:void:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5
5->6
6->7(Loop Body)
7->8(TRUE)
7->6(FALSE/Next Iteration)
8->6(Next Iteration)
6->9(Loop Exit)
9->10
10->11(Loop Body)
11->12(TRUE)
11->10(FALSE/Next Iteration)
12->13(Loop Body)
13->14(TRUE)
13->12(FALSE/Next Iteration)
14->12(Next Iteration)
12->10(Loop Exit/Next Iteration)
10->15(Loop Exit)
15->16`,
    },

    "KegiatanService:approve": {
        module: "Modul PPK-WD2",
        node: `# KegiatanService:approve
1:entry:public function approve(Kegiatan $kegiatan, string $actorRole, ?string $catatan, User $actor):0
2:stmt:DB::transaction(function () { ... });:0
3:stmt:$activeApproval = KegiatanApproval::where(...)->lockForUpdate()->first();:0
4:if:! $activeApproval:1
5:exit:throw new KegiatanException('Tidak ada langkah persetujuan yang aktif.'):0
6:stmt:$expectedRole = self::APPROVAL_ROLE_MAP[$activeApproval->approval_level] ?? null;:0
7:if:$expectedRole === null || $expectedRole !== $actorRole:2
8:exit:abort(403, 'Akses ditolak'):0
9:if:$activeApproval->status !== 'Aktif':1
10:exit:throw new KegiatanException('Persetujuan ini sudah diproses.'):0
11:stmt:$activeApproval->update(['status' => 'Disetujui', ...]);:0
12:if:isset(self::NEXT_STEP[$level]):1
13:stmt:KegiatanApproval::where(...)->where('approval_level', self::NEXT_STEP[$level])->update(['status' => 'Aktif']);:0
14:stmt:$newStatus = self::NEXT_STATUS[$level] ?? null;:0
15:if:$newStatus:1
16:stmt:$kak->update(['status_id' => $newStatus]); KegiatanLogStatus::create([...]); event(new KegiatanApproved(...));:0
17:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5(TRUE)
4->6(FALSE)
6->7
7->8(TRUE)
7->9(FALSE)
9->10(TRUE)
9->11(FALSE)
11->12
12->13(TRUE)
12->14(FALSE)
13->14
14->15
15->16(TRUE)
15->17(FALSE)
16->17`,
    },

    "PencairanService:selesai": {
        module: "Modul PPK-WD2",
        node: `# PencairanService:selesai
1:entry:public function selesai(Kegiatan $kegiatan, User $actor):0
2:stmt:$bendaharaCairApproval = $kegiatan->approvals()->where(...)->where('status', 'Aktif')->first();:0
3:if:! $bendaharaCairApproval:1
4:exit:throw new PencairanException(...):0
5:stmt:DB::transaction(function () { ... });:0
6:stmt:$bendaharaCairApproval->update(['status' => 'Disetujui', ...]);:0
7:stmt:$bendaharaLpjApproval = KegiatanApproval::where(...)->first();:0
8:if:$bendaharaLpjApproval:1
9:stmt:$bendaharaLpjApproval->update(['status' => 'Aktif']);:0
10:stmt:$kak->update(['status_id' => 10]); KegiatanLogStatus::create([...]); event(new PencairanSelesai(...));:0
11:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6
6->7
7->8
8->9(TRUE)
8->10(FALSE)
9->10
10->11`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 6: LAPORAN PERTANGGUNGJAWABAN (LPJ)
    // ════════════════════════════════════════════════════════════

    "LpjService:submit": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjService:submit
1:entry:public function submit(Kegiatan $kegiatan, array $realisasi, ?array $buktiFiles, array $spkInputs, User $actor):0
2:stmt:$uploadedFiles = [];:0
3:stmt:DB::transaction(function () { ... });:0
4:stmt:$kegiatan = Kegiatan::where(...)->lockForUpdate()->first();:0
5:if:$kegiatan->lpj_submitted_at !== null:1
6:exit:throw new LpjException(...):0
7:loop:foreach ($realisasi as $anggaranId => $data):1
8:if:$anggaran && $anggaran->kak_id === $kegiatan->kak_id:1
9:stmt:$anggaran->update([...]);:0
10:if:is_array($buktiFiles):1
11:loop:foreach ($buktiFiles as $anggaranId => $files):1
12:loop:foreach ($files as $file):1
13:if:! $path => failed:1
14:stmt:throw new Exception(...);:0
15:stmt:KegiatanLampiran::create([...]);:0
16:stmt:$spkScores = $this->calculateSpkScores($kegiatan);:0
17:stmt:$kegiatan->update([..., 'lpj_submitted_at' => now(), 'spk_ketepatan_anggaran' => ..., ...]);:0
18:stmt:$approval = KegiatanApproval::where(...)->where('approval_level', 'Bendahara-LPJ')->first();:0
19:if:$approval:1
20:stmt:$approval->update(['status' => 'Aktif']);:0
21:stmt:KegiatanLogStatus::create([...]); event(new LpjSubmitted(...));:0
22:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5
5->6(TRUE)
5->7(FALSE)
7->8(Loop Body)
8->9(TRUE)
8->7(FALSE/Next Iteration)
9->7(Next Iteration)
7->10(Loop Exit)
10->11(TRUE)
10->16(FALSE)
11->12(Loop Body)
12->13(Loop Body)
13->14(TRUE)
13->15(FALSE)
15->12(Next Iteration)
12->11(Next Iteration)
11->16(Loop Exit)
16->17
17->18
18->19
19->20(TRUE)
19->21(FALSE)
20->21
21->22`,
    },

    "LpjService:revise": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjService:revise
1:entry:public function revise(Kegiatan $kegiatan, ?array $anggaranComments, ?array $lampiranComments, User $actor):0
2:stmt:DB::transaction(function () { ... });:0
3:stmt:KegiatanLampiran::whereHas(...)->update(['catatan_reviewer' => null, ...]);:0
4:stmt:KAKAnggaran::where('kak_id', $kegiatan->kak_id)->update(['catatan_verifikator' => null]);:0
5:if:! empty($lampiranComments):1
6:loop:foreach ($lampiranComments as $comment):1
7:stmt:$lampiran = KegiatanLampiran::find($comment['id']); if ($lampiran) $lampiran->update(...);:0
8:if:! empty($anggaranComments):1
9:loop:foreach ($anggaranComments as $comment):1
10:stmt:$anggaran = KAKAnggaran::find($comment['id']); if ($anggaran) $anggaran->update(...);:0
11:stmt:$approval = KegiatanApproval::where(...)->where('approval_level', 'Bendahara-LPJ')->first();:0
12:if:! $approval:1
13:exit:throw new LpjException(...):0
14:stmt:$approval->update(['status' => 'Revisi', ...]);:0
15:stmt:$kak->update(['status_id' => 12]); KegiatanLogStatus::create([...]); event(new LpjRevised(...));:0
16:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5
5->6(TRUE)
5->8(FALSE)
6->7(Loop Body)
7->6(Next Iteration)
6->8(Loop Exit)
8->9(TRUE)
8->11(FALSE)
9->10(Loop Body)
10->9(Next Iteration)
9->11(Loop Exit)
11->12
12->13(TRUE)
12->14(FALSE)
14->15
15->16`,
    },

    "LpjService:resubmit": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjService:resubmit
1:entry:public function resubmit(Kegiatan $kegiatan, ?array $realisasi, ?array $buktiFiles, ?array $filesToDelete, array $spkInputs, User $actor):0
2:stmt:DB::transaction(function () { ... });:0
3:stmt:$approval = KegiatanApproval::where(...)->where('approval_level', 'Bendahara-LPJ')->first();:0
4:if:! $approval || $approval->status !== 'Revisi':1
5:exit:throw new LpjException(...):0
6:if:! empty($filesToDelete):1
7:stmt:KegiatanLampiran::whereIn(...)->update(['status_lampiran' => 'archived']);:0
8:if:! empty($realisasi):1
9:loop:foreach ($realisasi as $anggaranId => $data):1
10:stmt:$anggaran = KAKAnggaran::find($anggaranId); if ($anggaran) $anggaran->update(...);:0
11:if:is_array($buktiFiles):1
12:loop:foreach ($buktiFiles as $anggaranId => $files):1
13:loop:foreach ($files as $file):1
14:stmt:$path = $file->storeAs(...); KegiatanLampiran::create(...);:0
15:stmt:$spkScores = $this->calculateSpkScores($kegiatan);:0
16:stmt:$kegiatan->update([..., 'lpj_submitted_at' => now(), 'spk_ketepatan_anggaran' => ..., ...]);:0
17:stmt:$approval->update(['status' => 'Aktif', ...]);:0
18:stmt:$kak->update(['status_id' => 11]); KegiatanLogStatus::create([...]); event(new LpjSubmitted(...));:0
19:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5(TRUE)
4->6(FALSE)
6->7(TRUE)
6->8(FALSE)
7->8
8->9(TRUE)
8->11(FALSE)
9->10(Loop Body)
10->9(Next Iteration)
9->11(Loop Exit)
11->12(TRUE)
11->15(FALSE)
12->13(Loop Body)
13->14(Loop Body)
14->13(Next Iteration)
13->12(Next Iteration)
12->15(Loop Exit)
15->16
16->17
17->18
18->19`,
    },

    "LpjService:approve": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjService:approve
1:entry:public function approve(Kegiatan $kegiatan, User $actor):0
2:stmt:DB::transaction(function () { ... });:0
3:stmt:$approval = KegiatanApproval::where(...)->where('approval_level', 'Bendahara-LPJ')->first();:0
4:if:! $approval || ! in_array($approval->status, ['Aktif', 'Revisi']):1
5:exit:throw new LpjException(...):0
6:stmt:$approval->update(['status' => 'Disetujui', ...]);:0
7:stmt:$nextApproval = KegiatanApproval::where(...)->where('approval_level', 'Bendahara-Setor')->first();:0
8:if:$nextApproval:1
9:stmt:$nextApproval->update(['status' => 'Aktif']);:0
10:stmt:$kak->update(['status_id' => 13]); KegiatanLogStatus::create([...]); event(new LpjApproved(...));:0
11:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5(TRUE)
4->6(FALSE)
6->7
7->8
8->9(TRUE)
8->10(FALSE)
9->10
10->11`,
    },

    "LpjService:complete": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjService:complete
1:entry:public function complete(Kegiatan $kegiatan, User $actor):0
2:stmt:DB::transaction(function () { ... });:0
3:stmt:$approval = KegiatanApproval::where(...)->where('status', 'Aktif')->first();:0
4:if:! $approval || $approval->approval_level !== 'Bendahara-Setor':1
5:exit:throw new LpjException(...):0
6:stmt:$approval->update(['status' => 'Disetujui', ...]);:0
7:stmt:$kak->update(['status_id' => 14]); KegiatanLogStatus::create([...]); event(new LpjCompleted(...));:0
8:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5(TRUE)
4->6(FALSE)
6->7
7->8`,
    },

    "SpkController:index": {
        module: "Modul Admin",
        node: `# SpkController:index
1:entry:public function index(Request $request):0
2:stmt:$config = SpkConfig::getActive(); $kegiatansRaw = Kegiatan::with(...)->whereNotNull('lpj_submitted_at')->get();:0
3:loop:foreach ($kegiatansRaw as $kegiatan):1
4:stmt:$totalBudget = ...; $totalRealization = ...; $ketepatanAnggaran = ...;:0
5:if:$kegiatan->tgl_batas_lpj:1
6:stmt:$ketepatanLpj = ...;:0
7:stmt:$ketepatanLpj = $config->lpj_max;:0
8:stmt:$totalScore = ... / 100.0;:0
9:if:$totalScore >= 85:1
10:stmt:$kategori = 'Sangat Baik':0
11:elseif:$totalScore >= 70:1
12:stmt:$kategori = 'Baik':0
13:elseif:$totalScore >= 55:1
14:stmt:$kategori = 'Cukup':0
15:stmt:$kategori = 'Kurang':0
16:stmt:$kegiatans[] = [...]:0
17:stmt:$statistics = [...]:0
18:exit:return Inertia::render('Admin/Spk/Index', [...]):0`,
        edge: `# Edges
1->2
2->3
3->4(Loop Body)
4->5
5->6(TRUE)
5->7(FALSE)
6->8
7->8
8->9
9->10(TRUE)
9->11(FALSE)
11->12(TRUE)
11->13(FALSE)
13->14(TRUE)
13->15(FALSE)
10->16
12->16
14->16
15->16
16->3(Next Iteration)
3->17(Loop Exit)
17->18`,
    },
};

// Helper untuk mengelompokkan
function getPresetsByModule() {
    const modules = {};
    for (const [key, data] of Object.entries(PRESETS)) {
        if (!modules[data.module]) modules[data.module] = [];
        modules[data.module].push({ id: key, ...data });
    }
    return modules;
}
