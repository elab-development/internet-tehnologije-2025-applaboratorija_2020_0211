<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Experiment;
use App\Models\Sample;
use App\Models\Equipment;
use App\Models\Reservation;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/statistics",
     *     summary="Dohvatanje sistemskih statistika (Researcher/Admin)",
     *     tags={"Statistike"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Statistički podaci za kontrolnu tablu"),
     *     @OA\Response(response=403, description="Zabranjen pristup")
     * )
     */
    public function index(Request $request)
    {
        $stats = [
            'total_projects'      => Project::count(),
            'active_projects'     => Project::where('status', 'active')->count(),
            'total_experiments'   => Experiment::count(),
            'total_samples'       => Sample::count(),
            'total_equipment'     => Equipment::count(),
            'available_equipment' => Equipment::where('status', 'available')->count(),
            'total_reservations'  => Reservation::count(),
            'pending_reservations' => Reservation::where('status', 'pending')->count(),
            'total_reports'       => Report::count(),
            'submitted_reports'   => Report::where('status', 'submitted')->count(),
            'total_users'         => User::count(),
            'researchers'         => User::where('role', 'researcher')->count(),
            'active_users'        => User::where('is_active', true)->count(),
            'projects_by_category' => Project::selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->get()
                ->pluck('count', 'category'),
            'projects_by_status' => Project::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status'),
            'equipment_by_status' => Equipment::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status'),
            'experiments_by_status' => Experiment::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status'),
        ];

        return response()->json(['data' => $stats]);
    }
}
