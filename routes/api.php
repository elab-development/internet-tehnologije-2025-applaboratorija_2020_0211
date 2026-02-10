<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post("/register",[AuthController::class,'register']);
Route::post("/login",[AuthController::class,'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',[AuthController::class,'me']);

});
Route::middleware('auth:sanctum','role:admin')->group(function () {
    Route::get("/users",[UserController::class,'index']);
    Route::get("/users/{id}",[UserController::class,'show']);
    Route::delete("/users/{id}",[UserController::class,'destroy']);
    Route::get('users/{id}/role',[UserController::class,'getAllUsersForRole']);
});
