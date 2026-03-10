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
        // ─── Ukupni brojevi ───────────────────────────────────────────
        $totals = [
            'projects'    => Project::count(),
            'experiments' => Experiment::count(),
            'users'       => User::count(),
            'equipment'   => Equipment::count(),
        ];

        // ─── Projekti po kategorijama → [{category, count}] ──────────
        $projectsByCategory = Project::selectRaw('category, COUNT(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->get()
            ->map(fn($r) => ['category' => $r->category, 'count' => (int) $r->count])
            ->values()
            ->toArray();

        // ─── Eksperimenti po statusu → [{status, count}] ─────────────
        $experimentsByStatus = Experiment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn($r) => ['status' => $r->status, 'count' => (int) $r->count])
            ->values()
            ->toArray();

        // ─── Projekti po mesecima (poslednjih 6) → [{month, count}] ──
        $projectsByMonth = Project::selectRaw(
                'DATE_FORMAT(created_at, "%b %Y") as month,
                 YEAR(created_at) as yr,
                 MONTH(created_at) as mn,
                 COUNT(*) as count'
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at), MONTH(created_at)')
            ->get()
            ->map(fn($r) => ['month' => $r->month, 'count' => (int) $r->count])
            ->values()
            ->toArray();

        // ─── Top 5 sačuvanih projekata → [{title, saves_count}] ──────
        $topSavedPapers = Project::withCount('favorites')
            ->orderByDesc('favorites_count')
            ->limit(5)
            ->get()
            ->map(fn($p) => ['title' => $p->title, 'saves_count' => $p->favorites_count])
            ->values()
            ->toArray();

        return response()->json([
            'totals'                => $totals,
            'projects_by_category'  => $projectsByCategory,
            'experiments_by_status' => $experimentsByStatus,
            'projects_by_month'     => $projectsByMonth,
            'top_saved_papers'      => $topSavedPapers,
        ]);
    }
}
