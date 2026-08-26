<?php

declare(strict_types=1);

return [
    App\Providers\AppServiceProvider::class,

    // ─────────────────────────────────────────────────────
    // NeuroCommerce AI — Module Service Providers
    // ─────────────────────────────────────────────────────
    App\Modules\Core\Providers\CoreServiceProvider::class,
    App\Modules\Auth\Providers\AuthServiceProvider::class,
    App\Modules\Catalog\Providers\CatalogServiceProvider::class,
    App\Modules\Inventory\Providers\InventoryServiceProvider::class,
    App\Modules\Cart\Providers\CartServiceProvider::class,
    App\Modules\Order\Providers\OrderServiceProvider::class,
    App\Modules\Payment\Providers\PaymentServiceProvider::class,
    App\Modules\Shipping\Providers\ShippingServiceProvider::class,
    App\Modules\Coupon\Providers\CouponServiceProvider::class,
    App\Modules\Review\Providers\ReviewServiceProvider::class,
    App\Modules\CMS\Providers\CMSServiceProvider::class,
    App\Modules\AI\Providers\AIServiceProvider::class,
    App\Modules\Notification\Providers\NotificationServiceProvider::class,
    App\Modules\Admin\Providers\AdminServiceProvider::class,
];
