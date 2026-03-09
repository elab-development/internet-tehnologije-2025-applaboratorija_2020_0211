<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\Equipment;
use App\Models\Project;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $reservations = Reservation::with('equipment', 'project', 'user')
            ->when($request->equipment_id, fn($q) => $q->where('equipment_id', $request->equipment_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('start_time', 'desc')
            ->paginate(10);

        return ReservationResource::collection($reservations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'start_time'    => 'required|date_format:Y-m-d H:i',
            'end_time'      => 'required|date_format:Y-m-d H:i|after:start_time',
            'purpose'       => 'required|string|max:500',
            'status'        => 'required|in:pending,approved,rejected,completed,cancelled',
            'equipment_id'  => 'required|exists:equipment,id',
            'project_id'    => 'required|exists:projects,id',
        ]);

        // Check if equipment is available
        $equipment = Equipment::findOrFail($data['equipment_id']);
        if ($equipment->status !== 'available') {
            return response()->json(['message' => 'Oprema nije dostupna.'], 422);
        }

        // Check for conflicts with existing reservations
        $conflict = Reservation::where('equipment_id', $data['equipment_id'])
            ->where('status', '!=', 'cancelled')
            ->where(function($query) use ($data) {
                $query->whereBetween('start_time', [$data['start_time'], $data['end_time']])
                    ->orWhereBetween('end_time', [$data['start_time'], $data['end_time']])
                    ->orWhere(function($q) use ($data) {
                        $q->where('start_time', '<=', $data['start_time'])
                            ->where('end_time', '>=', $data['end_time']);
                    });
            })
            ->first();

        if ($conflict) {
            return response()->json(['message' => 'Oprema je zarezervirana u tom vremenu.'], 422);
        }

        $data['user_id'] = $request->user()->id;

        $reservation = Reservation::create($data);
        $reservation->load('equipment', 'project', 'user');

        return response()->json(['message' => 'Rezervacija uspešno kreirana.', 'data' => new ReservationResource($reservation)], 201);
    }

    public function destroy(Request $request, Reservation $reservation)
    {
        $this->authorize('delete', $reservation);

        $reservation->delete();
        return response()->json(['message' => 'Rezervacija obrisana.']);
    }
}
