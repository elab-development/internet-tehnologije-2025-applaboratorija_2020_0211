<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::put('/profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword']);

    // Projects
    Route::get('/projects/search', [\App\Http\Controllers\ProjectController::class, 'search']);
    Route::get('/projects', [\App\Http\Controllers\ProjectController::class, 'index']);
    Route::get('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'show']);
    Route::get('/projects/{project}/experiments', [\App\Http\Controllers\ProjectController::class, 'experiments']);

    // Equipment
    Route::get('/equipment', [\App\Http\Controllers\EquipmentController::class, 'index']);

    // Favorites
    Route::get('/favorites', [\App\Http\Controllers\FavoriteController::class, 'index']);
    Route::post('/favorites', [\App\Http\Controllers\FavoriteController::class, 'store']);
    Route::delete('/favorites', [\App\Http\Controllers\FavoriteController::class, 'destroy']);

    // Statistics
    Route::middleware('role:researcher,admin')->get('/statistics', [\App\Http\Controllers\StatisticsController::class, 'index']);

    // Researcher/Admin routes
    Route::middleware('role:researcher,admin')->group(function () {
        Route::post('/projects', [\App\Http\Controllers\ProjectController::class, 'store']);
        Route::put('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'destroy']);

        Route::get('/experiments', [\App\Http\Controllers\ExperimentController::class, 'index']);
        Route::post('/projects/experiments', [\App\Http\Controllers\ExperimentController::class, 'store']);
        Route::put('/experiments/{experiment}', [\App\Http\Controllers\ExperimentController::class, 'update']);
        Route::delete('/experiments/{experiment}', [\App\Http\Controllers\ExperimentController::class, 'destroy']);

        Route::get('/samples', [\App\Http\Controllers\SampleController::class, 'index']);
        Route::post('/samples', [\App\Http\Controllers\SampleController::class, 'store']);

        Route::get('/reservations', [\App\Http\Controllers\ReservationController::class, 'index']);
        Route::post('/reservations', [\App\Http\Controllers\ReservationController::class, 'store']);
        Route::delete('/reservations/{reservation}', [\App\Http\Controllers\ReservationController::class, 'destroy']);

        Route::post('/reports', [\App\Http\Controllers\ReportController::class, 'store']);
    });

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);
        Route::put('/users/{user}', [\App\Http\Controllers\UserController::class, 'update']);
        Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy']);

        Route::post('/equipment', [\App\Http\Controllers\EquipmentController::class, 'store']);
        Route::put('/equipment/{equipment}', [\App\Http\Controllers\EquipmentController::class, 'update']);
        Route::delete('/equipment/{equipment}', [\App\Http\Controllers\EquipmentController::class, 'destroy']);

        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index']);
        Route::put('/reports/{report}', [\App\Http\Controllers\ReportController::class, 'update']);
    });
});
