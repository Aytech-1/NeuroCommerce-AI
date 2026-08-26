<?php

declare(strict_types=1);

namespace App\Modules\Auth\Providers;

use App\Modules\Auth\Contracts\AddressRepositoryInterface;
use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\Contracts\RoleRepositoryInterface;
use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\Contracts\UserRepositoryInterface;
use App\Modules\Auth\Contracts\UserServiceInterface;
use App\Modules\Auth\Events\AccountDeactivated;
use App\Modules\Auth\Events\PasswordReset;
use App\Modules\Auth\Events\UserLoggedIn;
use App\Modules\Auth\Events\UserLoggedOut;
use App\Modules\Auth\Events\UserRegistered;
use App\Modules\Auth\Listeners\CreateCustomerProfile;
use App\Modules\Auth\Listeners\RevokeAllTokens;
use App\Modules\Auth\Listeners\SendPasswordChangedNotification;
use App\Modules\Auth\Listeners\SendWelcomeEmail;
use App\Modules\Auth\Listeners\TrackLoginEvent;
use App\Modules\Auth\Listeners\TrackLogoutEvent;
use App\Modules\Auth\Listeners\UpdateLastLogin;
use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Policies\AddressPolicy;
use App\Modules\Auth\Policies\RolePolicy;
use App\Modules\Auth\Policies\UserPolicy;
use App\Modules\Auth\Repositories\EloquentAddressRepository;
use App\Modules\Auth\Repositories\EloquentRoleRepository;
use App\Modules\Auth\Repositories\EloquentUserRepository;
use App\Modules\Auth\Services\AuthService;
use App\Modules\Auth\Services\RoleService;
use App\Modules\Auth\Services\UserService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class AuthServiceProvider
 *
 * Central service provider for the Auth & Identity bounded context.
 *
 * @package App\Modules\Auth\Providers
 */
class AuthServiceProvider extends ServiceProvider
{
    /**
     * Policy mappings for the module.
     *
     * @var array<class-string, class-string>
     */
    protected array $policies = [
        User::class => UserPolicy::class,
        Address::class => AddressPolicy::class,
        Role::class => RolePolicy::class,
    ];

    /**
     * Event listener mappings for the module.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected array $listen = [
        UserRegistered::class => [
            SendWelcomeEmail::class,
            CreateCustomerProfile::class,
        ],
        UserLoggedIn::class => [
            UpdateLastLogin::class,
            TrackLoginEvent::class,
        ],
        UserLoggedOut::class => [
            TrackLogoutEvent::class,
        ],
        PasswordReset::class => [
            SendPasswordChangedNotification::class,
            RevokeAllTokens::class,
        ],
        AccountDeactivated::class => [
            RevokeAllTokens::class,
        ],
    ];

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        // Repository Bindings
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, EloquentRoleRepository::class);
        $this->app->bind(AddressRepositoryInterface::class, EloquentAddressRepository::class);

        // Service Bindings
        $this->app->bind(AuthServiceInterface::class, AuthService::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
        $this->app->bind(RoleServiceInterface::class, RoleService::class);
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/auth.php', 'auth');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        $this->registerPolicies();
        $this->registerSuperAdminBypass();
        $this->registerEventListeners();

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }

    /**
     * Register authorization policies.
     *
     * @return void
     */
    protected function registerPolicies(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }

    /**
     * Register Super Admin bypass rule.
     *
     * @return void
     */
    protected function registerSuperAdminBypass(): void
    {
        Gate::before(function ($user, string $ability) {
            if ($user instanceof User && $user->isSuperAdmin()) {
                return true;
            }

            return null;
        });
    }

    /**
     * Register event listeners.
     *
     * @return void
     */
    protected function registerEventListeners(): void
    {
        foreach ($this->listen as $event => $listeners) {
            foreach ($listeners as $listener) {
                Event::listen($event, $listener);
            }
        }
    }
}
