<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Database\Factories;

use App\Modules\Shipping\Models\ShipRate;
use App\Modules\Shipping\Models\ShipZone;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class ShipRateFactory
 *
 * @extends Factory<ShipRate>
 */
class ShipRateFactory extends Factory
{
    protected $model = ShipRate::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'zone_id' => ShipZone::factory(),
            'carrier' => 'mock_carrier',
            'service_level' => 'Standard Ground',
            'min_weight' => 0.0000,
            'max_weight' => 50.0000,
            'min_order_amount' => 0.0000,
            'rate' => 10.0000,
            'currency_code' => 'USD',
            'estimated_days_min' => 2,
            'estimated_days_max' => 5,
            'is_active' => true,
        ];
    }
}
