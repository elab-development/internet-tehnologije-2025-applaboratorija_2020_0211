<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExperimentResource;
use App\Models\Experiment;
use App\Models\Project;
use Illuminate\Http\Request;

class ExperimentController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/experiments",
     *     summary="Pregled svih eksperimenata",
     *     tags={"Eksperimenti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="project_id", in="query", description="Filter po ID-ju projekta", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="status", in="query", description="Filter po statusu", required=false, @OA\Schema(type="string", enum={"planning", "in_progress", "completed", "failed"})),
     *     @OA\Response(response=200, description="Lista eksperimenata sa paginacijom")
     * )
     */
    public function index(Request $request)
    {
        $experiments = Experiment::with('project')
            ->when($request->project_id, fn($q) => $q->where('project_id', $request->project_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('date_performed', 'desc')
            ->paginate(10);

        return ExperimentResource::collection($experiments);
    }

    /**
     * @OA\Post(
     *     path="/api/projects/experiments",
     *     summary="Dodavanje novog eksperimenta u okviru projekta (Researcher/Admin)",
     *     tags={"Eksperimenti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "protocol", "date_performed", "status", "project_id"},
     *             @OA\Property(property="name", type="string", example="Analiza uzorka A1"),
     *             @OA\Property(property="protocol", type="string", example="Standardni protokol za analizu"),
     *             @OA\Property(property="date_performed", type="string", example="2025-05-10 14:00"),
     *             @OA\Property(property="status", type="string", enum={"planning", "in_progress", "completed", "failed"}, example="planning"),
     *             @OA\Property(property="project_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Eksperiment uspešno kreiran"),
     *     @OA\Response(response=403, description="Zabranjen pristup"),
     *     @OA\Response(response=422, description="Greška u validaciji")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'protocol'       => 'required|string',
            'date_performed' => 'required|date_format:Y-m-d H:i',
            'status'         => 'required|in:planning,in_progress,completed,failed',
            'project_id'     => 'required|exists:projects,id',
        ]);

        $project = Project::findOrFail($data['project_id']);
        $this->authorize('update', $project);

        $experiment = Experiment::create($data);
        $experiment->load('project');

        return response()->json(['message' => 'Eksperiment uspešno kreiran.', 'data' => new ExperimentResource($experiment)], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/experiments/{experiment}",
     *     summary="Ažuriranje eksperimenta (Researcher/Admin)",
     *     tags={"Eksperimenti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="experiment", in="path", description="ID eksperimenta", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Ažurirani naziv"),
     *             @OA\Property(property="status", type="string", enum={"planning", "in_progress", "completed", "failed"}, example="in_progress")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Eksperiment uspešno ažuriran"),
     *     @OA\Response(response=403, description="Zabranjen pristup"),
     *     @OA\Response(response=404, description="Eksperiment nije pronađen")
     * )
     */
    public function update(Request $request, Experiment $experiment)
    {
        // BEZBEDNOST #2: IDOR zaštita
        $this->authorize('update', $experiment);

        $data = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'protocol'       => 'sometimes|string',
            'date_performed' => 'sometimes|date_format:Y-m-d H:i',
            'status'         => 'sometimes|in:planning,in_progress,completed,failed',
        ]);

        $experiment->update($data);
        $experiment->load('project');

        return response()->json(['message' => 'Eksperiment uspešno ažuriran.', 'data' => new ExperimentResource($experiment)]);
    }

    /**
     * @OA\Delete(
     *     path="/api/experiments/{experiment}",
     *     summary="Brisanje eksperimenta (Researcher/Admin)",
     *     tags={"Eksperimenti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="experiment", in="path", description="ID eksperimenta", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Eksperiment obrisan"),
     *     @OA\Response(response=403, description="Zabranjen pristup")
     * )
     */
    public function destroy(Request $request, Experiment $experiment)
    {
        // BEZBEDNOST #2: IDOR zaštita
        $this->authorize('delete', $experiment);

        $experiment->delete();
        return response()->json(['message' => 'Eksperiment obrisan.']);
    }
}
