<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\Admin\Database\Seeders\AdminDatabaseSeeder;
use App\Modules\Auth\Database\Seeders\AuthDatabaseSeeder;
use App\Modules\Cart\Database\Seeders\CartDatabaseSeeder;
use App\Modules\Catalog\Database\Seeders\CatalogDatabaseSeeder;
use App\Modules\CMS\Database\Seeders\CMSDatabaseSeeder;
use App\Modules\Coupon\Database\Seeders\CouponDatabaseSeeder;
use App\Modules\Inventory\Database\Seeders\InventoryDatabaseSeeder;
use App\Modules\Notification\Database\Seeders\NotificationDatabaseSeeder;
use App\Modules\Order\Database\Seeders\OrderDatabaseSeeder;
use App\Modules\Payment\Database\Seeders\PaymentDatabaseSeeder;
use App\Modules\Review\Database\Seeders\ReviewDatabaseSeeder;
use App\Modules\Shipping\Database\Seeders\ShippingDatabaseSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AuthDatabaseSeeder::class,
            CatalogDatabaseSeeder::class,
            InventoryDatabaseSeeder::class,
            CartDatabaseSeeder::class,
            OrderDatabaseSeeder::class,
            PaymentDatabaseSeeder::class,
            ShippingDatabaseSeeder::class,
            CouponDatabaseSeeder::class,
            ReviewDatabaseSeeder::class,
            CMSDatabaseSeeder::class,
            NotificationDatabaseSeeder::class,
            AdminDatabaseSeeder::class,
        ]);
    }
}
