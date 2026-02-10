<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ExperimentController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\SampleController;
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
    Route::get('/experiments/{experiment}/samples', [SampleController::class, 'index']);
    Route::get('/projects/search', [ProjectController::class, 'search'])->middleware('auth:sanctum');
    Route::get("/favorites",[FavoriteController::class, 'index']);
    Route::post("/favorites",[FavoriteController::class, 'store']);
    Route::delete("/favorites",[FavoriteController::class, 'destroy']);



});
Route::middleware('auth:sanctum','role:admin')->group(function () {
    Route::get("/users",[UserController::class,'index']);
    Route::get("/users/{id}",[UserController::class,'show']);
    Route::delete("/users/{id}",[UserController::class,'destroy']);
    Route::get('users/{id}/role',[UserController::class,'getAllUsersForRole']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
    Route::post('/experiments/{experiment}/samples', [SampleController::class, 'store']);
    Route::delete('/samples/{sample}', [SampleController::class, 'destroy']);
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::post('/reservations', [ReservationController::class, 'store']);

    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);


});
Route::middleware('auth:sanctum','role:admin,researcher')->group(function () {
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::post('/projects/{id}/upload-document', [ProjectController::class, 'uploadDocument']);
    Route::get('/projects/{project}/experiments', [ExperimentController::class, 'index']);
    Route::post('/projects/experiments', [ExperimentController::class, 'store']);
    Route::put('/experiments/{experiment}', [ExperimentController::class, 'update']);
    Route::delete('/experiments/{experiment}', [ExperimentController::class, 'destroy']);
});
