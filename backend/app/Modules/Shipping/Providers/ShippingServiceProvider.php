<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Providers;

use App\Modules\Shipping\Contracts\CarrierGatewayInterface;
use App\Modules\Shipping\Contracts\ShipmentRepositoryInterface;
use App\Modules\Shipping\Contracts\ShippingRateRepositoryInterface;
use App\Modules\Shipping\Contracts\ShippingZoneRepositoryInterface;
use App\Modules\Shipping\Contracts\ShipTrackingEventRepositoryInterface;
use App\Modules\Shipping\Events\ShipmentStatusUpdated;
use App\Modules\Shipping\Listeners\UpdateOrderOnShipmentStatusListener;
use App\Modules\Shipping\Models\Shipment;
use App\Modules\Shipping\Models\ShipRate;
use App\Modules\Shipping\Models\ShipZone;
use App\Modules\Shipping\Policies\ShipmentPolicy;
use App\Modules\Shipping\Policies\ShippingZonePolicy;
use App\Modules\Shipping\Repositories\EloquentShipmentRepository;
use App\Modules\Shipping\Repositories\EloquentShippingRateRepository;
use App\Modules\Shipping\Repositories\EloquentShippingZoneRepository;
use App\Modules\Shipping\Repositories\EloquentShipTrackingEventRepository;
use App\Modules\Shipping\Services\Gateways\CarrierGatewayManager;
use App\Modules\Shipping\Services\Gateways\MockCarrierGateway;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class ShippingServiceProvider
 *
 * @package App\Modules\Shipping\Providers
 */
class ShippingServiceProvider extends ServiceProvider
{
    /**
     * Register module bindings.
     */
    public function register(): void
    {
        $this->app->bind(ShipmentRepositoryInterface::class, EloquentShipmentRepository::class);
        $this->app->bind(ShippingZoneRepositoryInterface::class, EloquentShippingZoneRepository::class);
        $this->app->bind(ShippingRateRepositoryInterface::class, EloquentShippingRateRepository::class);
        $this->app->bind(ShipTrackingEventRepositoryInterface::class, EloquentShipTrackingEventRepository::class);

        $this->app->singleton(MockCarrierGateway::class);
        $this->app->bind(CarrierGatewayInterface::class, function ($app) {
            return $app->make(CarrierGatewayManager::class)->gateway();
        });
        $this->app->singleton(CarrierGatewayManager::class);
    }

    /**
     * Bootstrap module services.
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        $this->mergeConfigFrom(__DIR__ . '/../Config/shipping.php', 'shipping');
        $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');

        // Policies
        Gate::policy(Shipment::class, ShipmentPolicy::class);
        Gate::policy(ShipZone::class, ShippingZonePolicy::class);
        Gate::policy(ShipRate::class, ShippingZonePolicy::class);

        // Listeners
        Event::listen(ShipmentStatusUpdated::class, UpdateOrderOnShipmentStatusListener::class);
    }
}
