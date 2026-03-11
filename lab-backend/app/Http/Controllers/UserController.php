<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/users",
     *     summary="Pregled svih korisnika (Samo Admin)",
     *     tags={"Korisnici"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="q", in="query", description="Pretraga po imenu ili email-u", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Lista korisnika sa paginacijom")
     * )
     */
    public function index(Request $request)
    {
        $users = User::when($request->q, fn($q, $search) =>
            $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")
        )->orderBy('created_at', 'desc')->paginate(10);
        return UserResource::collection($users);
    }

    /**
     * @OA\Get(
     *     path="/api/users/assignable",
     *     summary="Lista korisnika dostupnih za dodavanje na projekat (Researcher/Admin)",
     *     tags={"Korisnici"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista aktivnih korisnika")
     * )
     */
    public function assignable()
    {
        $users = User::where('is_active', true)
            ->where('role', '!=', 'admin')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);
        return response()->json(['data' => $users]);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{user}",
     *     summary="Ažuriranje korisnika (Samo Admin)",
     *     tags={"Korisnici"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="user", in="path", description="ID korisnika", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="role", type="string", enum={"user", "researcher", "admin"}, example="researcher"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Korisnik uspešno ažuriran"),
     *     @OA\Response(response=403, description="Zabranjen pristup")
     * )
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate(['role' => 'sometimes|in:user,researcher,admin', 'is_active' => 'sometimes|boolean']);
        $user->update($data);
        return response()->json(['message' => 'Korisnik uspešno ažuriran.', 'data' => new UserResource($user)]);
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{user}",
     *     summary="Brisanje korisnika (Samo Admin)",
     *     tags={"Korisnici"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="user", in="path", description="ID korisnika", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Korisnik obrisan"),
     *     @OA\Response(response=403, description="Zabranjen pristup"),
     *     @OA\Response(response=422, description="Nemoguće obrisati sopstveni nalog")
     * )
     */
    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Ne možete obrisati sopstveni nalog.'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'Korisnik obrisan.']);
    }
}
