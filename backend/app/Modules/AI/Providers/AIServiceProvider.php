<?php

declare(strict_types=1);

namespace App\Modules\AI\Providers;

use App\Modules\AI\Contracts\AIProviderInterface;
use App\Modules\AI\Services\FastApiAIProvider;
use App\Modules\AI\Services\MockAIProvider;
use Illuminate\Support\ServiceProvider;

/**
 * Class AIServiceProvider
 *
 * @package App\Modules\AI\Providers
 */
class AIServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AIProviderInterface::class, function ($app) {
            $driver = config('ai.driver', env('AI_PROVIDER_DRIVER', 'mock'));

            if ($driver === 'fastapi') {
                return new FastApiAIProvider(
                    baseUrl: (string) env('AI_FASTAPI_URL', 'http://localhost:8001'),
                    timeoutMs: (int) env('AI_FASTAPI_TIMEOUT_MS', 150)
                );
            }

            return new MockAIProvider();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/ai.php', 'ai');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }
}
