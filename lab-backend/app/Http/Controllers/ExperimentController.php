<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExperimentResource;
use App\Models\Experiment;
use App\Models\Project;
use Illuminate\Http\Request;

class ExperimentController extends Controller
{
    public function index(Request $request)
    {
        $experiments = Experiment::with('project')
            ->when($request->project_id, fn($q) => $q->where('project_id', $request->project_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('date_performed', 'desc')
            ->paginate(10);

        return ExperimentResource::collection($experiments);
    }

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

    public function update(Request $request, Experiment $experiment)
    {
        $this->authorize('update', $experiment->project);

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

    public function destroy(Request $request, Experiment $experiment)
    {
        $this->authorize('delete', $experiment->project);

        $experiment->delete();
        return response()->json(['message' => 'Eksperiment obrisan.']);
    }
}
