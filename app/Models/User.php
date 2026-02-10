<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable,HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function role() {
        return $this->belongsTo(Role::class);
    }

    public function projects() {
        return $this->belongsToMany(Project::class)
            ->withPivot('date_joined')
            ->withTimestamps();
    }

    public function ledProjects() {
        return $this->hasMany(Project::class, 'lead_user_id');
    }

    public function reservations() {
        return $this->hasMany(Reservation::class);
    }

    public function experiments() {
        return $this->hasMany(Experiment::class);
    }
    public function favorites() {
        return $this->hasMany(Favorite::class);
    }
}
