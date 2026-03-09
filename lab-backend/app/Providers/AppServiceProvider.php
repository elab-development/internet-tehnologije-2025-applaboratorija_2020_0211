<?php

namespace App\Providers;

use App\Models\Experiment;
use App\Models\Project;
use App\Models\Reservation;
use App\Policies\ExperimentPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\ReservationPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // ─── BEZBEDNOST #2: IDOR – Registracija Policies ─────────
        Gate::policy(Project::class,     ProjectPolicy::class);
        Gate::policy(Experiment::class,  ExperimentPolicy::class);
        Gate::policy(Reservation::class, ReservationPolicy::class);

        // ─── BEZBEDNOST #3: Rate Limiting (Brute Force zaštita) ──

        /**
         * 'login' limiter: max 10 pokušaja prijave po minuti po IP adresi.
         * Sprečava brute-force napade na lozinke.
         */
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Previše pokušaja prijave. Pokušajte ponovo za 1 minut.',
                    ], 429);
                });
        });

        /**
         * 'register' limiter: max 5 registracija po minuti po IP adresi.
         * Sprečava masovno kreiranje naloga (bot protection).
         */
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Previše zahteva za registraciju. Pokušajte ponovo za 1 minut.',
                    ], 429);
                });
        });

        /**
         * 'api' limiter: max 60 zahteva po minuti po korisniku/IP.
         * Opšta zaštita od preopterećenja API-ja.
         */
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Previše zahteva. Usporite i pokušajte ponovo.',
                    ], 429);
                });
        });

        /**
         * 'reports' limiter: max 3 prijave po minuti.
         * Sprečava spam prijava problema.
         */
        RateLimiter::for('reports', function (Request $request) {
            return Limit::perMinute(3)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Previše prijava. Sačekajte pre sledeće.',
                    ], 429);
                });
        });
    }
}
