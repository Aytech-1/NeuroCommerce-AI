<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Providers;

use App\Modules\Coupon\Contracts\CouponRepositoryInterface;
use App\Modules\Coupon\Contracts\CouponUsageRepositoryInterface;
use App\Modules\Coupon\Contracts\DiscountRuleRepositoryInterface;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Coupon\Policies\CouponPolicy;
use App\Modules\Coupon\Repositories\EloquentCouponRepository;
use App\Modules\Coupon\Repositories\EloquentCouponUsageRepository;
use App\Modules\Coupon\Repositories\EloquentDiscountRuleRepository;
use App\Modules\Coupon\Services\CouponService;
use App\Modules\Coupon\Services\CouponValidator;
use App\Modules\Coupon\Services\DiscountCalculator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class CouponServiceProvider
 *
 * @package App\Modules\Coupon\Providers
 */
class CouponServiceProvider extends ServiceProvider
{
    /**
     * Register module bindings here.
     */
    public function register(): void
    {
        $this->app->bind(CouponRepositoryInterface::class, EloquentCouponRepository::class);
        $this->app->bind(CouponUsageRepositoryInterface::class, EloquentCouponUsageRepository::class);
        $this->app->bind(DiscountRuleRepositoryInterface::class, EloquentDiscountRuleRepository::class);

        $this->app->singleton(DiscountCalculator::class);
        $this->app->singleton(CouponValidator::class);
        $this->app->singleton(CouponService::class);
    }

    /**
     * Bootstrap module services.
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        $this->mergeConfigFrom(__DIR__ . '/../Config/coupon.php', 'coupon');
        $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');

        Gate::policy(Coupon::class, CouponPolicy::class);
    }
}
