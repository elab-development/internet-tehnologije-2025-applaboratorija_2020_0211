<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Favorite;
use App\Models\Project;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = Favorite::with('project', 'project.leader')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $projects = $favorites->map(fn($fav) => $fav->project);

        return ProjectResource::collection(collect($projects));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $exists = Favorite::where('user_id', $request->user()->id)
            ->where('project_id', $data['project_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Projekat je već dodat u omiljene.'], 422);
        }

        $favorite = Favorite::create([
            'user_id'    => $request->user()->id,
            'project_id' => $data['project_id'],
        ]);

        $favorite->load('project');

        return response()->json(['message' => 'Projekat dodan u omiljene.', 'data' => new ProjectResource($favorite->project)], 201);
    }

    public function destroy(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $favorite = Favorite::where('user_id', $request->user()->id)
            ->where('project_id', $data['project_id'])
            ->firstOrFail();

        $favorite->delete();
        return response()->json(['message' => 'Projekat uklonjen iz omiljenih.']);
    }
}
