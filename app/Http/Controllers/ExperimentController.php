<?php

namespace App\Http\Controllers;
use App\Http\Resources\ExperimentResource;
use App\Models\Experiment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExperimentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($projectId)
    {
        $experiments = Experiment::where('project_id', $projectId)
            ->get();

        return response()->json(['data' => ExperimentResource::collection($experiments)]);
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
    public function store(Request $request,$projectId)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'protocol' => 'required|string',
            'date_performed' => 'required|date',
            'status' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $experiment = Experiment::create([
            'name' => $request->name,
            'protocol' => $request->protocol,
            'date_performed' => $request->date_performed,
            'status' => $request->status,
            'project_id' => $projectId,
            'user_id' => auth()->id(),
        ]);

        return response()->json(['data' => new ExperimentResource($experiment)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Experiment $experiment)
    {

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Experiment $experiment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Experiment $experiment)
    {
        $experiment->update($request->all());
        return response()->json(['data' => new ExperimentResource($experiment)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Experiment $experiment)
    {
        $experiment->delete();
        return response()->json(['message' => 'Experiment deleted successfully']);
    }
}
