<?php

namespace App\Http\Controllers;

use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/equipment",
     *     summary="Pregled opreme",
     *     tags={"Oprema"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", description="Filter po statusu", required=false, @OA\Schema(type="string", enum={"available", "in_use", "maintenance", "retired"})),
     *     @OA\Parameter(name="location", in="query", description="Pretraga po lokaciji", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Lista opreme sa paginacijom")
     * )
     */
    public function index(Request $request)
    {
        $equipment = Equipment::when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->location, fn($q) => $q->where('location', 'like', "%{$request->location}%"))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return EquipmentResource::collection($equipment);
    }

    /**
     * @OA\Post(
     *     path="/api/equipment",
     *     summary="Dodavanje nove opreme (Samo Admin)",
     *     tags={"Oprema"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "manufacturer", "model_number", "location", "status"},
     *             @OA\Property(property="name", type="string", example="Mikroskop X200"),
     *             @OA\Property(property="manufacturer", type="string", example="Zeiss"),
     *             @OA\Property(property="model_number", type="string", example="M-2024-X2"),
     *             @OA\Property(property="location", type="string", example="Soba 101"),
     *             @OA\Property(property="status", type="string", enum={"available", "in_use", "maintenance", "retired"}, example="available")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Oprema uspešno kreirana"),
     *     @OA\Response(response=403, description="Zabranjen pristup"),
     *     @OA\Response(response=422, description="Greška u validaciji")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'manufacturer'   => 'required|string|max:255',
            'model_number'   => 'required|string|max:255|unique:equipment,model_number',
            'location'       => 'required|string|max:255',
            'status'         => 'required|in:available,in_use,maintenance,retired',
        ]);

        $equipment = Equipment::create($data);

        return response()->json(['message' => 'Oprema uspešno kreirana.', 'data' => new EquipmentResource($equipment)], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/equipment/{equipment}",
     *     summary="Ažuriranje postojeće opreme (Samo Admin)",
     *     tags={"Oprema"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="equipment", in="path", description="ID opreme", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Mikroskop X200"),
     *             @OA\Property(property="status", type="string", enum={"available", "in_use", "maintenance", "retired"}, example="maintenance")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Oprema uspešno ažurirana"),
     *     @OA\Response(response=403, description="Zabranjen pristup"),
     *     @OA\Response(response=404, description="Oprema nije pronađena")
     * )
     */
    public function update(Request $request, Equipment $equipment)
    {
        $data = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'manufacturer'   => 'sometimes|string|max:255',
            'model_number'   => 'sometimes|string|max:255|unique:equipment,model_number,' . $equipment->id,
            'location'       => 'sometimes|string|max:255',
            'status'         => 'sometimes|in:available,in_use,maintenance,retired',
        ]);

        $equipment->update($data);

        return response()->json(['message' => 'Oprema uspešno ažurirana.', 'data' => new EquipmentResource($equipment)]);
    }

    /**
     * @OA\Delete(
     *     path="/api/equipment/{equipment}",
     *     summary="Brisanje opreme (Samo Admin)",
     *     tags={"Oprema"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="equipment", in="path", description="ID opreme", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Oprema obrisana"),
     *     @OA\Response(response=403, description="Zabranjen pristup")
     * )
     */
    public function destroy(Request $request, Equipment $equipment)
    {
        $equipment->delete();
        return response()->json(['message' => 'Oprema obrisana.']);
    }
}
