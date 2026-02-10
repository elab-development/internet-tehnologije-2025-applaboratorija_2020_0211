<?php

namespace App\Http\Controllers;
use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EquipmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $equipment = Equipment::all();
        return response()->json(['data'=>EquipmentResource::collection($equipment)],200);
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
        $validator=Validator::make($request->all(),[
            'name'=>'required',
            'model_number'=>'required',
            'status'=>'required',
            'manufacturer'=>'required',
            'location'=>'required',
        ]);
        if($validator->fails()){
            return response()->json($validator->errors(),400);

        }
        $equipment=Equipment::create([
            'name'=>$request->name,
            'model_number'=>$request->model_number,
            'status'=>$request->status,
            'manufacturer'=>$request->manufacturer,
            'location'=>$request->location,
        ]);
        return response()->json(['data'=>new EquipmentResource($equipment)],200);
    }


    /**
     * Display the specified resource.
     */
    public function show( $id)
    {
        $equipment=Equipment::where('id',$id)->firstOrFail();
        return response()->json(['data'=>new EquipmentResource($equipment)],200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Equipment $equipment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Equipment $equipment)
    {
        $equipment->update($request->all());
        return response()->json(['data'=>new EquipmentResource($equipment)],200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Equipment $equipment)
    {
        $equipment->delete();
        return response()->json(['data'=>new EquipmentResource($equipment)],200);
    }
}
