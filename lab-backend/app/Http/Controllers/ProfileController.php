<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * @OA\Put(
     *     path="/api/profile",
     *     summary="Ažuriranje profila korisnika",
     *     tags={"Profil"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Novi Naziv"),
     *             @OA\Property(property="email", type="string", format="email", example="noviemail@test.com")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profil uspešno ažuriran"),
     *     @OA\Response(response=401, description="Niste prijavljeni"),
     *     @OA\Response(response=422, description="Greška pri validaciji")
     * )
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
        ]);

        $request->user()->update($data);

        return response()->json(['message' => 'Profil uspešno ažuriran.', 'user' => new UserResource($request->user())]);
    }

    /**
     * @OA\Put(
     *     path="/api/profile/password",
     *     summary="Promena lozinke korisnika",
     *     tags={"Profil"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password", "password", "password_confirmation"},
     *             @OA\Property(property="current_password", type="string", format="password", example="staraLozinka123!"),
     *             @OA\Property(property="password", type="string", format="password", example="novaLozinka123!"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="novaLozinka123!")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Lozinka uspešno promenjena"),
     *     @OA\Response(response=401, description="Niste prijavljeni"),
     *     @OA\Response(response=422, description="Greška pri validaciji ili pogrešna trenutna lozinka")
     * )
     */
    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $request->user()->password)) {
            return response()->json(['message' => 'Pogrešna trenutna lozinka.'], 422);
        }

        $request->user()->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Lozinka uspešno promenjena.']);
    }
}
