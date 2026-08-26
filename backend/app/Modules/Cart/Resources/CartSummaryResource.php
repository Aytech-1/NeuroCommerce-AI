<?php

declare(strict_types=1);

namespace App\Modules\Cart\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * CartSummaryResource
 */
class CartSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'item_count' => $this->itemCount,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'tax' => $this->tax,
            'shipping' => $this->shipping,
            'total' => $this->total,
            'currency' => $this->currency,
            'coupon_code' => $this->couponCode,
        ];
    }
}
