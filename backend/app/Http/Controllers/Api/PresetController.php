<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\Preset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PresetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $presets = Preset::with('device')
            ->when($request->query('device_id'), fn ($query, $deviceId) => $query->where('device_id', $deviceId))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $presets,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_id' => ['required', 'exists:devices,id'],
            'name' => ['required', 'string', 'max:255'],
            'state' => ['required', 'array'],
        ]);

        $device = Device::with('presets')->findOrFail($validated['device_id']);
        $state = $this->validateStatePayload($device, $validated['state']);

        $preset = $device->presets()->create([
            'name' => $validated['name'],
            'state' => array_merge($device->state ?? [], $state),
        ]);

        return response()->json([
            'data' => $preset->load('device'),
            'message' => 'Preset saved.',
        ], 201);
    }

    public function destroy(Preset $preset): JsonResponse
    {
        $preset->delete();

        return response()->json([
            'message' => 'Preset removed.',
        ]);
    }

    /**
     * @throws ValidationException
     */
    protected function validateStatePayload(Device $device, array $state): array
    {
        $rules = match ($device->type) {
            'light' => [
                'power' => ['required', 'boolean'],
                'brightness' => ['required', 'integer', 'min:0', 'max:100'],
                'colorTemperature' => ['required', 'string', 'in:warm,neutral,cool,custom'],
            ],
            'fan' => [
                'power' => ['required', 'boolean'],
                'speed' => ['required', 'integer', 'min:0', 'max:100'],
            ],
            default => throw ValidationException::withMessages([
                'type' => ['Unsupported device type.'],
            ]),
        };

        return Validator::validate($state, $rules);
    }
}
