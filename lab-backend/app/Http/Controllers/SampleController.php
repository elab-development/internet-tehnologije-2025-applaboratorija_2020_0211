<?php

namespace App\Http\Controllers;

use App\Http\Resources\SampleResource;
use App\Models\Sample;
use App\Models\Experiment;
use Illuminate\Http\Request;

class SampleController extends Controller
{
    public function index(Request $request)
    {
        $samples = Sample::with('experiment')
            ->when($request->experiment_id, fn($q) => $q->where('experiment_id', $request->experiment_id))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return SampleResource::collection($samples);
    }

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
