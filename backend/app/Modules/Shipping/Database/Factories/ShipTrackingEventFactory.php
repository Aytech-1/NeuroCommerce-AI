<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Database\Factories;

use App\Modules\Shipping\Models\Shipment;
use App\Modules\Shipping\Models\ShipTrackingEvent;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class ShipTrackingEventFactory
 *
 * @extends Factory<ShipTrackingEvent>
 */
class ShipTrackingEventFactory extends Factory
{
    protected $model = ShipTrackingEvent::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'shipment_id' => Shipment::factory(),
            'status' => 'label_created',
            'location' => $this->faker->city . ', ' . $this->faker->stateAbbr,
            'description' => 'Shipping label created',
            'occurred_at' => now(),
        ];
    }
}
