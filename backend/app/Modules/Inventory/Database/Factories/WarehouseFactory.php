<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Database\Factories;

use App\Modules\Auth\Models\Address;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Class WarehouseFactory
 *
 * @extends Factory<Warehouse>
 */
class WarehouseFactory extends Factory
{
    protected $model = Warehouse::class;

    public function definition(): array
    {
        $name = fake()->city() . ' Fulfillment Center';
        $code = strtoupper(fake()->lexify('WH-???'));

        return [
            'name' => $name,
            'code' => $code,
            'address_id' => Address::factory(),
            'is_active' => true,
            'is_default' => false,
            'priority' => fake()->numberBetween(1, 10),
        ];
    }

    public function defaultWarehouse(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
            'priority' => 0,
        ]);
    }
}
