<?php

declare(strict_types=1);

namespace App\Modules\Review\Providers;

use App\Modules\Review\Contracts\ReviewRepositoryInterface;
use App\Modules\Review\Contracts\ReviewVoteRepositoryInterface;
use App\Modules\Review\Events\ReviewApproved;
use App\Modules\Review\Events\ReviewDeleted;
use App\Modules\Review\Events\ReviewRejected;
use App\Modules\Review\Events\ReviewUpdated;
use App\Modules\Review\Listeners\UpdateProductRatingListener;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Policies\ReviewPolicy;
use App\Modules\Review\Repositories\EloquentReviewRepository;
use App\Modules\Review\Repositories\EloquentReviewVoteRepository;
use App\Modules\Review\Services\ReviewService;
use App\Modules\Review\Services\VerifiedPurchaseService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class ReviewServiceProvider
 *
 * @package App\Modules\Review\Providers
 */
class ReviewServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ReviewRepositoryInterface::class, EloquentReviewRepository::class);
        $this->app->bind(ReviewVoteRepositoryInterface::class, EloquentReviewVoteRepository::class);

        $this->app->singleton(VerifiedPurchaseService::class);
        $this->app->singleton(ReviewService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/review.php', 'review');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }

        Gate::policy(Review::class, ReviewPolicy::class);

        Event::listen(ReviewApproved::class, UpdateProductRatingListener::class);
        Event::listen(ReviewRejected::class, UpdateProductRatingListener::class);
        Event::listen(ReviewDeleted::class, UpdateProductRatingListener::class);
        Event::listen(ReviewUpdated::class, UpdateProductRatingListener::class);
    }
}
