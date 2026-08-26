<?php

declare(strict_types=1);

namespace App\Modules\Payment\Providers;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Contracts\PaymentRepositoryInterface;
use App\Modules\Payment\Contracts\PaymentTransactionRepositoryInterface;
use App\Modules\Payment\Contracts\RefundRepositoryInterface;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\Refund;
use App\Modules\Payment\Policies\PaymentPolicy;
use App\Modules\Payment\Policies\RefundPolicy;
use App\Modules\Payment\Repositories\EloquentPaymentRepository;
use App\Modules\Payment\Repositories\EloquentPaymentTransactionRepository;
use App\Modules\Payment\Repositories\EloquentRefundRepository;
use App\Modules\Payment\Services\Gateways\PaymentGatewayManager;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class PaymentServiceProvider
 *
 * @package App\Modules\Payment\Providers
 */
class PaymentServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PaymentRepositoryInterface::class, EloquentPaymentRepository::class);
        $this->app->singleton(PaymentTransactionRepositoryInterface::class, EloquentPaymentTransactionRepository::class);
        $this->app->singleton(RefundRepositoryInterface::class, EloquentRefundRepository::class);
        $this->app->singleton(PaymentGatewayManager::class);

        $this->app->bind(PaymentGatewayInterface::class, function ($app) {
            return $app->make(PaymentGatewayManager::class)->gateway();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/payment.php', 'payment');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(Refund::class, RefundPolicy::class);

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }
}
