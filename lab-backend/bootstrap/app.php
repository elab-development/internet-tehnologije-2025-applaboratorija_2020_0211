<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SecurityHeadersMiddleware;
use App\Http\Middleware\SanitizeInputMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Aplikacija koristi Bearer token auth (ne session-based SPA auth),
        // pa EnsureFrontendRequestsAreStateful nije potreban i aktivno izaziva
        // CSRF token mismatch grešku za sve POST/PUT/DELETE zahteve sa localhost:3000.

        // ← NOVO: Security headers na sve API odgovore
        $middleware->api(append: [
            SecurityHeadersMiddleware::class,
        ]);

        // ← NOVO: Sanitizacija inputa na sve API zahteve
        $middleware->api(append: [
            SanitizeInputMiddleware::class,
        ]);

        // Alias za middleware
        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // JSON greške za API rute
        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], method_exists($e, 'getStatusCode')
                    ? $e->getStatusCode()
                    : 500
                );
            }
        });
    })->create();
