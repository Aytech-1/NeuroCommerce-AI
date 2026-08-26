<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Resources;

use App\Modules\Shipping\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ShipmentResource
 *
 * @package App\Modules\Shipping\Resources
 * @mixin Shipment
 */
class ShipmentResource extends JsonResource
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
            'order_id' => $this->order_id,
            'order_number' => $this->order?->order_number,
            'warehouse_id' => $this->warehouse_id,
            'warehouse_name' => $this->warehouse?->name,
            'carrier' => $this->carrier,
            'service_level' => $this->service_level,
            'tracking_number' => $this->tracking_number,
            'tracking_url' => $this->tracking_url,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'estimated_delivery' => $this->estimated_delivery?->toDateString(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'weight' => $this->weight,
            'cost' => $this->cost,
            'label_url' => $this->label_url,
            'tracking_events' => ShipTrackingEventResource::collection($this->whenLoaded('trackingEvents')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
