<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Resources;

use App\Modules\Shipping\Models\ShipZone;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ShippingZoneResource
 *
 * @package App\Modules\Shipping\Resources
 * @mixin ShipZone
 */
class ShippingZoneResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_active' => $this->is_active,
            'country_codes' => $this->getCountries(),
            'rates' => ShippingRateResource::collection($this->whenLoaded('rates')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
