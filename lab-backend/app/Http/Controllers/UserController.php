<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::when($request->q, fn($q, $search) =>
            $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")
        )->orderBy('created_at', 'desc')->paginate(10);
        return UserResource::collection($users);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate(['role' => 'sometimes|in:user,researcher,admin', 'is_active' => 'sometimes|boolean']);
        $user->update($data);
        return response()->json(['message' => 'Korisnik uspešno ažuriran.', 'data' => new UserResource($user)]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Ne možete obrisati sopstveni nalog.'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'Korisnik obrisan.']);
    }
}
