<?php

namespace App\Providers;

use App\Models\Project;
use App\Models\Experiment;
use App\Policies\ProjectPolicy;
use App\Policies\ExperimentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Project::class    => ProjectPolicy::class,
        Experiment::class => ExperimentPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
