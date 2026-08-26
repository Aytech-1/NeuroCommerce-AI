<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Providers;

use App\Modules\Catalog\Contracts\AttributeRepositoryInterface;
use App\Modules\Catalog\Contracts\BrandRepositoryInterface;
use App\Modules\Catalog\Contracts\CategoryRepositoryInterface;
use App\Modules\Catalog\Contracts\ProductRepositoryInterface;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductAttribute;
use App\Modules\Catalog\Policies\BrandPolicy;
use App\Modules\Catalog\Policies\CategoryPolicy;
use App\Modules\Catalog\Policies\ProductAttributePolicy;
use App\Modules\Catalog\Policies\ProductPolicy;
use App\Modules\Catalog\Repositories\EloquentAttributeRepository;
use App\Modules\Catalog\Repositories\EloquentBrandRepository;
use App\Modules\Catalog\Repositories\EloquentCategoryRepository;
use App\Modules\Catalog\Repositories\EloquentProductRepository;
use App\Modules\Catalog\Services\AttributeService;
use App\Modules\Catalog\Services\BrandService;
use App\Modules\Catalog\Services\CategoryService;
use App\Modules\Catalog\Services\ProductService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Class CatalogServiceProvider
 *
 * @package App\Modules\Catalog\Providers
 */
class CatalogServiceProvider extends ServiceProvider
{
    /**
     * Policy mappings for the Catalog module.
     *
     * @var array<class-string, class-string>
     */
    protected array $policies = [
        Product::class => ProductPolicy::class,
        Category::class => CategoryPolicy::class,
        Brand::class => BrandPolicy::class,
        ProductAttribute::class => \App\Modules\Catalog\Policies\AttributePolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Repository Bindings
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(CategoryRepositoryInterface::class, EloquentCategoryRepository::class);
        $this->app->bind(BrandRepositoryInterface::class, EloquentBrandRepository::class);
        $this->app->bind(AttributeRepositoryInterface::class, EloquentAttributeRepository::class);

        // Service Bindings
        $this->app->singleton(ProductService::class);
        $this->app->singleton(CategoryService::class);
        $this->app->singleton(BrandService::class);
        $this->app->singleton(AttributeService::class);
        $this->app->bind(\App\Modules\Catalog\Contracts\SearchProviderInterface::class, \App\Modules\Catalog\Services\DatabaseSearchProvider::class);
        $this->app->singleton(\App\Modules\Catalog\Services\SearchService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../Config/catalog.php', 'catalog');
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        
        // Register Policies
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        // Load Routes
        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
        }
        
        if (file_exists(__DIR__ . '/../Routes/admin.php')) {
            $this->loadRoutesFrom(__DIR__ . '/../Routes/admin.php');
        }
    }
}
