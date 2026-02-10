<?php

namespace App\Http\Controllers;
use App\Http\Resources\FavoriteResource;
use App\Http\Resources\ProjectResource;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user=auth()->user();
        $favorites=Favorite::where('user_id',$user->id)->get();
        return response()->json(['favorites'=>FavoriteResource::collection($favorites)],200);
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
        $user=auth()->user();
        $projectId=$request->project_id;
        $favorite=Favorite::create([
            'user_id'=>$user->id,
            'project_id'=>$projectId
        ]);
        return response()->json(['favorite'=>$favorite],200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Favorite $favorite)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Favorite $favorite)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Favorite $favorite)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Favorite $favorite)
    {
        $favorite->delete();
        return response()->json(['favorite'=>$favorite],200);
    }
}
