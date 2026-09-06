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
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'order' => $this->whenLoaded('order', function () {
                return $this->order ? [
                    'id' => $this->order->id,
                    'order_number' => $this->order->order_number,
                    'status' => $this->order->status?->value ?? (string) $this->order->status,
                    'total_amount' => (float) $this->order->total_amount,
                    'currency_code' => $this->order->currency_code,
                    'user' => $this->order->user ? [
                        'id' => $this->order->user->id,
                        'name' => $this->order->user->name,
                        'email' => $this->order->user->email,
                    ] : null,
                ] : null;
            }),
            'processor' => $this->whenLoaded('processor', function () {
                return $this->processor ? [
                    'id' => $this->processor->id,
                    'name' => $this->processor->name,
                    'email' => $this->processor->email,
                ] : null;
            }),
        ];
    }
}
