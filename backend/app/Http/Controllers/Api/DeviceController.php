<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\Preset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DeviceController extends Controller
{
    public function index(): JsonResponse
    {
        $devices = Device::with('presets')->orderBy('id')->get();

        return response()->json([
            'data' => $devices,
        ]);
    }

    public function show(Device $device): JsonResponse
    {
        $device->load('presets');

        return response()->json([
            'data' => $device,
        ]);
    }

    public function updateState(Request $request, Device $device): JsonResponse
    {
        $validated = $this->validateState($request, $device->type);

        $device->state = array_merge($device->state ?? [], $validated);
        $device->save();

        return response()->json([
            'data' => $device->fresh('presets'),
            'message' => 'Device state updated.',
        ]);
    }

    public function applyPreset(Device $device, Preset $preset): JsonResponse
    {
        if ($preset->device_id !== $device->id) {
            abort(404, 'Preset not found for the specified device.');
        }

        $device->state = $preset->state;
        $device->save();

        return response()->json([
            'data' => $device->fresh('presets'),
            'message' => 'Preset applied.',
        ]);
    }

    /**
     * @throws ValidationException
     */
    protected function validateState(Request $request, string $deviceType): array
    {
        $rules = match ($deviceType) {
            'light' => [
                'power' => ['sometimes', 'boolean'],
                'brightness' => ['sometimes', 'integer', 'min:0', 'max:100'],
                'colorTemperature' => ['sometimes', 'string', 'in:warm,neutral,cool,custom'],
            ],
            'fan' => [
                'power' => ['sometimes', 'boolean'],
                'speed' => ['sometimes', 'integer', 'min:0', 'max:100'],
            ],
            default => throw ValidationException::withMessages([
                'type' => ['Unsupported device type.'],
            ]),
        };

        return $request->validate($rules);
    }
}
