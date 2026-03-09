<?php

namespace App\Http\Controllers;

use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $equipment = Equipment::when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->location, fn($q) => $q->where('location', 'like', "%{$request->location}%"))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return EquipmentResource::collection($equipment);
    }

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

    public function destroy(Request $request, Equipment $equipment)
    {
        $equipment->delete();
        return response()->json(['message' => 'Oprema obrisana.']);
    }
}
