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
            $from = config('services.resend.from_email', 'noreply@researchhub.local');

            Mail::send('emails.welcome', ['user' => $user], function ($message) use ($user, $from) {
                $message->to($user->email)
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
            $from = config('services.resend.from_email', 'noreply@researchhub.local');

            $adminEmails = User::where('role', 'admin')->pluck('email')->toArray();

            if (empty($adminEmails)) {
                return;
            }

            Mail::send('emails.report-submitted', ['report' => $report], function ($message) use ($adminEmails, $from) {
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

            Mail::send('emails.paper-deleted', ['user' => $user, 'paperTitle' => $paperTitle], function ($message) use ($user, $from) {
                $message->to($user->email)
                    ->from($from)
                    ->subject('Rad je obrisan');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send paper deleted email: ' . $e->getMessage());
        }
    }
}
