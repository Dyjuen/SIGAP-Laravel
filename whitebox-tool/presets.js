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

    "DashboardService:getPanduans": {
        module: "Modul Dashboard",
        node: `# DashboardService:getPanduans
1:entry:public function getPanduans(?int $roleId):0
2:if:! $roleId:1
3:exit:return [];:0
4:stmt:return Panduan::where(...)->orWhereNull(...)->get()->map(...)->toArray();:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)`,
    },

    "DashboardService:getPpkStatsAndRecent": {
        module: "Modul Dashboard",
        node: `# DashboardService:getPpkStatsAndRecent
1:entry:public function getPpkStatsAndRecent(int $limit = 5):0
2:stmt:$pendingCount = ...count(); $approvedCount = ...count(); $rejectedCount = ...count();:0
3:stmt:$totalKegiatan = Kegiatan::count();:0
4:stmt:$pendingKegiatan = Kegiatan::with(...)->whereHas(...)->latest()->limit()->get()->map(...)->toArray();:0
5:exit:return [...];:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5`,
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

    "DashboardService:getDirekturDashboardData": {
        module: "Modul Dashboard",
        node: `# DashboardService:getDirekturDashboardData
1:entry:public function getDirekturDashboardData(string $period):0
2:stmt:$startDate = $this->getStartDate($period);:0
3:stmt:return [...]:0`,
        edge: `# Edges
1->2
2->3`,
    },

    "DashboardService:getBendaharaStatsAndKegiatans": {
        module: "Modul Dashboard",
        node: `# DashboardService:getBendaharaStatsAndKegiatans
1:entry:public function getBendaharaStatsAndKegiatans():0
2:stmt:Fetch $kegiatans with sums and roles:0
3:stmt:Load anggaran sum:0
4:stmt:Initialize $waitingCount, $disbursedCount, etc:0
5:loop:map each $kegiatan:1
6:stmt:$totalAnggaran, $totalDicairkan, $currentApproval:0
7:stmt:$isWaitingDisbursement, $isDisbursed, $isLpjVerification:0
8:if:$isWaitingDisbursement:1
9:stmt:$waitingCount++; $totalUndisbursedAmount += $totalAnggaran;:0
10:if:$isDisbursed:1
11:stmt:$disbursedCount++; $totalDisbursedAmount += $totalAnggaran;:0
12:if:$isLpjVerification && $kegiatan->lpj_submitted_at:2
13:stmt:$lpjCount++;:0
14:stmt:$status = 'waiting':0
15:if:$isLpjVerification:1
16:ternary:$status = $kegiatan->lpj_submitted_at ? 'lpj_submitted' : 'lpj_waiting';:1
17:elseif:$isDisbursed:1
18:stmt:$status = 'disbursed';:0
19:stmt:return mapped data:0
20:stmt:$pendingLpjs = ...:0
21:exit:return stats and activities:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5
5->6(Loop Body)
6->7
7->8
8->9(TRUE)
8->10(FALSE)
9->10
10->11(TRUE)
10->12(FALSE)
11->12
12->13(TRUE)
12->14(FALSE)
13->14
14->15
15->16(TRUE)
15->17(FALSE)
16->19
17->18(TRUE)
17->19(FALSE)
18->19
19->5(Next)
5->20(Loop Exit)
20->21`,
    },

    "DashboardService:parseJurusan": {
        module: "Modul Dashboard",
        node: `# DashboardService:parseJurusan
1:entry:private function parseJurusan($namaLengkap):0
2:if:! $namaLengkap:1
3:exit:return 'Unit Lain':0
4:stmt:$patterns = [...]:0
5:loop:foreach ($patterns as $jurusan => $pattern):1
6:if:preg_match($pattern, $namaLengkap):1
7:exit:return $jurusan:0
8:exit:return 'Unit Lain':0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5
5->6(Loop Body)
6->7(TRUE)
6->5(FALSE/Next)
5->8(Loop Exit)`,
    },

    "DashboardService:getTrends": {
        module: "Modul Dashboard",
        node: `# DashboardService:getTrends
1:entry:private function getTrends(Carbon $startDate):0
2:stmt:$curr, $end, $trends = []:0
3:loop:while ($curr <= $end):1
4:stmt:$s, $e, $label:0
5:stmt:$cnt = count kegiatan in month:0
6:stmt:$danaRencana = sum anggaran:0
7:stmt:$danaRealisasi = sum pencairan:0
8:stmt:$trends[] = [...]; $curr->addMonth():0
9:exit:return $trends:0`,
        edge: `# Edges
1->2
2->3
3->4(Loop Body)
4->5
5->6
6->7
7->8
8->3(Next)
3->9(Loop Exit)`,
    },

    "DashboardDirekturController:getByJurusan": {
        module: "Modul Dashboard (Analytics)",
        node: `# DashboardDirekturController:getByJurusan
1:entry:private function getByJurusan(Carbon $startDate, $topsisResults = null):0
2:stmt:$users = User::all(); $jurusanUsers = [];:0
3:loop:foreach ($users as $user):1
4:stmt:$jur = $this->parseJurusan(...);:0
5:if:! isset($jurusanUsers[$jur]):1
6:stmt:$jurusanUsers[$jur] = [];:0
7:stmt:$jurusanUsers[$jur][] = $user->user_id;:0
8:ternary:$topsisByJurusan = $topsisResults ? ... : ...;:1
9:loop:foreach ($topsisByJurusan as $namaJurusan => $list):1
10:stmt:$jurusanAverages[...] = ...;:0
11:stmt:Bulk load aggregates ($kakDiajukanMap, etc.):0
12:loop:foreach ($jurusanUsers as $namaJurusan => $userIds):1
13:stmt:$kakDiajukan = 0; ... $danaTerserap = 0;:0
14:loop:foreach ($userIds as $uid):1
15:stmt:$kakDiajukan += ...; ... $danaTerserap += ...;:0
16:ternary:$persentaseSerapan = $danaDiminta > 0 ? ... : 0;:1
17:stmt:$result[] = [...];:0
18:stmt:usort($result, ...);:0
19:exit:return $result;:0`,
        edge: `# Edges
1->2
2->3
3->4(Loop Body)
4->5
5->6(TRUE)
5->7(FALSE)
6->7
7->3(Next)
3->8(Loop Exit)
8->9
9->10(Loop Body)
10->9(Next)
9->11(Loop Exit)
11->12
12->13(Loop Body)
13->14
14->15(Loop Body)
15->14(Next)
14->16(Loop Exit)
16->17
17->12(Next)
12->18(Loop Exit)
18->19`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 3: KAK (KERANGKA ACUAN KERJA)
    // ════════════════════════════════════════════════════════════

    "KakService:create": {
        module: "Modul KAK",
        node: `# KakService:create
1:entry:public function create(array $data, User $actor):0
2:stmt:DB::transaction(function () { ... });:0
3:stmt:$kakData = $this->extractParentData($data);:0
4:stmt:$kakData['kurun_waktu_pelaksanaan'] = $this->computeKurunWaktu(...);:0
5:stmt:$kakData['pengusul_user_id'] = $actor->user_id; $kakData['status_id'] = 1;:0
6:stmt:$kak = KAK::create($kakData);:0
7:stmt:$this->saveChildren($kak, $data);:0
8:exit:return $kak:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5
5->6
6->7
7->8`,
    },

    "KakService:update": {
        module: "Modul KAK",
        node: `# KakService:update
1:entry:public function update(KAK $kak, array $data):0
2:if:! in_array($kak->status_id, [1, 4, 5]):1
3:exit:abort(403, 'Anda tidak dapat mengedit KAK ini.'):0
4:stmt:DB::transaction(function () { ... });:0
5:stmt:$kakData = $this->extractParentData($data);:0
6:stmt:$kakData['kurun_waktu_pelaksanaan'] = $this->computeKurunWaktu(...);:0
7:stmt:$kak->update($kakData);:0
8:stmt:$this->saveChildren($kak, $data, true);:0
9:exit:return $kak:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5
5->6
6->7
7->8
8->9`,
    },

    "KakService:saveChildren": {
        module: "Modul KAK",
        node: `# KakService:saveChildren
1:entry:private function saveChildren(KAK $kak, array $data, bool $isUpdate = false):0
2:stmt:$rawKak = ...; $manfaatData = ...;:0
3:if:$isUpdate:1
4:stmt:$kak->manfaat()->whereNotIn(...)->delete();:0
5:loop:foreach ($manfaatData as $m):1
6:if:$isUpdate && ! empty($m['manfaat_id']):1
7:stmt:$kak->manfaat()->where(...)->update(...);:0
8:stmt:KAKManfaat::create([...]);:0
9:stmt:$tahapanData = ...;:0
10:if:$isUpdate:1
11:stmt:$kak->tahapan()->whereNotIn(...)->delete();:0
12:loop:foreach ($tahapanData as $idx => $t):1
13:if:$isUpdate && ! empty($t['tahapan_id']):1
14:stmt:$kak->tahapan()->where(...)->update(...);:0
15:stmt:KAKTahapan::create([...]);:0
16:stmt:$indikatorData = ...;:0
17:if:$isUpdate:1
18:stmt:$kak->targets()->whereNotIn(...)->delete();:0
19:loop:foreach ($indikatorData as $i):1
20:if:$isUpdate && ! empty($i['target_id']):1
21:stmt:$kak->targets()->where(...)->update(...);:0
22:stmt:KAKTarget::create([...]);:0
23:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
4->5
5->6(Loop Body)
6->7(TRUE)
6->8(FALSE)
7->5(Next)
8->5(Next)
5->9(Loop Exit)
9->10
10->11(TRUE)
10->12(FALSE)
11->12
12->13(Loop Body)
13->14(TRUE)
13->15(FALSE)
14->12(Next)
15->12(Next)
12->16(Loop Exit)
16->17
17->18(TRUE)
17->19(FALSE)
18->19
19->20(Loop Body)
20->21(TRUE)
20->22(FALSE)
21->19(Next)
22->19(Next)
19->23(Loop Exit)`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 4: KAK WORKFLOW (APPROVAL & VERIFIKASI)
    // ════════════════════════════════════════════════════════════

    "KakWorkflowService:submit": {
        module: "Modul KAK Workflow",
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
        module: "Modul KAK Workflow",
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
        module: "Modul KAK Workflow",
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

    "KakWorkflowService:reject": {
        module: "Modul KAK Workflow",
        node: `# KakWorkflowService:reject
1:entry:public function reject(KAK $kak, string $catatan, User $actor):0
2:if:$kak->status_id !== 2:1
3:exit:throw new KakWorkflowException(...):0
4:if:empty($catatan):1
5:exit:throw new KakWorkflowException(...):0
6:stmt:DB::transaction(function () { ... });:0
7:stmt:$kak->status_id = 4; $kak->save(); $this->logStatus(...);:0
8:stmt:KAKApproval::create([...]); event(new KakRejected(...));:0
9:exit:void:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5(TRUE)
4->6(FALSE)
6->7
7->8
8->9`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 5: AUTH & PERMISSIONS
    // ════════════════════════════════════════════════════════════

    "KakController:authorizeAccess": {
        module: "Modul Auth & Permissions",
        node: `# KakController:authorizeAccess
1:entry:private function authorizeAccess(KAK $kak, $requireEdit = false):0
2:stmt:$user = Auth::user();:0
3:if:$user->role_id === 1:1
4:exit:return:0
5:if:$user->role_id === 3:1
6:if:$kak->pengusul_user_id !== $user->user_id:1
7:exit:abort(403, '...'):0
8:exit:return:0
9:if:$requireEdit:1
10:exit:abort(403, '...'):0
11:if:$user->role_id === 2:1
12:if:preg_match('/verifikator(\\d+)/', ...):1
13:stmt:$allowedTipeId = (int) $matches[1];:0
14:if:$kak->tipe_kegiatan_id !== $allowedTipeId:1
15:exit:abort(403, '...'):0
16:exit:abort(403, '...'):0
17:exit:return:0
18:exit:end:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6(TRUE)
5->9(FALSE)
6->7(TRUE)
6->8(FALSE)
9->10(TRUE)
9->11(FALSE)
11->12(TRUE)
11->18(FALSE)
12->13(TRUE)
12->16(FALSE)
13->14
14->15(TRUE)
14->17(FALSE)`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 6: KEGIATAN & PERSETUJUAN
    // ════════════════════════════════════════════════════════════

    "KegiatanService:store": {
        module: "Modul Kegiatan",
        node: `# KegiatanService:store
1:entry:public function store(KAK $kak, array $data, ?UploadedFile $suratPengantar, User $actor):0
2:if:$kak->kegiatan()->exists():1
3:exit:throw new KegiatanException(...):0
4:if:$kak->status_id !== 3:1
5:exit:throw new KegiatanException(...):0
6:stmt:DB::transaction(function () { ... });:0
7:if:$suratPengantar:1
8:stmt:$uploadedPath = $suratPengantar->storeAs(...);:0
9:if:! $uploadedPath:1
10:exit:throw new KegiatanException(...):0
11:stmt:Kegiatan::create([...]);:0
12:loop:foreach (self::APPROVAL_STEPS as $step):1
13:stmt:KegiatanApproval::create([...]);:0
14:stmt:$kak->update(['status_id' => 6]); KegiatanLogStatus::create([...]); event(new KegiatanDiajukan(...));:0
15:exit:return $kegiatan:0
16:stmt:Storage::disk('supabase')->delete($uploadedPath); throw $e;:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5(TRUE)
4->6(FALSE)
6->7
7->8(TRUE)
7->11(FALSE)
8->9
9->10(TRUE)
9->11(FALSE)
11->12
12->13(Loop Body)
13->12(Next Iteration)
12->14(Loop Exit)
14->15
15->16(CATCH)`,
    },

    "KegiatanService:approve": {
        module: "Modul Kegiatan",
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

    // ════════════════════════════════════════════════════════════
    // MODUL 7: PENCAIRAN DANA (UM)
    // ════════════════════════════════════════════════════════════

    "PencairanService:store": {
        module: "Modul Pencairan",
        node: `# PencairanService:store
1:entry:public function store(Kegiatan $kegiatan, float $nominalPencairan, ...):0
2:stmt:$bendaharaCairApproval = query active approval:0
3:if:! $bendaharaCairApproval:1
4:exit:throw new PencairanException 'Not active':0
5:stmt:$summary = $this->computeSisaDana($kegiatan):0
6:if:$nominalPencairan > $summary['sisa_dana']:1
7:exit:throw new PencairanException 'Over budget':0
8:exit:return PencairanDana::create(...):0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6
6->7(TRUE)
6->8(FALSE)`,
    },

    "PencairanService:selesai": {
        module: "Modul Pencairan",
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
    // MODUL 8: LAPORAN PERTANGGUNGJAWABAN (LPJ)
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

    "LpjController:submit": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjController:submit
1:entry:public function submit(SubmitLpjRequest $request, Kegiatan $kegiatan):0
2:stmt:Log::info('LPJ Submit Method Reached', [...]);:0
3:if:$kegiatan->kak->pengusul_user_id !== $request->user()->user_id:1
4:exit:abort(403, 'Anda tidak memiliki akses ke kegiatan ini.'):0
5:stmt:$spkInputs = [...];:0
6:stmt:$this->lpjService->submit($kegiatan, ..., $spkInputs, $request->user());:0
7:exit:return redirect()->route('lpj.index')->with('success', '...'):0
8:stmt:Log::error('LPJ Submit Failed', [...]);:0
9:exit:return redirect()->back()->withErrors([...]):0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6
6->7
7->8(CATCH)
8->9`,
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

    "LpjService:calculateSpkScores": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjService:calculateSpkScores
1:entry:public function calculateSpkScores(Kegiatan $kegiatan):0
2:stmt:$config = SpkConfig::getActive(); $totalBudget = 0; $totalRealization = 0; $anggarans = ...;:0
3:loop:foreach ($anggarans as $anggaran):1
4:stmt:$totalBudget += ...; $totalRealization += ...;:0
5:if:$totalBudget > 0:1
6:stmt:$ratio = $totalRealization / $totalBudget;:0
7:if:abs($ratio - 1) >= 0.001:1
8:stmt:$differencePercentage = ...; $ketepatanAnggaran = ...;:0
9:stmt:$ketepatanLpj = $config->lpj_max;:0
10:if:$kegiatan->tgl_batas_lpj:1
11:stmt:$deadline = ...; $submissionTime = ...;:0
12:if:$submissionTime->gt($deadline):1
13:stmt:$daysLate = ...; $ketepatanLpj = ...;:0
14:exit:return [...]:0`,
        edge: `# Edges
1->2
2->3
3->4(Loop Body)
4->3(Next Iteration)
3->5(Loop Exit)
5->6(TRUE)
5->9(FALSE)
6->7
7->8(TRUE)
7->9(FALSE)
8->9
9->10
10->11(TRUE)
10->14(FALSE)
11->12
12->13(TRUE)
12->14(FALSE)
13->14`,
    },

    "LpjService:getEligibleLpjs": {
        module: "Modul LPJ (Advanced)",
        node: `# LpjService:getEligibleLpjs
1:entry:public function getEligibleLpjs(User $user):0
2:stmt:$role = $user->getRoleName();:0
3:if:! in_array($role, ['Admin', 'Bendahara', 'Pengusul']):1
4:exit:throw new AuthorizationException(...):0
5:stmt:$query = Kegiatan::select(...)->with(...)->whereHas('kak', ...);:0
6:if:$role === 'Pengusul':1
7:stmt:$query->whereHas('kak', ...);:0
8:stmt:$kegiatans = $query->get(); $kegiatans->load(...);:0
9:loop:return $kegiatans->map(...):1
10:exit:return $mappedResult:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6
6->7(TRUE)
6->8(FALSE)
7->8
8->9
9->10`,
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

    "LampiranService:cleanupParents": {
        module: "Modul Lampiran",
        node: `# LampiranService:cleanupParents
1:entry:public function cleanupParents(KegiatanLampiran $lampiran):0
2:stmt:$parent = $lampiran->parent;:0
3:if:$parent && $parent->status_lampiran === 'archived':2
4:stmt:Storage::disk('supabase')->delete(...);:0
5:stmt:$this->cleanupParents($parent); (RECURSION):0
6:stmt:$parent->delete();:0
7:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->7(FALSE)
4->5
5->6
6->7`,
    },

    "LampiranService:store": {
        module: "Modul Lampiran",
        node: `# LampiranService:store
1:entry:public function store(KAKAnggaran $anggaran, $file, ...):0
2:stmt:$count = KegiatanLampiran::count(...):0
3:if:$count >= 10:1
4:exit:throw ValidationException:0
5:stmt:DB::transaction(function () { ... }):0
6:stmt:try:0
7:stmt:$storedPath = $file->storeAs(...):0
8:if:! $storedPath:1
9:stmt:throw new Exception:0
10:exit:return KegiatanLampiran::create(...):0
11:stmt:catch (Exception $e):0
12:if:$storedPath:1
13:stmt:Storage::disk('supabase')->delete(...):0
14:exit:throw $e:0`,
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
9->11
11->12
12->13(TRUE)
12->14(FALSE)`,
    },

    "SendKakWorkflowEmail:handle": {
        module: "Modul Email Workflow",
        node: `# SendKakWorkflowEmail:handle
1:entry:public function handle(mixed $event):0
2:stmt:$kak = $event->kak;:0
3:if:$event instanceof KakSubmitted:1
4:stmt:Load pengusul and find $verifikator:0
5:if:$verifikator && $verifikator->email:2
6:stmt:Send mail and create Notifikasi to Verifikator:0
7:stmt:Load pengusul:0
8:if:$pengusul && $pengusul->email:2
9:stmt:$type = $event->type; $catatan = null;:0
10:if:$event instanceof KakRejected || $event instanceof KakRevised:2
11:stmt:$catatan = $event->catatan;:0
12:if:isset($config[$type]):1
13:stmt:Send mail and create Notifikasi to Pengusul:0
14:exit:void:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->7(FALSE)
4->5
5->6(TRUE)
5->14(FALSE)
6->14
7->8
8->9(TRUE)
8->14(FALSE)
9->10
10->11(TRUE)
10->12(FALSE)
11->12
12->13(TRUE)
12->14(FALSE)
13->14`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 9: MONITORING & ANALYTICS (ADVANCED)
    // ════════════════════════════════════════════════════════════

    "KegiatanMonitoringService:mapMonitoringItem": {
        module: "Modul Monitoring",
        node: `# KegiatanMonitoringService:mapMonitoringItem
1:entry:public function mapMonitoringItem(Kegiatan $kegiatan):0
2:stmt:$dates = [...]; $approvedSteps = []; $currentStatus = 1;:0
3:loop:foreach ($kegiatan->approvals as $approval):1
4:if:($approval->status === 'Disetujui' || ...) && isset(...):2
5:stmt:$mapping = ...; $dates[...] = ...; $approvedSteps[] = ...;:0
6:ternary:$maxApprovedStep = ! empty($approvedSteps) ? max($approvedSteps) : 0;:1
7:stmt:$activeApproval = $kegiatan->approvals->where('status', 'Aktif')->first();:0
8:if:$activeApproval && isset(...):1
9:stmt:$currentStatus = ...;:0
10:ternary:$currentStatus = $maxApprovedStep === 5 ? 6 : $maxApprovedStep + 1;:1
11:exit:return [...]:0`,
        edge: `# Edges
1->2
2->3
3->4(Loop Body)
4->5(TRUE)
4->3(FALSE/Next)
5->3(Next)
3->6(Loop Exit)
6->7
7->8
8->9(TRUE)
8->10(FALSE)
9->11
10->11`,
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
