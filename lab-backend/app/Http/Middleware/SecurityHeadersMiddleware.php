<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * BEZBEDNOST #1 – XSS i Clickjacking zaštita
 *
 * Dodaje HTTP security headers na svaki odgovor:
 * - Content-Security-Policy: sprečava učitavanje eksternih skripti (XSS)
 * - X-Frame-Options: sprečava embedding u iframe (Clickjacking)
 * - X-Content-Type-Options: sprečava MIME type sniffing
 * - X-XSS-Protection: browser-level XSS filter (legacy)
 * - Referrer-Policy: ograničava slanje Referer headera
 * - Strict-Transport-Security: forsira HTTPS (production)
 */
class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // ─── Anti-Clickjacking ────────────────────────────────────
        $response->headers->set('X-Frame-Options', 'DENY');

        // ─── Anti-XSS (MIME sniffing) ────────────────────────────
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // ─── Legacy XSS filter ───────────────────────────────────
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // ─── Referrer Policy ─────────────────────────────────────
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // ─── Content Security Policy (XSS zaštita) ───────────────
        // Dozvoljeni su samo resursi sa navedenih izvora.
        // 'unsafe-inline' je dozvoljen jer MUI koristi inline stilove.
        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' https://www.google.com https://www.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob:",
            "connect-src 'self' " . env('FRONTEND_URL', 'http://localhost:5173'),
            "frame-src https://www.google.com",
            "object-src 'none'",
            "base-uri 'self'",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);

        // ─── HSTS (samo u production-u) ──────────────────────────
        if (app()->environment('production')) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // ─── Ukloni "X-Powered-By" header ───────────────────────
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
