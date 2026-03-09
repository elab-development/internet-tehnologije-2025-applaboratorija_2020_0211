<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function update(User $user, Project $project): bool
    {
        return $user->id === $project->lead_id || $user->isAdmin();
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->id === $project->lead_id || $user->isAdmin();
    }
}
