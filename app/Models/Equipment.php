<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'manufacturer', 'model_number', 'location', 'status'];

    public function reservation() {
        return $this->belongsTo(Reservation::class, 'equipment_reservation');
    }
}
