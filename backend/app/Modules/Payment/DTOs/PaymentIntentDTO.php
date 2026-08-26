<?php

declare(strict_types=1);

namespace App\Modules\Payment\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Order\Models\Order;

/**
 * Class PaymentIntentDTO
 *
 * @package App\Modules\Payment\DTOs
 */
class PaymentIntentDTO extends AbstractDTO
{
    public function __construct(
        public readonly Order $order,
        public readonly float $amount,
        public readonly string $currency,
        public readonly string $paymentMethod,
        public readonly ?string $paymentToken = null,
        public readonly ?string $idempotencyKey = null,
        public readonly array $metadata = []
    ) {
    }
}
