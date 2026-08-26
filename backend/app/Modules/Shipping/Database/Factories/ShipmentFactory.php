<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Database\Factories;

use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Order\Models\Order;
use App\Modules\Shipping\Enums\ShipmentStatus;
use App\Modules\Shipping\Models\Shipment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class ShipmentFactory
 *
 * @extends Factory<Shipment>
 */
class ShipmentFactory extends Factory
{
    protected $model = Shipment::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'order_id' => Order::factory(),
            'warehouse_id' => Warehouse::factory(),
            'carrier' => 'mock_carrier',
            'service_level' => 'standard',
            'tracking_number' => 'TRK-' . strtoupper(Str::random(10)),
            'tracking_url' => 'https://tracking.neurocommerce.local/TRK-TEST',
            'status' => ShipmentStatus::PENDING,
            'shipped_at' => null,
            'estimated_delivery' => now()->addDays(3)->toDateString(),
            'delivered_at' => null,
            'weight' => 2.5000,
            'cost' => 15.0000,
            'label_url' => 'https://shipping.neurocommerce.local/labels/test.pdf',
        ];
    }
}
