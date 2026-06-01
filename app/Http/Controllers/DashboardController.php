<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Render the appropriate dashboard based on the user's role.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->getRoleName();
        $panduans = $this->dashboardService->getPanduans($user->role_id);

        if ($role === 'Rektorat') {
            return redirect()->route('dashboard.direktur');
        }

        return match ($role) {
            'Bendahara' => $this->bendaharaDashboard($request, $panduans),
            'Pengusul' => $this->pengusulDashboard($request, $panduans),
            'PPK' => $this->ppkDashboard($request, $panduans),
            'Wadir' => $this->wadirDashboard($request, $panduans),
            'Verifikator' => $this->verifikatorDashboard($request, $panduans),
            default => $this->defaultDashboard($request, $panduans),
        };
    }

    // ════════════════════════════════════════════════════════════════════
    // PENGUSUL DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function pengusulDashboard(Request $request, $panduans = [])
    {
        $user = $request->user();
        $stats = $this->dashboardService->getPengusulStats($user);
        $recentKaks = $this->dashboardService->getPengusulRecentKaks($user);
        $recentLpjs = $this->dashboardService->getPengusulRecentLpjs($user);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recent_kaks' => $recentKaks,
            'recent_lpjs' => $recentLpjs,
            'panduans' => $panduans,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // PPK DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function ppkDashboard(Request $request, $panduans = [])
    {
        $data = $this->dashboardService->getPpkStatsAndRecent();

        return Inertia::render('Dashboard', [
            'stats' => $data['stats'],
            'pending_kegiatan' => $data['pending_kegiatan'],
            'panduans' => $panduans,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // WADIR DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function wadirDashboard(Request $request, $panduans = [])
    {
        $data = $this->dashboardService->getWadirStatsAndRecent();

        return Inertia::render('Dashboard', [
            'stats' => $data['stats'],
            'pending_kegiatan' => $data['pending_kegiatan'],
            'panduans' => $panduans,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // VERIFIKATOR DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function verifikatorDashboard(Request $request, $panduans = [])
    {
        $user = $request->user();
        $data = $this->dashboardService->getVerifikatorStatsAndRecent($user);

        return Inertia::render('Dashboard', [
            'stats' => $data['stats'],
            'recent_kaks' => $data['recent_kaks'],
            'panduans' => $panduans,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // ADMIN / DEFAULT DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function defaultDashboard(Request $request, $panduans = [])
    {
        $stats = $this->dashboardService->getDirekturStats();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'panduans' => $panduans,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // BENDAHARA DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function bendaharaDashboard(Request $request, $panduans = [])
    {
        $data = $this->dashboardService->getBendaharaStatsAndKegiatans();

        return Inertia::render('Bendahara/Dashboard', [
            'kegiatans' => $data['kegiatans'],
            'stats' => $data['stats'],
            'panduans' => $panduans,
        ]);
    }
}
