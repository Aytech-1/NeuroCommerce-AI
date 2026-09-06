<?php

declare(strict_types=1);

namespace App\Modules\Cart\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * CartResource
 */
class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $subtotal = (float) $this->calculateSubtotal()->getFormattedAmount();
        $couponCode = null;
        if ($this->notes && str_starts_with($this->notes, 'Coupon: ')) {
            $couponCode = trim(str_replace('Coupon: ', '', $this->notes));
        }

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'session_id' => $this->session_id,
            'is_guest' => $this->isGuest(),
            'currency_code' => $this->currency_code,
            'notes' => $this->notes,
            'item_count' => $this->item_count,
            'items_count' => $this->item_count,
            'subtotal' => $subtotal,
            'discount_total' => 0.0,
            'tax_total' => 0.0,
            'shipping_total' => 0.0,
            'grand_total' => $subtotal,
            'coupon_code' => $couponCode,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
