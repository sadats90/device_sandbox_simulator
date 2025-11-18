<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Preset;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $light = Device::updateOrCreate(
            ['name' => 'Light'],
            [
                'type' => 'light',
                'state' => [
                    'power' => false,
                    'brightness' => 70,
                    'colorTemperature' => 'warm',
                ],
            ]
        );

        $fan = Device::updateOrCreate(
            ['name' => 'Fan'],
            [
                'type' => 'fan',
                'state' => [
                    'power' => false,
                    'speed' => 60,
                ],
            ]
        );

        $this->seedPreset($light, 'Dim Light', [
            'power' => true,
            'brightness' => 30,
            'colorTemperature' => 'neutral',
        ]);

        $this->seedPreset($light, 'Bright & Warm', [
            'power' => true,
            'brightness' => 90,
            'colorTemperature' => 'warm',
        ]);

        $this->seedPreset($fan, 'Night Breeze', [
            'power' => true,
            'speed' => 35,
        ]);
    }

    protected function seedPreset(Device $device, string $name, array $state): Preset
    {
        return Preset::updateOrCreate(
            [
                'device_id' => $device->id,
                'name' => $name,
            ],
            [
                'state' => $state,
            ]
        );
    }
}
