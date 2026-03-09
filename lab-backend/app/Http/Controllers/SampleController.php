<?php

namespace App\Http\Controllers;

use App\Http\Resources\SampleResource;
use App\Models\Sample;
use App\Models\Experiment;
use Illuminate\Http\Request;

class SampleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/samples",
     *     summary="Pregled svih uzoraka",
     *     tags={"Uzorci"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="experiment_id", in="query", description="Filter po ID-ju eksperimenta", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type", in="query", description="Filter po tipu uzorka", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Lista uzoraka sa paginacijom")
     * )
     */
    public function index(Request $request)
    {
        $samples = Sample::with('experiment')
            ->when($request->experiment_id, fn($q) => $q->where('experiment_id', $request->experiment_id))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return SampleResource::collection($samples);
    }

    /**
     * @OA\Post(
     *     path="/api/samples",
     *     summary="Dodavanje novog uzorka (Researcher/Admin)",
     *     tags={"Uzorci"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"code", "type", "source", "location", "experiment_id"},
     *             @OA\Property(property="code", type="string", example="SMP-100"),
     *             @OA\Property(property="type", type="string", example="Biološki"),
     *             @OA\Property(property="source", type="string", example="Pacijent A"),
     *             @OA\Property(property="location", type="string", example="Zamrzivač 1"),
     *             @OA\Property(property="metadata", type="string", example="{}"),
     *             @OA\Property(property="experiment_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Uzorak uspešno kreiran"),
     *     @OA\Response(response=403, description="Zabranjen pristup"),
     *     @OA\Response(response=422, description="Greška u validaciji")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code'           => 'required|string|unique:samples,code',
            'type'           => 'required|string|max:255',
            'source'         => 'required|string|max:255',
            'location'       => 'required|string|max:255',
            'metadata'       => 'nullable|json',
            'experiment_id'  => 'required|exists:experiments,id',
        ]);

        $experiment = Experiment::findOrFail($data['experiment_id']);
        $this->authorize('update', $experiment->project);

        $sample = Sample::create($data);
        $sample->load('experiment');

        return response()->json(['message' => 'Uzorak uspešno kreiran.', 'data' => new SampleResource($sample)], 201);
    }
}
