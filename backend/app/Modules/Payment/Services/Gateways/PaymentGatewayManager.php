<?php

declare(strict_types=1);

namespace App\Modules\Payment\Services\Gateways;

use App\Core\Exceptions\BusinessRuleException;
use App\Modules\Payment\Contracts\PaymentGatewayInterface;

/**
 * Class PaymentGatewayManager
 *
 * Resolves gateway adapters dynamically by provider key.
 *
 * @package App\Modules\Payment\Services\Gateways
 */
class PaymentGatewayManager
{
    /**
     * @var array<string, PaymentGatewayInterface>
     */
    private array $gateways = [];

    public function __construct()
    {
        $this->registerGateway('mock_stripe', new MockPaymentGateway());
        $this->registerGateway('stripe', new StripePaymentGateway());
    }

    public function registerGateway(string $name, PaymentGatewayInterface $gateway): void
    {
        $this->gateways[strtolower($name)] = $gateway;
    }

    public function gateway(?string $name = null): PaymentGatewayInterface
    {
        $name = $name ? strtolower($name) : (string) config('payment.default', 'mock_stripe');

        if (!isset($this->gateways[$name])) {
            // Fallback for generic 'stripe' requests to mock if in testing
            if ($name === 'stripe' && isset($this->gateways['mock_stripe'])) {
                return $this->gateways['mock_stripe'];
            }

            throw new BusinessRuleException(
                "Unsupported payment gateway: {$name}",
                422,
                'UNSUPPORTED_GATEWAY'
            );
        }

        return $this->gateways[$name];
    }
}
