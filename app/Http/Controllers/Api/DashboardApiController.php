<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Verifikator Dashboard
     * GET /api/verifikator/dashboard
     */
    public function verifikator(Request $request)
    {
        $data = $this->dashboardService->getVerifikatorStatsAndRecent($request->user());
        return response()->json($data);
    }

    /**
     * PPK Dashboard
     * GET /api/ppk/dashboard
     */
    public function ppk(Request $request)
    {
        $data = $this->dashboardService->getPpkStatsAndRecent();
        return response()->json($data);
    }

    /**
     * Wadir Dashboard
     * GET /api/wadir/dashboard
     */
    public function wadir(Request $request)
    {
        $data = $this->dashboardService->getWadirStatsAndRecent();
        return response()->json($data);
    }

    /**
     * Bendahara Dashboard
     * GET /api/bendahara/dashboard
     */
    public function bendahara(Request $request)
    {
        $data = $this->dashboardService->getBendaharaStatsAndKegiatans();
        return response()->json($data);
    }

    /**
     * Direktur Dashboard
     * GET /api/direktur/dashboard
     */
    public function direktur(Request $request)
    {
        $stats = $this->dashboardService->getDirekturStats();
        return response()->json([
            'stats' => $stats,
        ]);
    }
}
