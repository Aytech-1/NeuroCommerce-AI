<?php

declare(strict_types=1);

namespace App\Modules\Payment\Resources;

use App\Modules\Payment\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class PaymentResource
 *
 * @package App\Modules\Payment\Resources
 * @mixin Payment
 */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'gateway' => $this->gateway,
            'gateway_payment_id' => $this->gateway_payment_id,
            'method' => $this->method,
            'status' => $this->status?->value ?? (string) $this->status,
            'amount' => (float) $this->amount,
            'currency_code' => $this->currency_code,
            'card_last_four' => $this->card_last_four,
            'card_brand' => $this->card_brand,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'failed_at' => $this->failed_at?->toIso8601String(),
            'failure_reason' => $this->failure_reason,
            'transactions' => PaymentTransactionResource::collection($this->whenLoaded('transactions')),
            'refunds' => RefundResource::collection($this->whenLoaded('refunds')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
