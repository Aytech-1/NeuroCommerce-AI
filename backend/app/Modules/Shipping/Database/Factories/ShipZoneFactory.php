<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Database\Factories;

use App\Modules\Shipping\Models\ShipZone;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class ShipZoneFactory
 *
 * @extends Factory<ShipZone>
 */
class ShipZoneFactory extends Factory
{
    protected $model = ShipZone::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'name' => $this->faker->country . ' Zone',
            'is_active' => true,
        ];
    }
}
