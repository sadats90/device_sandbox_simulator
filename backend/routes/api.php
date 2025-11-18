<?php

use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\PresetController;
use Illuminate\Support\Facades\Route;

Route::prefix('devices')->group(function () {
    Route::get('/', [DeviceController::class, 'index']);
    Route::get('/{device}', [DeviceController::class, 'show']);
    Route::post('/{device}/state', [DeviceController::class, 'updateState']);
    Route::post('/{device}/apply-preset/{preset}', [DeviceController::class, 'applyPreset']);
});

Route::get('/presets', [PresetController::class, 'index']);
Route::post('/presets', [PresetController::class, 'store']);
Route::delete('/presets/{preset}', [PresetController::class, 'destroy']);

