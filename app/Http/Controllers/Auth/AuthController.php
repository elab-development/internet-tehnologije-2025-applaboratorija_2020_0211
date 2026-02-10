<?php

namespace App\Http\Controllers\Auth;


use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request){
        $validator=Validator::make($request->all(),[
            'name'=>'required',
            'email'=>'required|email|unique:users',
            'password'=>'required|string|min:8',
            'role_id'=> 'required',
        ]);
        if($validator->fails()){
            return response()->json($validator->errors()->toJson(),400);
        }
        $user=User::create(
            [
                'name'=>$request->get('name'),
                'email'=>$request->get('email'),
                'password'=>Hash::make($request->get('password')),
                'role_id'=>$request->get('role_id'),
            ]
        );
        $token=$user->createToken('authToken')->plainTextToken;

        return response()->json(['data'=>new UserResource($user),'token'=>$token,"message"=>"Uspesno ste se registrovali"],201);
    }
    public function login(Request $request){
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);
        if($validator->fails()){
            return response()->json($validator->errors()->toJson(), 400);
        }
        $user=User::where('email',$request->get('email'))->first();
        if(!$user||!Hash::check($request->password,$user->password)){
            return response()->json(['message' => 'The provided credentials are incorrect.'],401);
        }
        $token=$user->createToken('authToken')->plainTextToken;
        return response()->json(['user'=>new UserResource($user),'token'=>$token,"message"=>"Uspesno ste se ulogovali"],200);

    }
}
