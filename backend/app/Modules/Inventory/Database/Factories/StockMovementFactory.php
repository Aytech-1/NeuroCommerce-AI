<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Database\Factories;

use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Enums\StockMovementType;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\StockMovement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Class StockMovementFactory
 *
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    protected $model = StockMovement::class;

    public function definition(): array
    {
        return [
            'inventory_item_id' => InventoryItem::factory(),
            'movement_type' => fake()->randomElement(StockMovementType::cases())->value,
            'quantity' => fake()->numberBetween(-20, 50),
            'reference_type' => 'ManualAdjustment',
            'reference_id' => fake()->uuid(),
            'notes' => fake()->sentence(),
            'performed_by' => User::factory(),
            'created_at' => now(),
        ];
    }
}
