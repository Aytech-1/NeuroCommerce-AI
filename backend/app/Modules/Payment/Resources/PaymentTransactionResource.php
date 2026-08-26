<?php

declare(strict_types=1);

namespace App\Modules\Payment\Resources;

use App\Modules\Payment\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class PaymentTransactionResource
 *
 * @package App\Modules\Payment\Resources
 * @mixin PaymentTransaction
 */
class PaymentTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type?->value ?? (string) $this->type,
            'amount' => (float) $this->amount,
            'currency_code' => $this->currency_code,
            'gateway_transaction_id' => $this->gateway_transaction_id,
            'status' => $this->status?->value ?? (string) $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
