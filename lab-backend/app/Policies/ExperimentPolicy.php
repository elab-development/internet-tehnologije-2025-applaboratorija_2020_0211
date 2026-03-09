<?php

namespace App\Policies;

use App\Models\Experiment;
use App\Models\User;

class ExperimentPolicy
{
    public function update(User $user, Experiment $experiment): bool
    {
        return $user->id === $experiment->project->lead_id || $user->isAdmin();
    }

    public function delete(User $user, Experiment $experiment): bool
    {
        return $user->id === $experiment->project->lead_id || $user->isAdmin();
    }
}
