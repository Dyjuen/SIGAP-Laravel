<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Foundation\Application;

class LandingPageController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        if ($request->user()) {
            $role = $request->user()->getRoleName();

            $redirectPath = match ($role) {
                'Admin' => '/admin/user-management',
                default => '/dashboard',
            };

            return redirect()->intended($redirectPath);
        }

        return Inertia::render('LandingPage', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
}
