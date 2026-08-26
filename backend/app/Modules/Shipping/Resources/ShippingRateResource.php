<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Resources;

use App\Modules\Shipping\Models\ShipRate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ShippingRateResource
 *
 * @package App\Modules\Shipping\Resources
 * @mixin ShipRate
 */
class ShippingRateResource extends JsonResource
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
            'zone_id' => $this->zone_id,
            'zone_name' => $this->zone?->name,
            'carrier' => $this->carrier,
            'service_level' => $this->service_level,
            'min_weight' => $this->min_weight,
            'max_weight' => $this->max_weight,
            'min_order_amount' => $this->min_order_amount,
            'rate' => $this->rate,
            'currency_code' => $this->currency_code,
            'estimated_days_min' => $this->estimated_days_min,
            'estimated_days_max' => $this->estimated_days_max,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
