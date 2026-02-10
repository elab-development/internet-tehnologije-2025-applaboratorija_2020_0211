<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExperimentResource;
use App\Http\Resources\SampleResource;
use App\Models\Experiment;
use App\Models\Sample;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SampleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($experimentId)
    {
        $experiments=Experiment::with('project')->get();
        return response()->json(['data' =>  ExperimentResource::collection($experiments),]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'type' => 'required|string',
            'source' => 'required|string',
            'location' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $sample = Sample::create([
            'code' => $request->code,
            'type' => $request->type,
            'source' => $request->source,
            'location' => $request->location,
            'metadata' => $request->metadata,
            'experiment_id' => $request->experiment_id,
        ]);

        return response()->json(['data' => new SampleResource($sample)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sample $sample)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sample $sample)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sample $sample)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sample $sample)
    {
        $sample->delete();
        return response()->json(['message' => 'Sample deleted']);
    }
}
