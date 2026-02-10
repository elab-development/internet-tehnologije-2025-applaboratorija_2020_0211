<?php

namespace App\Http\Controllers;


use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user=Auth::user();
        $reservations=Reservation::where('user_id',$user->id)->get();
        return response()->json(['data' => ReservationResource::collection($reservations)], 201);

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
        $validator = Validator::make($request->all(), [
            'start_time'  => 'required|date',
            'end_time'    => 'required|date|after:start_time',
            'project_id'  => 'required|exists:projects,id',
            'equipment_id'=> 'required|exists:equipment,id',
            'purpose'     => 'required|string',
        ]);
        if($validator->fails()){
            return response()->json($validator->errors()->toJson(),400);
        }
        $user=Auth::user();

        $reservation = Reservation::create([
            'start_time'   => $request->start_time,
            'end_time'     => $request->end_time,
            'project_id'   => $request->project_id,
            'equipment_id' => $request->equipment_id,
            'purpose'      => $request->purpose,
            'user_id'      => Auth::id(),
            'status'       => 'pending',
        ]);
        return response()->json(['data' => new ReservationResource($reservation)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show( $reservationId)
    {
        $reservation=Reservation::where('id',$reservationId)->firstOrFail();
        return response()->json(['data' => new ReservationResource($reservation)], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Reservation $reservation)
    {
        $reservation->update($request->all());
        return response()->json(['data' => new ReservationResource($reservation)], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reservation $reservation)
    {
        $reservation->delete();
        return response()->json(['message'=>"Reservation deleted successfully"], 200);
    }
}
