<?php

declare(strict_types=1);

namespace App\Modules\Payment\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Payment\Models\Payment;

/**
 * Class RefundDTO
 *
 * @package App\Modules\Payment\DTOs
 */
class RefundDTO extends AbstractDTO
{
    public function __construct(
        public readonly Payment $payment,
        public readonly float $amount,
        public readonly ?string $reason = null,
        public readonly ?string $processedBy = null,
        public readonly ?string $idempotencyKey = null
    ) {
    }
}
