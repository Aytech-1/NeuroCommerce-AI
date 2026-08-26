<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class InventoryItemResource
 *
 * @package App\Modules\Inventory\Resources
 */
class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
                'slug' => $this->product->slug ?? null,
            ]),
            'variant_id' => $this->variant_id,
            'variant' => $this->whenLoaded('variant', fn () => $this->variant ? [
                'id' => $this->variant->id,
                'name' => $this->variant->name,
                'sku' => $this->variant->sku,
            ] : null),
            'warehouse_id' => $this->warehouse_id,
            'warehouse' => new WarehouseResource($this->whenLoaded('warehouse')),
            'quantity_on_hand' => (int) $this->quantity_on_hand,
            'quantity_reserved' => (int) $this->quantity_reserved,
            'quantity_available' => (int) $this->quantity_available,
            'reorder_point' => (int) $this->reorder_point,
            'reorder_quantity' => (int) $this->reorder_quantity,
            'is_low_stock' => (bool) $this->isLowStock(),
            'is_out_of_stock' => (bool) $this->isOutOfStock(),
            'movements' => StockMovementResource::collection($this->whenLoaded('stockMovements')),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
