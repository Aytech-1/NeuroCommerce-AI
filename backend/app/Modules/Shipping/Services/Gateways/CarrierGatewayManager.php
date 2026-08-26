<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Services\Gateways;

use App\Modules\Shipping\Contracts\CarrierGatewayInterface;
use Illuminate\Contracts\Foundation\Application;

/**
 * Class CarrierGatewayManager
 *
 * @package App\Modules\Shipping\Services\Gateways
 */
class CarrierGatewayManager
{
    /** @var array<string, CarrierGatewayInterface> */
    private array $gateways = [];

    public function __construct(
        private readonly Application $app
    ) {
    }

    public function gateway(?string $name = null): CarrierGatewayInterface
    {
        $carrier = $name ? strtolower($name) : config('shipping.default_carrier', 'mock_carrier');

        if (isset($this->gateways[$carrier])) {
            return $this->gateways[$carrier];
        }

        $gateway = match ($carrier) {
            'mock_carrier', 'mock', 'ups', 'fedex', 'dhl', 'usps' => $this->app->make(MockCarrierGateway::class),
            default => $this->app->make(MockCarrierGateway::class),
        };

        $this->gateways[$carrier] = $gateway;

        return $gateway;
    }
}
