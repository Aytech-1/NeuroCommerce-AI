<?php

declare(strict_types=1);

namespace App\Modules\Payment\Resources;

use App\Modules\Payment\Models\Refund;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class RefundResource
 *
 * @package App\Modules\Payment\Resources
 * @mixin Refund
 */
class RefundResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_id' => $this->payment_id,
            'order_id' => $this->order_id,
            'amount' => (float) $this->amount,
            'reason' => $this->reason,
            'status' => $this->status?->value ?? (string) $this->status,
            'gateway_refund_id' => $this->gateway_refund_id,
            'processed_by' => $this->processed_by,
            'processed_at' => $this->processed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
