<?php

declare(strict_types=1);

namespace App\Modules\CMS\Providers;

use App\Modules\CMS\Contracts\BannerRepositoryInterface;
use App\Modules\CMS\Contracts\BlogPostRepositoryInterface;
use App\Modules\CMS\Contracts\FaqRepositoryInterface;
use App\Modules\CMS\Contracts\MediaFileRepositoryInterface;
use App\Modules\CMS\Contracts\PageRepositoryInterface;
use App\Modules\CMS\Contracts\TestimonialRepositoryInterface;
use App\Modules\CMS\Models\Banner;
use App\Modules\CMS\Models\BlogPost;
use App\Modules\CMS\Models\Faq;
use App\Modules\CMS\Models\MediaFile;
use App\Modules\CMS\Models\Page;
use App\Modules\CMS\Models\Testimonial;
use App\Modules\CMS\Policies\BannerPolicy;
use App\Modules\CMS\Policies\FaqPolicy;
use App\Modules\CMS\Policies\MediaPolicy;
use App\Modules\CMS\Policies\PagePolicy;
use App\Modules\CMS\Policies\TestimonialPolicy;
use App\Modules\CMS\Repositories\EloquentBannerRepository;
use App\Modules\CMS\Repositories\EloquentBlogPostRepository;
use App\Modules\CMS\Repositories\EloquentFaqRepository;
use App\Modules\CMS\Repositories\EloquentMediaFileRepository;
use App\Modules\CMS\Repositories\EloquentPageRepository;
use App\Modules\CMS\Repositories\EloquentTestimonialRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class CMSServiceProvider
 *
 * @package App\Modules\CMS\Providers
 */
class CMSServiceProvider extends ServiceProvider
{
    /**
     * All of the container bindings that should be registered.
     *
     * @var array<string, string>
     */
    public array $bindings = [
        PageRepositoryInterface::class => EloquentPageRepository::class,
        BlogPostRepositoryInterface::class => EloquentBlogPostRepository::class,
        MediaFileRepositoryInterface::class => EloquentMediaFileRepository::class,
        BannerRepositoryInterface::class => EloquentBannerRepository::class,
        FaqRepositoryInterface::class => EloquentFaqRepository::class,
        TestimonialRepositoryInterface::class => EloquentTestimonialRepository::class,
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
        $this->mergeConfigFrom(__DIR__ . '/../Config/cms.php', 'cms');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        $this->registerPolicies();

        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }

        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }

    /**
     * Register module authorization policies.
     */
    protected function registerPolicies(): void
    {
        Gate::policy(Page::class, PagePolicy::class);
        Gate::policy(Banner::class, BannerPolicy::class);
        Gate::policy(Faq::class, FaqPolicy::class);
        Gate::policy(Testimonial::class, TestimonialPolicy::class);
        Gate::policy(MediaFile::class, MediaPolicy::class);
    }
}
