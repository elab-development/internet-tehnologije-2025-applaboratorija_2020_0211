<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experiment extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'protocol', 'date_performed', 'status', 'project_id', 'user_id'];

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function samples() {
        return $this->hasMany(Sample::class);
    }
}
