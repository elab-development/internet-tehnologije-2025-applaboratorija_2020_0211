<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::with('leader', 'members')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return ProjectResource::collection($projects);
    }

    public function search(Request $request)
    {
        $query = $request->input('q');

        $projects = Project::with('leader', 'members')
            ->where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('code', 'like', "%{$query}%")
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return ProjectResource::collection($projects);
    }

    public function show(Project $project)
    {
        $project->load('leader', 'members', 'experiments', 'reservations', 'reports');
        return new ProjectResource($project);
    }

    public function experiments(Project $project)
    {
        $experiments = $project->experiments()->paginate(10);
        return \App\Http\Resources\ExperimentResource::collection($experiments);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'code'        => 'required|string|unique:projects,code',
            'description' => 'required|string',
            'budget'      => 'required|numeric|min:0',
            'category'    => 'required|in:research,development,testing',
            'status'      => 'required|in:planning,active,completed,archived',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
            'document'    => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('projects', 'public');
            $data['document_path'] = $path;
        }

        $data['lead_id'] = $request->user()->id;

        $project = Project::create($data);
        $project->members()->attach($request->user()->id, ['date_joined' => now()]);

        $project->load('leader', 'members');
        return response()->json(['message' => 'Projekat uspešno kreiran.', 'data' => new ProjectResource($project)], 201);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'code'        => 'sometimes|string|unique:projects,code,' . $project->id,
            'description' => 'sometimes|string',
            'budget'      => 'sometimes|numeric|min:0',
            'category'    => 'sometimes|in:research,development,testing',
            'status'      => 'sometimes|in:planning,active,completed,archived',
            'start_date'  => 'sometimes|date',
            'end_date'    => 'sometimes|date|after:start_date',
            'document'    => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        if ($request->hasFile('document')) {
            if ($project->document_path) {
                Storage::disk('public')->delete($project->document_path);
            }
            $path = $request->file('document')->store('projects', 'public');
            $data['document_path'] = $path;
        }

        $project->update($data);
        $project->load('leader', 'members');

        return response()->json(['message' => 'Projekat uspešno ažuriran.', 'data' => new ProjectResource($project)]);
    }

    public function destroy(Request $request, Project $project)
    {
        $this->authorize('delete', $project);

        if ($project->document_path) {
            Storage::disk('public')->delete($project->document_path);
        }

        $project->delete();
        return response()->json(['message' => 'Projekat obrisan.']);
    }
}
