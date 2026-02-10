<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'code', 'description', 'budget', 'start_date','category', 'end_date', 'status', 'lead_user_id','document_path'];


    public function leader()
    {
        return $this->belongsTo(User::class, 'lead_user_id');
    }
    public function members(){
        return $this->belongsToMany(User::class)
            ->withPivot('date_joined');
    }
    public function experiments() {
        return $this->hasMany(Experiment::class);
    }

    public function reservations() {
        return $this->hasMany(Reservation::class);
    }


}
