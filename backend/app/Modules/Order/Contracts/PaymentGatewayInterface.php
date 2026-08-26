<?php

declare(strict_types=1);

namespace App\Modules\Order\Contracts;

use App\Modules\Order\DTOs\PaymentResultDTO;
use App\Modules\Order\Models\Order;

/**
 * Interface PaymentGatewayInterface
 *
 * Boundary abstraction for payment processors (Stripe, PayPal, etc.).
 *
 * @package App\Modules\Order\Contracts
 */
interface PaymentGatewayInterface
{
    public function chargeOrAuthorize(Order $order, ?string $token = null): PaymentResultDTO;

    public function refund(Order $order, float $amount, ?string $reason = null): bool;
}
