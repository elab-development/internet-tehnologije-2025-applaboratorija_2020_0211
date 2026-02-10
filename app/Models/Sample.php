<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sample extends Model
{
    use HasFactory;
    protected $fillable = ['code', 'type', 'source', 'location', 'metadata', 'experiment_id'];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function experiment() {
        return $this->belongsTo(Experiment::class);
    }
}
