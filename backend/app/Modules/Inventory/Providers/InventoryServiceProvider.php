<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Providers;

use App\Modules\Inventory\Contracts\InventoryRepositoryInterface;
use App\Modules\Inventory\Contracts\StockMovementRepositoryInterface;
use App\Modules\Inventory\Contracts\SupplierRepositoryInterface;
use App\Modules\Inventory\Contracts\WarehouseRepositoryInterface;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Policies\InventoryPolicy;
use App\Modules\Inventory\Policies\SupplierPolicy;
use App\Modules\Inventory\Policies\WarehousePolicy;
use App\Modules\Inventory\Repositories\EloquentInventoryRepository;
use App\Modules\Inventory\Repositories\EloquentStockMovementRepository;
use App\Modules\Inventory\Repositories\EloquentSupplierRepository;
use App\Modules\Inventory\Repositories\EloquentWarehouseRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class InventoryServiceProvider
 *
 * @package App\Modules\Inventory\Providers
 */
class InventoryServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(WarehouseRepositoryInterface::class, EloquentWarehouseRepository::class);
        $this->app->bind(InventoryRepositoryInterface::class, EloquentInventoryRepository::class);
        $this->app->bind(StockMovementRepositoryInterface::class, EloquentStockMovementRepository::class);
        $this->app->bind(SupplierRepositoryInterface::class, EloquentSupplierRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/inventory.php', 'inventory');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }

        // Register Policies
        Gate::policy(Warehouse::class, WarehousePolicy::class);
        Gate::policy(Supplier::class, SupplierPolicy::class);
        Gate::policy(InventoryItem::class, InventoryPolicy::class);
    }
}
