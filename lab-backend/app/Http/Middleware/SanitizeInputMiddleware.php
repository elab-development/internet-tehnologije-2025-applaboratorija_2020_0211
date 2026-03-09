<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * BEZBEDNOST #1 – XSS zaštita (backend strana)
 *
 * Sanitizuje sve string inpute koji dolaze u HTTP zahtevima.
 * strip_tags() uklanja HTML tagove pre nego što podaci dođu do kontrolera.
 * Time se sprečava čuvanje malicioznog HTML/JS koda u bazi podataka.
 *
 * ISKLJUČENI fajlovi (binarne vrednosti se ne sanitizuju).
 */
class SanitizeInputMiddleware
{
    /**
     * Polja koja se NE sanitizuju (lozinke, tokeni).
     */
    private array $skipFields = [
        'password',
        'password_confirmation',
        'current_password',
        'recaptcha_token',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->except($this->skipFields);

        array_walk_recursive($input, function (&$value) {
            if (is_string($value)) {
                // Ukloni HTML tagove (XSS vektor)
                $value = strip_tags($value);
                // Trim whitespace
                $value = trim($value);
            }
        });

        // Merge sanitizovanih podataka (zadržava preskočena polja)
        $request->merge($input);

        return $next($request);
    }
}
