<?php

namespace App\Services;

use App\Models\User;
use App\Models\Report;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    // Besplatni Resend nalog: mejlovi se mogu slati isključivo na verifikovanu adresu vlasnika naloga.
    private const RESEND_TEST_RECIPIENT = 'ap20200211@student.fon.bg.ac.rs';

    public function sendWelcome(User $user): void
    {
        try {
            $from = config('services.resend.from_email', 'onboarding@resend.dev');

            Mail::send('emails.welcome', ['user' => $user], function ($message) use ($from) {
                $message->to(self::RESEND_TEST_RECIPIENT)
                    ->from($from)
                    ->subject('Dobrodošli u ResearchHub!');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send welcome email: ' . $e->getMessage());
        }
    }

    public function sendReportSubmitted(Report $report): void
    {
        try {
            $from = config('services.resend.from_email', 'onboarding@resend.dev');

            Mail::send('emails.report-submitted', ['report' => $report], function ($message) use ($from) {
                $message->to(self::RESEND_TEST_RECIPIENT)
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
            $from = config('services.resend.from_email', 'onboarding@resend.dev');

            Mail::send('emails.paper-deleted', ['user' => $user, 'paperTitle' => $paperTitle], function ($message) use ($from) {
                $message->to(self::RESEND_TEST_RECIPIENT)
                    ->from($from)
                    ->subject('Rad je obrisan');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send paper deleted email: ' . $e->getMessage());
        }
    }
}
