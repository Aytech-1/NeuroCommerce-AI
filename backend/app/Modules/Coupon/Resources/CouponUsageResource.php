<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Resources;

use App\Modules\Coupon\Models\CouponUsage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class CouponUsageResource
 *
 * @package App\Modules\Coupon\Resources
 * @mixin CouponUsage
 */
class CouponUsageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'coupon_id' => $this->coupon_id,
            'user_id' => $this->user_id,
            'user_email' => $this->user?->email,
            'user_name' => $this->user?->name,
            'order_id' => $this->order_id,
            'order_number' => $this->order?->order_number,
            'discount_amount' => (float) $this->discount_amount,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
