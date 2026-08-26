<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Database\Seeders;

use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Coupon\Enums\CouponType;
use App\Modules\Coupon\Models\Coupon;
use Illuminate\Database\Seeder;

/**
 * Class CouponDatabaseSeeder
 *
 * @package App\Modules\Coupon\Database\Seeders
 */
class CouponDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Universal Percentage Coupon (WELCOME10)
        Coupon::firstOrCreate(
            ['code' => 'WELCOME10'],
            [
                'name' => 'Welcome 10% Discount',
                'description' => '10% off entire order for new customers',
                'type' => CouponType::PERCENTAGE,
                'value' => 10.0000,
                'min_order_amount' => 20.0000,
                'max_discount_amount' => 50.0000,
                'usage_limit' => 10000,
                'usage_limit_per_user' => 1,
                'times_used' => 0,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addYear(),
                'is_active' => true,
            ]
        );

        // 2. Fixed Amount Coupon (SAVE25)
        Coupon::firstOrCreate(
            ['code' => 'SAVE25'],
            [
                'name' => '$25 Off Over $100',
                'description' => '$25 instant discount on orders of $100 or more',
                'type' => CouponType::FIXED_AMOUNT,
                'value' => 25.0000,
                'min_order_amount' => 100.0000,
                'max_discount_amount' => 25.0000,
                'usage_limit' => 500,
                'usage_limit_per_user' => 2,
                'times_used' => 0,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(6),
                'is_active' => true,
            ]
        );

        // 3. Free Shipping Coupon (FREESHIP)
        Coupon::firstOrCreate(
            ['code' => 'FREESHIP'],
            [
                'name' => 'Free Standard Shipping',
                'description' => 'Free standard delivery on orders above $50',
                'type' => CouponType::FREE_SHIPPING,
                'value' => 0.0000,
                'min_order_amount' => 50.0000,
                'max_discount_amount' => null,
                'usage_limit' => 2000,
                'usage_limit_per_user' => 3,
                'times_used' => 0,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(6),
                'is_active' => true,
            ]
        );

        // 4. Buy X Get Y Coupon (BOGO50)
        Coupon::firstOrCreate(
            ['code' => 'BOGO50'],
            [
                'name' => 'Buy One Get Second Discounted',
                'description' => 'Buy one item get lowest priced item discounted',
                'type' => CouponType::BUY_X_GET_Y,
                'value' => 1.0000,
                'min_order_amount' => 0.0000,
                'max_discount_amount' => 100.0000,
                'usage_limit' => 1000,
                'usage_limit_per_user' => 1,
                'times_used' => 0,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(3),
                'is_active' => true,
            ]
        );

        // 5. Category Restricted Coupon (TECH20)
        $techCoupon = Coupon::firstOrCreate(
            ['code' => 'TECH20'],
            [
                'name' => '20% Off Electronics Category',
                'description' => '20% discount on electronics and tech products',
                'type' => CouponType::PERCENTAGE,
                'value' => 20.0000,
                'min_order_amount' => 30.0000,
                'max_discount_amount' => 150.0000,
                'usage_limit' => 300,
                'usage_limit_per_user' => 1,
                'times_used' => 0,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(3),
                'is_active' => true,
            ]
        );

        $firstCategory = Category::first();
        if ($firstCategory) {
            $techCoupon->categories()->syncWithoutDetaching([$firstCategory->id]);
        }
    }
}
