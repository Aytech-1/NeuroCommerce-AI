<?php

declare(strict_types=1);

/**
 * NeuroCommerce AI — Module Registry Configuration
 *
 * Defines all bounded context modules and their service providers.
 * This is the central registry for the modular monolith architecture.
 *
 * @package NeuroCommerce\Config
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Registered Modules
    |--------------------------------------------------------------------------
    |
    | Each module represents a bounded context in the DDD architecture.
    | Modules are loaded in the order defined here.
    |
    */
    'modules' => [
        'core' => [
            'name' => 'Core',
            'enabled' => true,
            'provider' => App\Modules\Core\Providers\CoreServiceProvider::class,
            'description' => 'Core system functionality and shared services',
        ],
        'auth' => [
            'name' => 'Auth',
            'enabled' => true,
            'provider' => App\Modules\Auth\Providers\AuthServiceProvider::class,
            'description' => 'Authentication, authorization, and user management',
        ],
        'catalog' => [
            'name' => 'Catalog',
            'enabled' => true,
            'provider' => App\Modules\Catalog\Providers\CatalogServiceProvider::class,
            'description' => 'Product catalog, categories, and attributes',
        ],
        'inventory' => [
            'name' => 'Inventory',
            'enabled' => true,
            'provider' => App\Modules\Inventory\Providers\InventoryServiceProvider::class,
            'description' => 'Stock management and warehouse operations',
        ],
        'cart' => [
            'name' => 'Cart',
            'enabled' => true,
            'provider' => App\Modules\Cart\Providers\CartServiceProvider::class,
            'description' => 'Shopping cart and wishlist management',
        ],
        'order' => [
            'name' => 'Order',
            'enabled' => true,
            'provider' => App\Modules\Order\Providers\OrderServiceProvider::class,
            'description' => 'Order processing and lifecycle management',
        ],
        'payment' => [
            'name' => 'Payment',
            'enabled' => true,
            'provider' => App\Modules\Payment\Providers\PaymentServiceProvider::class,
            'description' => 'Payment processing and transaction management',
        ],
        'shipping' => [
            'name' => 'Shipping',
            'enabled' => true,
            'provider' => App\Modules\Shipping\Providers\ShippingServiceProvider::class,
            'description' => 'Shipping zones, methods, and tracking',
        ],
        'coupon' => [
            'name' => 'Coupon',
            'enabled' => true,
            'provider' => App\Modules\Coupon\Providers\CouponServiceProvider::class,
            'description' => 'Coupon and promotional discount management',
        ],
        'review' => [
            'name' => 'Review',
            'enabled' => true,
            'provider' => App\Modules\Review\Providers\ReviewServiceProvider::class,
            'description' => 'Product reviews and ratings',
        ],
        'cms' => [
            'name' => 'CMS',
            'enabled' => true,
            'provider' => App\Modules\CMS\Providers\CMSServiceProvider::class,
            'description' => 'Content management, pages, banners, and SEO',
        ],
        'ai' => [
            'name' => 'AI',
            'enabled' => true,
            'provider' => App\Modules\AI\Providers\AIServiceProvider::class,
            'description' => 'AI-powered recommendations and behavior tracking',
        ],
        'notification' => [
            'name' => 'Notification',
            'enabled' => true,
            'provider' => App\Modules\Notification\Providers\NotificationServiceProvider::class,
            'description' => 'Email, SMS, and push notification services',
        ],
        'admin' => [
            'name' => 'Admin',
            'enabled' => true,
            'provider' => App\Modules\Admin\Providers\AdminServiceProvider::class,
            'description' => 'Admin dashboard, settings, and audit logging',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Auto-Discovery
    |--------------------------------------------------------------------------
    */
    'auto_discover' => false,
    'path' => app_path('Modules'),
];
