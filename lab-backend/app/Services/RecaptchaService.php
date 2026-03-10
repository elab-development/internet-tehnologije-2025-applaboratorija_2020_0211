<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RecaptchaService
{
    public function verify(string $token, string $action): bool
    {
        $secret  = config('services.recaptcha.secret');
        $enabled = config('services.recaptcha.enabled', true);

        if (!$secret || !$enabled) {
            return true; // Skip if secret not configured or reCAPTCHA disabled
        }

        try {
            $response = Http::post('https://www.google.com/recaptcha/api/siteverify', [
                'secret'   => $secret,
                'response' => $token,
            ]);

            if (!$response->successful()) {
                return false;
            }

            $data = $response->json();

            // Check if score is above threshold (0.5 for actions like register, 0.7 for others)
            $threshold = $action === 'register' ? 0.5 : 0.7;

            return isset($data['score']) && $data['score'] >= $threshold && $data['success'] === true;
        } catch (\Exception $e) {
            \Log::error('reCAPTCHA verification failed: ' . $e->getMessage());
            return false;
        }
    }
}
