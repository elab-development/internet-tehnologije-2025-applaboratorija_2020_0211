<?php

namespace App\Services;

use App\Models\User;
use App\Models\Report;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    public function sendWelcome(User $user): void
    {
        try {
            // Using Resend email service
            $from = config('services.resend.from_email', 'noreply@researchhub.local');

            Mail::raw(
                "Dobrodošli u ResearchHub!\n\n" .
                "Vaš nalog je uspešno kreiran.\n\n" .
                "Posetite platformu: " . config('app.frontend_url', 'http://localhost:5173'),
                function ($message) use ($user, $from) {
                    $message->to($user->email)
                        ->from($from)
                        ->subject('Dobrodošli u ResearchHub!');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send welcome email: ' . $e->getMessage());
        }
    }

    public function sendReportSubmitted(Report $report): void
    {
        try {
            $from = config('services.resend.from_email', 'noreply@researchhub.local');

            $adminEmails = User::where('role', 'admin')->pluck('email')->toArray();

            if (empty($adminEmails)) {
                return;
            }

            $content = "Novi izveštaj je poslat!\n\n" .
                "Korisnik: {$report->user->name}\n" .
                "Projekat: {$report->project?->title ?? 'N/A'}\n" .
                "Opis: {$report->description}\n\n" .
                "Pregledajte izveštaj na platformi.";

            Mail::raw($content, function ($message) use ($adminEmails, $from) {
                $message->to($adminEmails)
                    ->from($from)
                    ->subject('Novi izveštaj prosledio korisnik');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send report submitted email: ' . $e->getMessage());
        }
    }

    public function sendPaperDeleted(User $user, string $paperTitle): void
    {
        try {
            $from = config('services.resend.from_email', 'noreply@researchhub.local');

            Mail::raw(
                "Rad je obrisan.\n\n" .
                "Rad: {$paperTitle}\n" .
                "Datum: " . now()->format('d.m.Y H:i'),
                function ($message) use ($user, $from) {
                    $message->to($user->email)
                        ->from($from)
                        ->subject('Rad je obrisan');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send paper deleted email: ' . $e->getMessage());
        }
    }
}
