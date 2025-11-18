<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Preset extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'name',
        'state',
    ];

    protected $casts = [
        'state' => 'array',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
