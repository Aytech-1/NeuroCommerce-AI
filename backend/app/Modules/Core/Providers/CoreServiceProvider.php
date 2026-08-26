<?php

declare(strict_types=1);

namespace App\Modules\Core\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Class CoreServiceProvider
 *
 * @package App\Modules\Core\Providers
 */
class CoreServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        // Register bindings here
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/core.php', 'core');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        
        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }
        
        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }
}
