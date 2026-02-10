<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;
    protected $fillable = [
        'start_time',
        'end_time',
        'project_id',
        'equipment_id',
        'purpose',
        'user_id',
        'status',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function equipment() {
        return $this->belongsTo(Equipment::class);
    }
}
