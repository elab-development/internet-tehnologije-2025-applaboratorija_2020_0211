<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users=User::all();
        return response()->json(['users'=>UserResource::collection($users)],200);
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show( $userId)
    {
        $user=User::where("id",$userId)->firstOrFail();
        return response()->json(['user'=>new UserResource($user)],200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['user'=>new UserResource($user),"message"=>"User was deleted successfully"],200);
    }
    public function getAllUsersForRole($roleId){
        $users=User::where('role_id',$roleId)->get();
        return response()->json(['users'=>UserResource::collection($users)],200);
    }
}
