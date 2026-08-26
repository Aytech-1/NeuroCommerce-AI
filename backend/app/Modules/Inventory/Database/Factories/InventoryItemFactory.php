<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Database\Factories;

use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Class InventoryItemFactory
 *
 * @extends Factory<InventoryItem>
 */
class InventoryItemFactory extends Factory
{
    protected $model = InventoryItem::class;

    public function definition(): array
    {
        $onHand = fake()->numberBetween(20, 200);
        $reserved = fake()->numberBetween(0, 10);

        return [
            'product_id' => Product::factory(),
            'variant_id' => null,
            'warehouse_id' => Warehouse::factory(),
            'quantity_on_hand' => $onHand,
            'quantity_reserved' => $reserved,
            'reorder_point' => 15,
            'reorder_quantity' => 50,
        ];
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity_on_hand' => 0,
            'quantity_reserved' => 0,
        ]);
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity_on_hand' => 10,
            'quantity_reserved' => 2,
            'reorder_point' => 15,
        ]);
    }
}
