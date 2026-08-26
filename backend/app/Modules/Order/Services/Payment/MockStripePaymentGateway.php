<?php

declare(strict_types=1);

namespace App\Modules\Order\Services\Payment;

use App\Modules\Order\Contracts\PaymentGatewayInterface;
use App\Modules\Order\DTOs\PaymentResultDTO;
use App\Modules\Order\Models\Order;
use Illuminate\Support\Str;

/**
 * Class MockStripePaymentGateway
 *
 * Mock Stripe payment gateway adapter handling real-time token testing and simulator logic.
 *
 * @package App\Modules\Order\Services\Payment
 */
class MockStripePaymentGateway implements PaymentGatewayInterface
{
    public function chargeOrAuthorize(Order $order, ?string $token = null): PaymentResultDTO
    {
        // Simulate card decline if requested with special mock token
        if ($token === 'tok_chargeDeclined' || $token === 'tok_fail') {
            return new PaymentResultDTO(
                isSuccess: false,
                errorMessage: 'Your card was declined. Please use a different payment method.'
            );
        }

        // Default successful payment intent capture
        $transactionId = 'ch_' . Str::random(24);

        return new PaymentResultDTO(
            isSuccess: true,
            transactionId: $transactionId,
            rawResponse: [
                'id' => $transactionId,
                'status' => 'succeeded',
                'amount' => (int) round((float) $order->total_amount * 100),
                'currency' => strtolower($order->currency_code),
            ]
        );
    }

    public function refund(Order $order, float $amount, ?string $reason = null): bool
    {
        return true;
    }
}
