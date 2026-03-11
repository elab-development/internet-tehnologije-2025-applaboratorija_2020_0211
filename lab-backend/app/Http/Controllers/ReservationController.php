<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\Equipment;
use App\Models\Project;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/reservations",
     *     summary="Pregled rezervacija opreme",
     *     tags={"Rezervacije"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="equipment_id", in="query", description="Filter po ID-ju opreme", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="status", in="query", description="Filter po statusu", required=false, @OA\Schema(type="string", enum={"pending", "approved", "rejected", "completed", "cancelled"})),
     *     @OA\Response(response=200, description="Lista rezervacija sa paginacijom")
     * )
     */
    public function index(Request $request)
    {
        $reservations = Reservation::with('equipment', 'project', 'user')
            ->when($request->equipment_id, fn($q) => $q->where('equipment_id', $request->equipment_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('start_time', 'desc')
            ->paginate(10);

        return ReservationResource::collection($reservations);
    }

    /**
     * @OA\Post(
     *     path="/api/reservations",
     *     summary="Kreiranje nove rezervacije (Researcher/Admin)",
     *     tags={"Rezervacije"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start_time", "end_time", "purpose", "status", "equipment_id", "project_id"},
     *             @OA\Property(property="start_time", type="string", example="2025-06-01 10:00"),
     *             @OA\Property(property="end_time", type="string", example="2025-06-01 12:00"),
     *             @OA\Property(property="purpose", type="string", example="Korišćenje mikroskopa za projekat X"),
     *             @OA\Property(property="status", type="string", enum={"pending", "approved", "rejected", "completed", "cancelled"}, example="pending"),
     *             @OA\Property(property="equipment_id", type="integer", example=1),
     *             @OA\Property(property="project_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Rezervacija uspešno kreirana"),
     *     @OA\Response(response=422, description="Greška u validaciji ili je oprema zauzeta/nedostupna")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'start_time'    => 'required|date_format:Y-m-d H:i|after:now',
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

    /**
     * @OA\Delete(
     *     path="/api/reservations/{reservation}",
     *     summary="Brisanje rezervacije (Researcher/Admin)",
     *     tags={"Rezervacije"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="reservation", in="path", description="ID rezervacije", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Rezervacija obrisana"),
     *     @OA\Response(response=403, description="Zabranjen pristup")
     * )
     */
    public function destroy(Request $request, Reservation $reservation)
    {
        $this->authorize('delete', $reservation);

        $reservation->delete();
        return response()->json(['message' => 'Rezervacija obrisana.']);
    }
}
