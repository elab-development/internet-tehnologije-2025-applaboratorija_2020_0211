<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects=Project::paginate(10);
        return response()->json(['data'=>ProjectResource::collection($projects)],200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'title' => 'required|string',
            'code' => 'required|string|unique:projects',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'category' => 'required|string',


            'status' => 'required|string',
            'document' => 'nullable|file|mimes:pdf|max:10240',
        ]);
        if($validator->fails()){
            return response()->json($validator->errors()->toJson(),400);
        }
        $data=$validator->validated();
        if ($request->hasFile('document')) {
            $data['document_path'] = $request
                ->file('document')
                ->store('projects/documents', 'public');
        }

        $data['lead_user_id'] = auth()->id();

        $project = Project::create($data);
        return response()->json(['data'=>new ProjectResource($project)],201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $project=Project::where('id',$id)->firstOrFail();
        return response()->json(['data'=>new ProjectResource($project)],200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $project->update($request->all());
        return response()->json(['data'=>new ProjectResource($project)],200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json(['message'=>'Project deleted successfully'],200);
    }
    public function uploadDocument(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $request->validate([
            'document' => 'required|file|mimes:pdf|max:10240',
        ]);

        if ($project->document_path) {
            Storage::disk('public')->delete($project->document_path);
        }

        $path = $request->file('document')
            ->store('projects/documents', 'public');

        $project->update([
            'document_path' => $path
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'document_path' => $path
        ]);
    }
    public function downloadDocument($id)
    {
        $project = Project::findOrFail($id);

        if (!$project->document_path) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        return response()->download(
            storage_path('app/public/' . $project->document_path)
        );
    }
    public function search(Request $request)
    {
        $query = Project::query();

        if ($request->has('title')) {
            $query->where('title', 'LIKE', '%' . $request->title . '%');
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $projects = $query->paginate(10);

        return response()->json([
            'data' => ProjectResource::collection($projects)
        ]);
    }

}
