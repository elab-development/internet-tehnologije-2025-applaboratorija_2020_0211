<?php

namespace App\Policies;

use App\Models\Experiment;
use App\Models\User;

/**
 * BEZBEDNOST #2 – IDOR zaštita za Experiment model
 */
class ExperimentPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return null;
    }

    /**
     * Ko može menjati eksperiment?
     * - Vlasnik projekta kome eksperiment pripada
     * - Član projekta
     */
    public function update(User $user, Experiment $experiment): bool
    {
        $project = $experiment->project;

        if ($project->lead_id === $user->id) {
            return true;
        }

        // Proverava da li je član projekta
        return $project->members()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function delete(User $user, Experiment $experiment): bool
    {
        return $this->update($user, $experiment);
    }
}
