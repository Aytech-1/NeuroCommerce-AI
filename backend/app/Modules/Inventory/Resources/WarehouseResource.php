<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Resources;

use App\Modules\Auth\Resources\AddressResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class WarehouseResource
 *
 * @package App\Modules\Inventory\Resources
 */
class WarehouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address_id' => $this->address_id,
            'address' => new AddressResource($this->whenLoaded('address')),
            'is_active' => (bool) $this->is_active,
            'is_default' => (bool) $this->is_default,
            'priority' => (int) $this->priority,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
