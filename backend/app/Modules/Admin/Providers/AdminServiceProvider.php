<?php

declare(strict_types=1);

namespace App\Modules\Admin\Providers;

use App\Modules\Admin\Contracts\AnalyticsRepositoryInterface;
use App\Modules\Admin\Contracts\ReportRepositoryInterface;
use App\Modules\Admin\Models\AnalyticsDailySales;
use App\Modules\Admin\Policies\AnalyticsPolicy;
use App\Modules\Admin\Policies\ReportPolicy;
use App\Modules\Admin\Repositories\EloquentAnalyticsRepository;
use App\Modules\Admin\Repositories\EloquentReportRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class AdminServiceProvider
 *
 * @package App\Modules\Admin\Providers
 */
class AdminServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AnalyticsRepositoryInterface::class, EloquentAnalyticsRepository::class);
        $this->app->bind(ReportRepositoryInterface::class, EloquentReportRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/admin.php', 'admin');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }

        // Register Policies
        Gate::policy(AnalyticsDailySales::class, AnalyticsPolicy::class);
    }
}
