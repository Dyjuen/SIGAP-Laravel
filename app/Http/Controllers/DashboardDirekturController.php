<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardDirekturController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $period = $request->query('period', '6months');
        $data = $this->dashboardService->getDirekturDashboardData($period);

        return Inertia::render('Direktur/Dashboard', [
            'dashboardData' => $data,
        ]);
    }
}
