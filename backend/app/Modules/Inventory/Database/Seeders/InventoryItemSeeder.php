<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Database\Seeders;

use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Enums\StockMovementType;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Seeder;

/**
 * Class InventoryItemSeeder
 *
 * @package App\Modules\Inventory\Database\Seeders
 */
class InventoryItemSeeder extends Seeder
{
    public function run(): void
    {
        $warehouse = Warehouse::where('is_default', true)->first() ?? Warehouse::first();
        $products = Product::with('variants')->get();

        if (!$warehouse || $products->isEmpty()) {
            return;
        }

        foreach ($products as $product) {
            if ($product->variants->isNotEmpty()) {
                foreach ($product->variants as $variant) {
                    $item = InventoryItem::firstOrCreate([
                        'product_id' => $product->id,
                        'variant_id' => $variant->id,
                        'warehouse_id' => $warehouse->id,
                    ], [
                        'quantity_on_hand' => 100,
                        'quantity_reserved' => 5,
                        'reorder_point' => 15,
                        'reorder_quantity' => 50,
                    ]);

                    StockMovement::firstOrCreate([
                        'inventory_item_id' => $item->id,
                        'movement_type' => StockMovementType::RECEIPT->value,
                    ], [
                        'quantity' => 100,
                        'notes' => 'Initial stock intake seed',
                    ]);
                }
            } else {
                $item = InventoryItem::firstOrCreate([
                    'product_id' => $product->id,
                    'variant_id' => null,
                    'warehouse_id' => $warehouse->id,
                ], [
                    'quantity_on_hand' => 150,
                    'quantity_reserved' => 10,
                    'reorder_point' => 20,
                    'reorder_quantity' => 50,
                ]);

                StockMovement::firstOrCreate([
                    'inventory_item_id' => $item->id,
                    'movement_type' => StockMovementType::RECEIPT->value,
                ], [
                    'quantity' => 150,
                    'notes' => 'Initial stock intake seed',
                ]);
            }
        }
    }
}
