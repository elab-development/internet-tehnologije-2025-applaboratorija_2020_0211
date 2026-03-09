# Integracija eksternih API-ja

## Eksterni API #1 – Google reCAPTCHA v3

### Frontend (implementirano u Commitu 4)
- Package: `react-google-recaptcha-v3`
- Provider: `GoogleReCaptchaProvider` u `main.jsx`
- Hook: `src/hooks/useRecaptcha.js`
- Tokeni se generišu na: Login (`action: 'login'`), Register (`action: 'register'`)
- Token se šalje kao `recaptcha_token` u POST body

### Backend (implementirati u Commitu 5)

#### Instalacija:
```bash
composer require google/recaptcha
```

#### .env varijable:
```
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ19_J9TZ
RECAPTCHA_MIN_SCORE=0.5
RECAPTCHA_ENABLED=true
```

#### Servis klasa (`app/Services/RecaptchaService.php`):

```php
<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class RecaptchaService
{
    public function verify(string $token, string $action): bool
    {
        if (!config('services.recaptcha.enabled', true)) {
            return true; // Skip u development-u
        }

        $response = Http::asForm()->post(
            'https://www.google.com/recaptcha/api/siteverify',
            [
                'secret'   => config('services.recaptcha.secret_key'),
                'response' => $token,
            ]
        );

        $result = $response->json();

        return $result['success'] === true
            && ($result['score'] ?? 0) >= config('services.recaptcha.min_score', 0.5)
            && ($result['action'] ?? '') === $action;
    }
}
```

Upotreba u AuthController:
```php
public function login(Request $request)
{
    $token = $request->input('recaptcha_token');

    if ($token && !app(RecaptchaService::class)->verify($token, 'login')) {
        return response()->json([
            'message' => 'reCAPTCHA verifikacija nije uspela. Pokušajte ponovo.'
        ], 422);
    }

    // ... ostatak login logike
}
```

## Eksterni API #2 – Resend (Email notifikacije)

### Backend (implementirati u Commitu 5)

#### Instalacija:
```bash
composer require resend/resend-laravel
```

#### .env varijable:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
MAIL_MAILER=resend
MAIL_FROM_ADDRESS=noreply@researchhub.app
MAIL_FROM_NAME=ResearchHub
```

#### Emailovi koji se šalju:

| Trigger | Primalac | Tip |
|---------|----------|-----|
| POST /api/register | Novoregistrovani korisnik | Welcome email |
| POST /api/reports | Svi admini | Obaveštenje o prijavi |
| DELETE /api/projects/:id (admin) | Vlasnik rada | Obaveštenje o brisanju |

#### Email klase (Laravel Mailables):
- `app/Mail/WelcomeMail.php`
- `app/Mail/ReportSubmittedMail.php`
- `app/Mail/PaperDeletedMail.php`
