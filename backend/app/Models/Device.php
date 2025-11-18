<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'state',
    ];

    protected $casts = [
        'state' => 'array',
    ];

    public function presets()
    {
        return $this->hasMany(Preset::class);
    }
}
