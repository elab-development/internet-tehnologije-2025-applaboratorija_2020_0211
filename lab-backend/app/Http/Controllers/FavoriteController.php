<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Favorite;
use App\Models\Project;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/favorites",
     *     summary="Pregled omiljenih projekata",
     *     tags={"Favoriti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista omiljenih projekata sa paginacijom")
     * )
     */
    public function index(Request $request)
    {
        $favorites = Favorite::with('project', 'project.leader')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'favorites' => $favorites->map(fn($fav) => [
                'id'      => $fav->id,
                'project' => new ProjectResource($fav->project),
            ]),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/favorites",
     *     summary="Dodavanje projekta u omiljene",
     *     tags={"Favoriti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"project_id"},
     *             @OA\Property(property="project_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Projekat dodat u omiljene"),
     *     @OA\Response(response=422, description="Greška u validaciji ili je projekat već dodat")
     * )
     */
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

    /**
     * @OA\Delete(
     *     path="/api/favorites",
     *     summary="Uklanjanje projekta iz omiljenih",
     *     tags={"Favoriti"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"project_id"},
     *             @OA\Property(property="project_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Projekat uklonjen iz omiljenih"),
     *     @OA\Response(response=404, description="Projekat nije pronađen u omiljenim")
     * )
     */
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
