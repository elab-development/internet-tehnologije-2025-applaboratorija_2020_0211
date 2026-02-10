<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post("/register",[AuthController::class,'register']);
Route::post("/login",[AuthController::class,'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',[AuthController::class,'me']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::get('/projects/{id}/download', [ProjectController::class, 'downloadDocument']);

});
Route::middleware('auth:sanctum','role:admin')->group(function () {
    Route::get("/users",[UserController::class,'index']);
    Route::get("/users/{id}",[UserController::class,'show']);
    Route::delete("/users/{id}",[UserController::class,'destroy']);
    Route::get('users/{id}/role',[UserController::class,'getAllUsersForRole']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);


});
Route::middleware('auth:sanctum','role:admin,researcher')->group(function () {
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::post('/projects/{id}/upload-document', [ProjectController::class, 'uploadDocument']);

});
