<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Resources;

use App\Modules\Shipping\Models\ShipTrackingEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ShipTrackingEventResource
 *
 * @package App\Modules\Shipping\Resources
 * @mixin ShipTrackingEvent
 */
class ShipTrackingEventResource extends JsonResource
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
            'shipment_id' => $this->shipment_id,
            'status' => $this->status,
            'location' => $this->location,
            'description' => $this->description,
            'occurred_at' => $this->occurred_at->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
