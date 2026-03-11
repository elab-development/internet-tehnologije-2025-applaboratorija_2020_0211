<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\ExperimentController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\SampleController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════════════════════
// TIP RUTE #1 – JAVNE RUTE
// + BEZBEDNOST #3: Rate Limiting na auth rute
// ═══════════════════════════════════════════════════════════

// Login: max 10 pokušaja/min po IP (Brute Force zaštita)
Route::middleware('throttle:login')
     ->post('/login', [AuthController::class, 'login']);

// Register: max 5 registracija/min po IP (Bot zaštita)
Route::middleware('throttle:register')
     ->post('/register', [AuthController::class, 'register']);

// ═══════════════════════════════════════════════════════════
// TIP RUTE #2 + #3 – ZAŠTIĆENE RUTE
// + BEZBEDNOST #3: Opšti rate limiter (60 req/min)
// ═══════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Profil
    Route::put('/profile',          [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // VAŽNO: search mora biti pre {project} rute
    Route::get('/projects/search', [ProjectController::class, 'search']);

    // Projekti – pregled
    Route::get('/projects',                       [ProjectController::class, 'index']);
    Route::get('/projects/{project}',             [ProjectController::class, 'show']);
    Route::get('/projects/{project}/experiments', [ProjectController::class, 'experiments']);

    // Oprema – pregled
    Route::get('/equipment', [EquipmentController::class, 'index']);

    // Favoriti
    Route::get('/favorites',    [FavoriteController::class, 'index']);
    Route::post('/favorites',   [FavoriteController::class, 'store']);
    Route::delete('/favorites', [FavoriteController::class, 'destroy']);

    // Statistike
    Route::middleware('role:researcher,admin')
         ->get('/statistics', [StatisticsController::class, 'index']);

    // ═══════════════════════════════════════════════════════
    // RESEARCHER + ADMIN RUTE
    // ═══════════════════════════════════════════════════════
    Route::middleware('role:researcher,admin')->group(function () {

        // Korisnici dostupni za dodavanje na projekat
        Route::get('/users/assignable', [UserController::class, 'assignable']);

        // Projekti – CRUD
        // BEZBEDNOST #2: IDOR – Policy se poziva u kontroleru
        Route::post('/projects',             [ProjectController::class, 'store']);
        Route::put('/projects/{project}',    [ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

        // Eksperimenti
        Route::get('/experiments',               [ExperimentController::class, 'index']);
        Route::post('/projects/experiments',     [ExperimentController::class, 'store']);
        Route::put('/experiments/{experiment}',  [ExperimentController::class, 'update']);
        Route::delete('/experiments/{experiment}', [ExperimentController::class, 'destroy']);

        // Uzorci
        Route::get('/samples',  [SampleController::class, 'index']);
        Route::post('/samples', [SampleController::class, 'store']);

        // Rezervacije
        Route::get('/reservations',                  [ReservationController::class, 'index']);
        Route::post('/reservations',                 [ReservationController::class, 'store']);
        Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy']);

        // Prijave – poseban rate limiter (3/min)
        Route::middleware('throttle:reports')
             ->post('/reports', [ReportController::class, 'store']);
    });

    // ═══════════════════════════════════════════════════════
    // SAMO ADMIN RUTE
    // ═══════════════════════════════════════════════════════
    Route::middleware('role:admin')->group(function () {

        Route::get('/users',           [UserController::class, 'index']);
        Route::put('/users/{user}',    [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        Route::post('/equipment',              [EquipmentController::class, 'store']);
        Route::put('/equipment/{equipment}',   [EquipmentController::class, 'update']);
        Route::delete('/equipment/{equipment}',[EquipmentController::class, 'destroy']);

        Route::get('/reports',          [ReportController::class, 'index']);
        Route::put('/reports/{report}', [ReportController::class, 'update']);
    });
});
