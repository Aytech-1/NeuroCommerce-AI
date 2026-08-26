<?php

declare(strict_types=1);

namespace App\Modules\Cart\Providers;

use App\Modules\Cart\Contracts\CartRepositoryInterface;
use App\Modules\Cart\Contracts\WishlistRepositoryInterface;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\Wishlist;
use App\Modules\Cart\Policies\CartPolicy;
use App\Modules\Cart\Policies\WishlistPolicy;
use App\Modules\Cart\Repositories\EloquentCartRepository;
use App\Modules\Cart\Repositories\EloquentWishlistRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class CartServiceProvider
 *
 * @package App\Modules\Cart\Providers
 */
class CartServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(CartRepositoryInterface::class, EloquentCartRepository::class);
        $this->app->bind(WishlistRepositoryInterface::class, EloquentWishlistRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/cart.php', 'cart');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        Gate::policy(Cart::class, CartPolicy::class);
        Gate::policy(Wishlist::class, WishlistPolicy::class);

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }
}
