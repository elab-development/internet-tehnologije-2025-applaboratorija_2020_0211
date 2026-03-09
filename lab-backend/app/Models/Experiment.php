<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experiment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'protocol', 'date_performed', 'status', 'project_id',
    ];

    protected $casts = [
        'date_performed' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function samples()
    {
        return $this->hasMany(Sample::class);
    }
}
