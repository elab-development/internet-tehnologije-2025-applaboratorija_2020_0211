<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

/**
 * BEZBEDNOST #2 – IDOR zaštita za Reservation model
 */
class ReservationPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return null;
    }

    /**
     * Ko može brisati rezervaciju?
     * - Samo onaj ko ju je kreirao
     *
     * IDOR prevencija: DELETE /api/reservations/5 neće raditi
     * ako rezervacija 5 nije kreirana od strane autentifikovanog korisnika.
     */
    public function delete(User $user, Reservation $reservation): bool
    {
        return $reservation->user_id === $user->id;
    }
}
