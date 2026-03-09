<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Services\EmailService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private EmailService $email
    ) {}

    /**
     * @OA\Get(
     *     path="/api/reports",
     *     summary="Pregled svih prijava/izveštaja (Samo Admin)",
     *     tags={"Izveštaji"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", description="Filter po statusu", required=false, @OA\Schema(type="string", enum={"draft", "submitted", "reviewed", "approved"})),
     *     @OA\Parameter(name="project_id", in="query", description="Filter po projektu", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Lista izveštaja sa paginacijom")
     * )
     */
    public function index(Request $request)
    {
        $reports = Report::with('user', 'project')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->project_id, fn($q) => $q->where('project_id', $request->project_id))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return ReportResource::collection($reports);
    }

    /**
     * @OA\Post(
     *     path="/api/reports",
     *     summary="Kreiranje novog izveštaja",
     *     tags={"Izveštaji"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"description", "status", "project_id"},
     *             @OA\Property(property="description", type="string", example="Opis izveštaja"),
     *             @OA\Property(property="status", type="string", enum={"draft", "submitted", "reviewed", "approved"}, example="draft"),
     *             @OA\Property(property="project_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Izveštaj uspešno kreiran"),
     *     @OA\Response(response=422, description="Greška u validaciji")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => 'required|string',
            'status'      => 'required|in:draft,submitted,reviewed,approved',
            'project_id'  => 'required|exists:projects,id',
        ]);

        $data['user_id'] = $request->user()->id;

        $report = Report::create($data);
        $report->load('user', 'project');

        $this->email->sendReportSubmitted($report);

        return response()->json(['message' => 'Izveštaj uspešno kreiran.', 'data' => new ReportResource($report)], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/reports/{report}",
     *     summary="Ažuriranje izveštaja (Samo Admin)",
     *     tags={"Izveštaji"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="report", in="path", description="ID izveštaja", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="description", type="string", example="Novi opis"),
     *             @OA\Property(property="status", type="string", enum={"draft", "submitted", "reviewed", "approved"}, example="submitted")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Izveštaj uspešno ažuriran"),
     *     @OA\Response(response=403, description="Zabranjen pristup"),
     *     @OA\Response(response=404, description="Izveštaj nije pronađen")
     * )
     */
    public function update(Request $request, Report $report)
    {
        $data = $request->validate([
            'description' => 'sometimes|string',
            'status'      => 'sometimes|in:draft,submitted,reviewed,approved',
        ]);

        $report->update($data);
        $report->load('user', 'project');

        return response()->json(['message' => 'Izveštaj uspešno ažuriran.', 'data' => new ReportResource($report)]);
    }
}
