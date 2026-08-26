<?php

declare(strict_types=1);

namespace App\Modules\Order\Providers;

use App\Modules\Order\Contracts\InvoiceRepositoryInterface;
use App\Modules\Order\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Contracts\PaymentGatewayInterface;
use App\Modules\Order\Middleware\IdempotentCheckoutMiddleware;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Policies\OrderPolicy;
use App\Modules\Order\Repositories\EloquentInvoiceRepository;
use App\Modules\Order\Repositories\EloquentOrderRepository;
use App\Modules\Order\Services\Payment\MockStripePaymentGateway;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

/**
 * Class OrderServiceProvider
 *
 * @package App\Modules\Order\Providers
 */
class OrderServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(OrderRepositoryInterface::class, EloquentOrderRepository::class);
        $this->app->bind(InvoiceRepositoryInterface::class, EloquentInvoiceRepository::class);
        $this->app->bind(PaymentGatewayInterface::class, MockStripePaymentGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/order.php', 'order');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        Route::aliasMiddleware('idempotent.checkout', IdempotentCheckoutMiddleware::class);

        Gate::policy(Order::class, OrderPolicy::class);

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }
}
