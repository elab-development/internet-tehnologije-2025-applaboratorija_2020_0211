<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

/**
 * BEZBEDNOST #2 – IDOR zaštita (Insecure Direct Object Reference)
 *
 * Laravel Policy formalizuje pravila pristupa resursima.
 * Kontroler poziva $this->authorize('update', $project) i
 * Policy automatski proverava da li korisnik sme da pristupi objektu.
 *
 * Bez ove zaštite, korisnik bi mogao da promeni ID u URL-u
 * i pristupi/izmeni tuđe resurse.
 */
class ProjectPolicy
{
    /**
     * Admin uvek može sve.
     * Vraća true = ovaj admin bypass prolazi kroz sve metode.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return null; // Nastavi sa specifičnom proverom
    }

    /**
     * Ko može videti projekat?
     * - Svi autentifikovani korisnici (search/browse)
     */
    public function view(User $user, Project $project): bool
    {
        return true;
    }

    /**
     * Ko može kreirati projekat?
     * - Researcher i Admin
     */
    public function create(User $user): bool
    {
        return $user->isResearcher();
    }

    /**
     * Ko može menjati projekat?
     * - Vlasnik (lead) projekta
     * - Admin (pokriveno before())
     *
     * IDOR prevencija: korisnik ne može menjati tuđi projekat
     * čak i ako zna njegov ID.
     */
    public function update(User $user, Project $project): bool
    {
        return $project->lead_id === $user->id;
    }

    /**
     * Ko može brisati projekat?
     * - Vlasnik projekta
     * - Admin (pokriveno before())
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->lead_id === $user->id;
    }
}
