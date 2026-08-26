<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Resources;

use App\Modules\Auth\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class StockMovementResource
 *
 * @package App\Modules\Inventory\Resources
 */
class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inventory_item_id' => $this->inventory_item_id,
            'movement_type' => $this->movement_type instanceof \BackedEnum ? $this->movement_type->value : (string) $this->movement_type,
            'movement_type_label' => method_exists($this->movement_type, 'label') ? $this->movement_type->label() : ucfirst((string) $this->movement_type),
            'quantity' => (int) $this->quantity,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'notes' => $this->notes,
            'performed_by' => $this->performed_by,
            'performer' => new UserResource($this->whenLoaded('performer')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
