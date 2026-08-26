<?php

declare(strict_types=1);

namespace App\Modules\Notification\Providers;

use App\Modules\Auth\Events\UserRegistered;
use App\Modules\Notification\Contracts\NotificationPreferenceRepositoryInterface;
use App\Modules\Notification\Contracts\NotificationRepositoryInterface;
use App\Modules\Notification\Contracts\NotificationTemplateRepositoryInterface;
use App\Modules\Notification\Listeners\SendOrderConfirmationNotification;
use App\Modules\Notification\Listeners\SendReviewApprovedNotification;
use App\Modules\Notification\Listeners\SendShippingUpdateNotification;
use App\Modules\Notification\Listeners\SendWelcomeNotification;
use App\Modules\Notification\Models\Notification;
use App\Modules\Notification\Models\NotificationTemplate;
use App\Modules\Notification\Policies\NotificationPolicy;
use App\Modules\Notification\Policies\NotificationTemplatePolicy;
use App\Modules\Notification\Repositories\EloquentNotificationPreferenceRepository;
use App\Modules\Notification\Repositories\EloquentNotificationRepository;
use App\Modules\Notification\Repositories\EloquentNotificationTemplateRepository;
use App\Modules\Order\Events\OrderPlaced;
use App\Modules\Review\Events\ReviewApproved;
use App\Modules\Shipping\Events\ShipmentCreated;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class NotificationServiceProvider
 *
 * @package App\Modules\Notification\Providers
 */
class NotificationServiceProvider extends ServiceProvider
{
    /**
     * Container bindings.
     *
     * @var array<string, string>
     */
    public array $bindings = [
        NotificationRepositoryInterface::class => EloquentNotificationRepository::class,
        NotificationTemplateRepositoryInterface::class => EloquentNotificationTemplateRepository::class,
        NotificationPreferenceRepositoryInterface::class => EloquentNotificationPreferenceRepository::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bindings registered via $bindings property
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/notification.php', 'notification');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        $this->registerPolicies();
        $this->registerListeners();

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }

    protected function registerPolicies(): void
    {
        Gate::policy(Notification::class, NotificationPolicy::class);
        Gate::policy(NotificationTemplate::class, NotificationTemplatePolicy::class);
    }

    protected function registerListeners(): void
    {
        Event::listen(OrderPlaced::class, SendOrderConfirmationNotification::class);
        Event::listen(ShipmentCreated::class, SendShippingUpdateNotification::class);
        Event::listen(UserRegistered::class, SendWelcomeNotification::class);
        Event::listen(ReviewApproved::class, SendReviewApprovedNotification::class);
    }
}
