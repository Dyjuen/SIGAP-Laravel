/* ============================================================
   PRESETS.JS — Pre-defined flowgraph data for SIGAP modules
   (Hanya mencakup fungsi dengan Cyclomatic Complexity > 1)
   ============================================================ */

const PRESETS = {
    // ════════════════════════════════════════════════════════════
    // MODUL 1: MANAJEMEN PANDUAN
    // ════════════════════════════════════════════════════════════

    "PanduanController:store": {
        module: "Modul Manajemen Panduan",
        node: `# PanduanController:store
1:entry:public function store(StorePanduanRequest $request):0
2:stmt:$data = $request->validated(); $pathMedia = null;:0
3:if:$data['tipe_media'] === 'video':1
4:stmt:$pathMedia = $data['path_media']:0
5:elseif:$request->hasFile('file'):1
6:stmt:$pathMedia = $request->file('file')->store():0
7:stmt:Panduan::create([...]):0
8:exit:return redirect()->back() success:0`,
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

    "PanduanController:update": {
        module: "Modul Manajemen Panduan",
        node: `# PanduanController:update
1:entry:public function update(UpdatePanduanRequest $request, Panduan $panduan):0
2:stmt:$data = $request->validated();:0
3:ternary:$panduan->target_role_id = $data['target_role_id'] ?? null;:1
4:if:$data['tipe_media'] === 'video':1
5:if:$panduan->tipe_media === 'document' && $panduan->path_media:2
6:stmt:Storage::disk('supabase')->delete():0
7:stmt:$panduan->tipe_media = 'video'; $panduan->path_media = $data['path_media']:0
8:elseif:$request->hasFile('file'):1
9:if:$panduan->tipe_media === 'document' && $panduan->path_media:2
10:stmt:Storage::disk('supabase')->delete():0
11:stmt:$panduan->tipe_media = 'document'; $panduan->path_media = $path:0
12:stmt:$panduan->tipe_media = 'document' (else fallback):0
13:stmt:$panduan->save():0
14:exit:return redirect()->back() success:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5(TRUE)
4->8(FALSE)
5->6(TRUE)
5->7(FALSE)
6->7
7->13
8->9(TRUE)
8->12(FALSE)
9->10(TRUE)
9->11(FALSE)
10->11
11->13
12->13
13->14`,
    },

    "PanduanController:destroy": {
        module: "Modul Manajemen Panduan",
        node: `# PanduanController:destroy
1:entry:public function destroy(Panduan $panduan):0
2:if:$panduan->tipe_media === 'document' && $panduan->path_media:2
3:stmt:Storage::disk('supabase')->delete($panduan->path_media):0
4:stmt:$panduan->delete():0
5:exit:return redirect()->back() success:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
3->4
4->5`,
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
2:stmt:$user = $request->user(); $role = $user->getRoleName(); $panduans = $this->getPanduans(...);:0
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
15:exit:return $this->defaultDashboard(...) (default match):0`,
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

    "DashboardController:verifikatorDashboard": {
        module: "Modul Dashboard",
        node: `# DashboardController:verifikatorDashboard
1:entry:private function verifikatorDashboard(Request $request, $panduans):0
2:stmt:$user = $request->user(); $tipeKegiatanId = null;:0
3:if:preg_match('/verifikator(\\d+)/', $user->username, $matches):1
4:stmt:$tipeKegiatanId = (int) $matches[1];:0
5:stmt:$pendingKak = KAK::...count(); $approvedKak = ...count(); $totalKak = ...count(); $recentKaks = ...get();:0
6:exit:return Inertia::render('Dashboard', [...]);:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
4->5
5->6`,
    },

    "DashboardDirekturController:getVideos": {
        module: "Modul Dashboard",
        node: `# DashboardDirekturController:getVideos
1:entry:private function getVideos():0
2:stmt:$panduan = Panduan::all(); $videos = [];:0
3:loop:foreach ($panduan as $item):1
4:stmt:$isVideo = false;:0
5:if:empty($item->tipe_media):1
6:if:! empty($item->path_media):1
7:if:filter_var(...) || strpos(...) !== false || strpos(...) !== false:3
8:stmt:$isVideo = true;:0
9:elseif:$item->tipe_media === 'video':1
10:stmt:$isVideo = true;:0
11:if:$isVideo:1
12:stmt:$videos[] = [...];:0
13:exit:return $videos;:0`,
        edge: `# Edges
1->2
2->3
3->4(Loop Body)
4->5
5->6(TRUE)
5->9(FALSE)
6->7(TRUE)
6->11(FALSE)
7->8(TRUE)
7->11(FALSE)
8->11
9->10(TRUE)
9->11(FALSE)
10->11
11->12(TRUE)
11->3(FALSE/Next Iteration)
12->3(Next Iteration)
3->13(Loop Exit)`,
    },

    "DashboardDirekturController:getOverview": {
        module: "Modul Dashboard",
        node: `# DashboardDirekturController:getOverview
1:entry:private function getOverview(Carbon $startDate):0
2:stmt:$totalKak = ...; $kegiatanSelesai = ...; $kegiatanBerlangsung = ...; $danaDiminta = ...; $danaTerserap = ...;:0
3:ternary:$persentaseSerapan = $danaDiminta > 0 ? round(($danaTerserap / $danaDiminta) * 100, 2) : 0;:1
4:stmt:$budgetGrowth = $this->calculateBudgetGrowth($startDate);:0
5:exit:return [...];:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5`,
    },

    "DashboardDirekturController:getByJurusan": {
        module: "Modul Dashboard",
        node: `# DashboardDirekturController:getByJurusan
1:entry:private function getByJurusan(Carbon $startDate):0
2:stmt:$users = User::all(); $jurusanUsers = [];:0
3:loop:foreach ($users as $user):1
4:stmt:$jurusan = $this->parseJurusan($user->nama_lengkap);:0
5:if:! isset($jurusanUsers[$jurusan]):1
6:stmt:$jurusanUsers[$jurusan] = [];:0
7:stmt:$jurusanUsers[$jurusan][] = $user->user_id;:0
8:stmt:$result = [];:0
9:loop:foreach ($jurusanUsers as $namaJurusan => $userIds):1
10:if:empty($userIds):1
11:stmt:$kakDiajukan = ...; $kegiatanSelesai = ...; $kegiatanBerlangsung = ...; $danaDiminta = ...; $danaTerserap = ...;:0
12:ternary:$persentaseSerapan = $danaDiminta > 0 ? round(...) : 0;:1
13:stmt:$result[] = [...];:0
14:stmt:usort($result, function ...);:0
15:exit:return $result;:0`,
        edge: `# Edges
1->2
2->3
3->4(Loop Body)
4->5
5->6(TRUE)
5->7(FALSE)
6->7
7->3(Next Iteration)
3->8(Loop Exit)
8->9
9->10(Loop Body)
10->9(TRUE/Next Iteration)
10->11(FALSE)
11->12
12->13
13->9(Next Iteration)
9->14(Loop Exit)
14->15`,
    },

    "DashboardDirekturController:getTrends": {
        module: "Modul Dashboard",
        node: `# DashboardDirekturController:getTrends
1:entry:private function getTrends(Carbon $startDate):0
2:stmt:$trends = []; $curr = ...; $end = ...;:0
3:loop:while ($curr <= $end):1
4:stmt:$s = ...; $e = ...; $label = ...; $cnt = ...; $danaRencana = ...; $danaRealisasi = ...; $trends[] = [...]; $curr->addMonth();:0
5:exit:return $trends;:0`,
        edge: `# Edges
1->2
2->3
3->4(Loop Body)
4->3(Next Iteration)
3->5(Loop Exit)`,
    },

    "DashboardDirekturController:parseJurusan": {
        module: "Modul Dashboard",
        node: `# DashboardDirekturController:parseJurusan
1:entry:private function parseJurusan($namaLengkap):0
2:if:! $namaLengkap:1
3:exit:return 'Unit Lain';:0
4:stmt:$patterns = [...];:0
5:loop:foreach ($patterns as $jurusan => $pattern):1
6:if:preg_match($pattern, $namaLengkap):1
7:exit:return $jurusan;:0
8:exit:return 'Unit Lain';:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5
5->6(Loop Body)
6->7(TRUE)
6->5(FALSE/Next Iteration)
5->8(Loop Exit)`,
    },

    "DashboardDirekturController:calculateBudgetGrowth": {
        module: "Modul Dashboard",
        node: `# DashboardDirekturController:calculateBudgetGrowth
1:entry:private function calculateBudgetGrowth(Carbon $startDate):0
2:stmt:$currentStart = ...; $currentEnd = ...; $daysDiff = ...; $previousStart = ...; $previousEnd = ...; $currentBudget = ...; $previousBudget = ...;:0
3:if:$previousBudget == 0:1
4:ternary:return $currentBudget > 0 ? 100 : 0;:1
5:stmt:$growth = (($currentBudget - $previousBudget) / $previousBudget) * 100;:0
6:exit:return round($growth, 2);:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6`,
    },

    "DashboardDirekturController:getStartDate": {
        module: "Modul Dashboard",
        node: `# DashboardDirekturController:getStartDate
1:entry:private function getStartDate($period):0
2:if:$period === '3months':1
3:exit:return now()->subMonths(3);:0
4:elseif:$period === '1year':1
5:exit:return now()->subYear();:0
6:elseif:$period === 'year':1
7:exit:return now()->startOfYear();:0
8:elseif:$period === 'all':1
9:exit:return Carbon::create(2020, 1, 1);:0
10:exit:return now()->subMonths(6);:0`,
        edge: `# Edges
1->2
2->3(TRUE)
2->4(FALSE)
4->5(TRUE)
4->6(FALSE)
6->7(TRUE)
6->8(FALSE)
8->9(TRUE)
8->10(FALSE)`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 3: PPK-WD2 WORKFLOW
    // ════════════════════════════════════════════════════════════

    "KakWorkflowController:submit": {
        module: "Modul PPK-WD2",
        node: `# KakWorkflowController:submit
1:entry:public function submit(KAK $kak):0
2:stmt:$this->authorizeOwner($kak);:0
3:if:! in_array($kak->status_id, [1, 5]):1
4:exit:abort(403, 'Anda hanya dapat mengajukan KAK dengan status Draft atau Revisi.'):0
5:stmt:DB::transaction(function () use ($kak) { ... });:0
6:exit:return back() success:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6`,
    },

    "KakWorkflowController:approve": {
        module: "Modul PPK-WD2",
        node: `# KakWorkflowController:approve
1:entry:public function approve(Request $request, KAK $kak):0
2:stmt:$this->authorizeVerifikator($kak);:0
3:if:$kak->status_id !== 2:1
4:exit:abort(403, 'Hanya KAK dalam status Review yang dapat disetujui.'):0
5:stmt:$request->validate([...]);:0
6:stmt:DB::transaction(function () use ($request, $kak) { $oldStatus = $kak->status_id; ...:0
7:if:$request->filled('mata_anggaran_id'):1
8:stmt:$mataAnggaranId = $request->mata_anggaran_id;:0
9:stmt:$mataAnggaran = MataAnggaran::firstOrCreate(...); $mataAnggaranId = $mataAnggaran->mata_anggaran_id;:0
10:stmt:$kak->status_id = 3; $kak->mata_anggaran_id = $mataAnggaranId; $this->clearCatatan($kak); $kak->save(); ...:0
11:exit:return back() success:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6
6->7
7->8(TRUE)
7->9(FALSE)
8->10
9->10
10->11`,
    },

    "KakWorkflowController:reject": {
        module: "Modul PPK-WD2",
        node: `# KakWorkflowController:reject
1:entry:public function reject(Request $request, KAK $kak):0
2:stmt:$this->authorizeVerifikator($kak);:0
3:if:$kak->status_id !== 2:1
4:exit:abort(403, 'Hanya KAK dalam status Review yang dapat ditolak.'):0
5:stmt:$request->validate(['catatan' => 'required|string']); DB::transaction(function () { ... }):0
6:exit:return back() success:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6`,
    },

    "KakWorkflowController:revise": {
        module: "Modul PPK-WD2",
        node: `# KakWorkflowController:revise
1:entry:public function revise(Request $request, KAK $kak):0
2:stmt:$this->authorizeVerifikator($kak);:0
3:if:$kak->status_id !== 2:1
4:exit:abort(403, 'Hanya KAK dalam status Review yang dapat direvisi.'):0
5:stmt:$request->validate([...]); DB::transaction(function () { ... :0
6:loop:foreach ($kakFieldsMap as $frontendKey => $dbCol):1
7:if:isset($catatanKak[$frontendKey]):1
8:stmt:$kak->$dbCol = $catatanKak[$frontendKey];:0
9:stmt:$kak->save(); $this->logStatus(...); KAKApproval::create(...);:0
10:loop:foreach ($childMaps as $table => $map):1
11:if:isset($anak[$table]) && is_array($anak[$table]):2
12:loop:foreach ($anak[$table] as $itemNote):1
13:if:isset($itemNote['id']) && array_key_exists($noteCol, $itemNote):2
14:stmt:$kak->$relation()->where(...)->update(...);:0
15:stmt:$this->sendMailToPengusul(...);:0
16:exit:return back() success:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
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

    "KegiatanController:approve": {
        module: "Modul PPK-WD2",
        node: `# KegiatanController:approve
1:entry:public function approve(ApproveKegiatanRequest $request, Kegiatan $kegiatan):0
2:stmt:$user = $request->user(); $role = $user->getRoleName(); $activeApproval = $kegiatan->activeApproval()->first();:0
3:if:! $activeApproval:1
4:exit:return back() error 'Tidak ada langkah persetujuan yang aktif.':0
5:if:! isset($expectedRoleMap[$activeApproval->approval_level]) || $expectedRoleMap[$activeApproval->approval_level] !== $role:2
6:exit:abort(403, 'Akses ditolak'):0
7:stmt:DB::beginTransaction();:0
8:try:try block:0
9:stmt:$activeApproval = KegiatanApproval::where(...)->lockForUpdate()->first();:0
10:if:$activeApproval->status !== 'Aktif':1
11:stmt:DB::rollBack();:0
12:exit:return back() error 'Persetujuan ini sudah diproses.':0
13:stmt:$activeApproval->update([...]); $kak = $kegiatan->kak; $oldStatus = $kak->status_id; $newStatus = null;:0
14:if:$activeApproval->approval_level === 'PPK':1
15:stmt:$nextStep = KegiatanApproval::where(...)->where('approval_level', 'Wadir2')->first();:0
16:if:$nextStep:1
17:stmt:$nextStep->update(['status' => 'Aktif']);:0
18:stmt:$newStatus = 7;:0
19:elseif:$activeApproval->approval_level === 'Wadir2':1
20:stmt:$nextStep = KegiatanApproval::where(...)->where('approval_level', 'Bendahara-Cair')->first();:0
21:if:$nextStep:1
22:stmt:$nextStep->update(['status' => 'Aktif']);:0
23:stmt:$newStatus = 8;:0
24:if:$newStatus:1
25:stmt:$kak->update(['status_id' => $newStatus]); KegiatanLogStatus::create([...]); $this->sendApprovalMailToPengusul(...);:0
26:stmt:DB::commit();:0
27:exit:return redirect()->route('kegiatan.index') success:0
28:catch:catch (\\Exception $e):1
29:stmt:DB::rollBack();:0
30:exit:return back() error:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6(TRUE)
5->7(FALSE)
7->8
8->9
9->10
10->11(TRUE)
11->12
10->13(FALSE)
13->14
14->15(TRUE)
15->16
16->17(TRUE)
16->18(FALSE)
17->18
18->24
14->19(FALSE)
19->20(TRUE)
20->21
21->22(TRUE)
21->23(FALSE)
22->23
23->24
19->24(FALSE)
24->25(TRUE)
24->26(FALSE)
25->26
26->27
8->28(Exception)
28->29
29->30`,
    },

    "PencairanController:selesai": {
        module: "Modul PPK-WD2",
        node: `# PencairanController:selesai
1:entry:public function selesai(Request $request, Kegiatan $kegiatan):0
2:stmt:$user = $request->user();:0
3:if:! in_array($user->getRoleName(), ['Bendahara', 'Admin']):1
4:exit:abort(403, 'Hanya Bendahara...'):0
5:stmt:$bendaharaCairApproval = $kegiatan->approvals()->where(...)->first();:0
6:if:! $bendaharaCairApproval:1
7:exit:return redirect()->back() error:0
8:stmt:DB::beginTransaction();:0
9:try:try block:0
10:stmt:$kak = $kegiatan->kak; $oldStatus = $kak->status_id; $bendaharaCairApproval->update([...]);:0
11:stmt:$bendaharaLpjApproval = KegiatanApproval::where(...)->first();:0
12:if:$bendaharaLpjApproval:1
13:stmt:$bendaharaLpjApproval->update(['status' => 'Aktif']);:0
14:stmt:$newStatus = 10; $kak->update([...]); KegiatanLogStatus::create([...]); $totalCair = ...;:0
15:stmt:$this->sendFundsReleasedMail($kegiatan, $totalCair); DB::commit();:0
16:exit:return redirect()->back() success:0
17:catch:catch (\\Exception $e):1
18:stmt:DB::rollBack();:0
19:exit:return redirect()->back() error:0`,
        edge: `# Edges
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6
6->7(TRUE)
6->8(FALSE)
8->9
9->10
10->11
11->12
12->13(TRUE)
12->14(FALSE)
13->14
14->15
15->16
9->17(Exception)
17->18
18->19`,
    },

    // ════════════════════════════════════════════════════════════
    // MODUL 6: LAPORAN PERTANGGUNGJAWABAN (LPJ)
    // ════════════════════════════════════════════════════════════

    "LpjController:submit": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjController:submit
1:entry:public function submit(SubmitLpjRequest $request, Kegiatan $kegiatan):0
2:stmt:$uploadedFiles = []:0
3:try:try block:1
4:stmt:DB::transaction() => $kegiatan->lockForUpdate():0
5:if:$kegiatan->lpj_submitted_at !== null:1
6:exit:return redirect()->back() error:0
7:loop:foreach $request->realisasi as $anggaranId:1
8:if:$anggaran exists && kak_id match:1
9:stmt:$anggaran->update(realisasi data):0
10:if:$request->file('bukti') exists:1
11:loop:foreach $files as $file:1
12:if:!$path => file store failed:1
13:stmt:throw new \\Exception():0
14:stmt:KegiatanLampiran::create():0
15:stmt:$kak->update(status_id => 11):0
16:if:$approval->status === 'Aktif':1
17:stmt:$approval->update(status => 'Aktif'):0
18:stmt:KegiatanLogStatus::create() + sendMail():0
19:exit:return redirect() success:0
20:catch:catch (\\Exception):1
21:stmt:$this->cleanupFiles($uploadedFiles):0
22:exit:return redirect()->back() error:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5
5->6(TRUE)
5->7(FALSE)
6->19
7->8(Loop Body)
8->9(TRUE)
8->7(FALSE/Next)
9->7(Next Iteration)
7->10(After Loop)
10->11(TRUE)
10->15(FALSE)
11->12(Loop Body)
12->13(TRUE)
12->14(FALSE)
13->20(Exception)
14->11(Next Iteration)
11->15(After Loop)
15->16
16->17(TRUE)
16->18(FALSE)
17->18
18->19
12->20(Exception)
20->21
21->22`,
    },

    "LpjController:revise": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjController:revise
1:entry:public function revise(ReviseLpjRequest $request, Kegiatan $kegiatan):0
2:stmt:DB::transaction() => $kegiatan->lockForUpdate():0
3:stmt:KegiatanLampiran::clear comments:0
4:stmt:KAKAnggaran::clear comments:0
5:if:$request->has('lampiran_comments'):1
6:loop:foreach $request->lampiran_comments as $comment:1
7:stmt:$lampiran = KegiatanLampiran::find():0
8:if:$lampiran exists:1
9:stmt:$lampiran->update(catatan_reviewer):0
10:if:$request->has('anggaran_comments'):1
11:loop:foreach $request->anggaran_comments as $comment:1
12:stmt:$anggaran = KAKAnggaran::find():0
13:if:$anggaran exists:1
14:stmt:$anggaran->update(catatan_verifikator):0
15:stmt:$approval = KegiatanApproval::where(Bendahara-LPJ):0
16:if:!$approval:1
17:exit:return redirect()->back() error:0
18:stmt:$approval->update(status => 'Revisi'):0
19:stmt:$kak->update(status_id => 12):0
20:stmt:KegiatanLogStatus::create() + sendMail():0
21:exit:return redirect() success:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5
5->6(TRUE)
5->10(FALSE)
6->7(Loop Body)
7->8
8->9(TRUE)
8->6(FALSE/Next)
9->6(Next Iteration)
6->10(After Loop)
10->11(TRUE)
10->15(FALSE)
11->12(Loop Body)
12->13
13->14(TRUE)
13->11(FALSE/Next)
14->11(Next Iteration)
11->15(After Loop)
15->16
16->17(TRUE)
16->18(FALSE)
17->21
18->19
19->20
20->21`,
    },

    "LpjController:resubmit": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjController:resubmit
1:entry:public function resubmit(ResubmitLpjRequest $request, Kegiatan $kegiatan):0
2:stmt:$uploadedFiles = []:0
3:try:try block:1
4:stmt:DB::transaction() => $kegiatan->lockForUpdate():0
5:stmt:$approval = KegiatanApproval::where(Bendahara-LPJ):0
6:if:$approval->status !== 'Revisi':1
7:exit:return redirect()->back() error:0
8:if:$request->files_to_delete exists:1
9:stmt:KegiatanLampiran::whereIn()->update(archived):0
10:if:$request->realisasi exists:1
11:loop:foreach $request->realisasi as $anggaranId:1
12:stmt:$anggaran = KAKAnggaran::find():0
13:if:$anggaran exists && kak match:1
14:stmt:$anggaran->update(realisasi):0
15:if:$request->file('bukti') exists:1
16:loop:foreach $files as $file:1
17:if:!$path => store failed:1
18:stmt:throw new \\Exception():0
19:stmt:KegiatanLampiran::create():0
20:stmt:$approval->update(status => 'Aktif'):0
21:stmt:$kak->update(status_id => 11):0
22:stmt:KegiatanLogStatus::create() + sendMail():0
23:exit:return redirect() success:0
24:catch:catch (\\Exception):1
25:stmt:$this->cleanupFiles($uploadedFiles):0
26:exit:return redirect()->back() error:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5
5->6
6->7(TRUE)
6->8(FALSE)
7->23
8->9(TRUE)
8->10(FALSE)
9->10
10->11(TRUE)
10->15(FALSE)
11->12(Loop Body)
12->13
13->14(TRUE)
13->11(FALSE/Next)
14->11(Next Iteration)
11->15(After Loop)
15->16(TRUE)
15->20(FALSE)
16->17(Loop Body)
17->18(TRUE)
17->19(FALSE)
18->24(Exception)
19->16(Next Iteration)
16->20(After Loop)
20->21
21->22
22->23
17->24(Exception)
24->25
25->26`,
    },

    "LpjController:approve": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjController:approve
1:entry:public function approve(ApproveLpjRequest $request, Kegiatan $kegiatan):0
2:stmt:DB::transaction() => $kegiatan->lockForUpdate():0
3:stmt:$approval = KegiatanApproval::where(Bendahara-LPJ):0
4:if:!$approval || status not in ['Aktif','Revisi']:1
5:exit:return redirect()->back() error:0
6:stmt:$approval->update(status => 'Disetujui'):0
7:stmt:$nextApproval = KegiatanApproval::where(Bendahara-Setor):0
8:if:$nextApproval exists:1
9:stmt:$nextApproval->update(status => 'Aktif'):0
10:stmt:$kak->update(status_id => 13):0
11:stmt:KegiatanLogStatus::create() + sendMail():0
12:exit:return redirect() success:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5(TRUE)
4->6(FALSE)
5->12
6->7
7->8
8->9(TRUE)
8->10(FALSE)
9->10
10->11
11->12`,
    },

    "LpjController:complete": {
        module: "Modul LPJ (Laporan Pertanggungjawaban)",
        node: `# LpjController:complete
1:entry:public function complete(CompleteLpjRequest $request, Kegiatan $kegiatan):0
2:stmt:DB::transaction() => $kegiatan->lockForUpdate():0
3:stmt:$approval = KegiatanApproval::where(Bendahara-Setor):0
4:if:!$approval || level !== 'Bendahara-Setor':1
5:exit:return redirect()->back() error:0
6:stmt:$approval->update(status => 'Disetujui'):0
7:stmt:$kak->update(status_id => 14):0
8:stmt:KegiatanLogStatus::create() + sendMail():0
9:exit:return redirect() success:0`,
        edge: `# Edges
1->2
2->3
3->4
4->5(TRUE)
4->6(FALSE)
5->9
6->7
7->8
8->9`,
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
