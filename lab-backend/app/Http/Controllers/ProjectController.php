<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/projects",
     *     summary="Pregled svih dostupnih projekata",
     *     tags={"Projekti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista projekata sa paginacijom")
     * )
     */
    public function index(Request $request)
    {
        $projects = Project::with('leader', 'members')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return ProjectResource::collection($projects);
    }

    /**
     * @OA\Get(
     *     path="/api/projects/search",
     *     summary="Pretraga i filtriranje projekata",
     *     tags={"Projekti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="q", in="query", description="Termin za pretragu (naslov, opis, kod)", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="category", in="query", description="Filter po kategoriji", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Lista filtriranih projekata")
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/projects/{project}",
     *     summary="Prikaz detalja određenog projekta",
     *     tags={"Projekti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="project", in="path", description="ID projekta", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalji projekta (vođa, članovi, eksperimenti, rezervacije, izveštaji)"),
     *     @OA\Response(response=404, description="Projekat nije pronađen")
     * )
     */
    public function show(Project $project)
    {
        $project->load('leader', 'members', 'experiments', 'reservations', 'reports');
        return new ProjectResource($project);
    }

    /**
     * @OA\Get(
     *     path="/api/projects/{project}/experiments",
     *     summary="Pregled svih eksperimenata na projektu",
     *     tags={"Projekti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="project", in="path", description="ID projekta", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Lista eksperimenata ovog projekta sa paginacijom"),
     *     @OA\Response(response=404, description="Projekat nije pronađen")
     * )
     */
    public function experiments(Project $project)
    {
        $experiments = $project->experiments()->paginate(10);
        return \App\Http\Resources\ExperimentResource::collection($experiments);
    }

    /**
     * @OA\Post(
     *     path="/api/projects",
     *     summary="Kreiranje novog projekta (Samo Researcher/Admin)",
     *     tags={"Projekti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"title", "code"},
     *                 @OA\Property(property="title", type="string", example="Novi AI Projekat"),
     *                 @OA\Property(property="code", type="string", example="PRJ-999"),
     *                 @OA\Property(property="description", type="string", example="Detaljan opis"),
     *                 @OA\Property(property="budget", type="number", example="15000"),
     *                 @OA\Property(property="category", type="string", example="research"),
     *                 @OA\Property(property="status", type="string", enum={"planning", "active", "completed"}),
     *                 @OA\Property(property="document", type="string", format="binary", description="PDF dokumentacija")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Projekat kreiran"),
     *     @OA\Response(response=403, description="Zabranjen pristup (nemate ulogu)")
     * )
     */
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

    /**
     * @OA\Put(
     *     path="/api/projects/{project}",
     *     summary="Ažuriranje projekta (Samo VOĐA projekta / Admin)",
     *     tags={"Projekti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="project", in="path", description="ID projekta", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="title", type="string", example="Ažurirani naziv"),
     *                 @OA\Property(property="status", type="string", enum={"planning", "active", "completed", "archived"}),
     *                 @OA\Property(property="document", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Projekat uspesno azuriran"),
     *     @OA\Response(response=403, description="Zabranjen pristup (niste vođa projekta)"),
     *     @OA\Response(response=404, description="Projekat nije pronadjen")
     * )
     */
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

    /**
     * @OA\Delete(
     *     path="/api/projects/{project}",
     *     summary="Brisanje projekta (Samo VOĐA projekta / Admin)",
     *     tags={"Projekti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="project", in="path", description="ID projekta", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Projekat obrisan"),
     *     @OA\Response(response=403, description="Zabranjen pristup (niste vođa projekta)"),
     *     @OA\Response(response=404, description="Projekat nije pronadjen")
     * )
     */
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
