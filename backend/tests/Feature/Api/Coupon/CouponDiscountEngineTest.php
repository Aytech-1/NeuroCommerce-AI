<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Coupon;

use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Coupon\Enums\CouponType;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Coupon\Services\DiscountCalculator;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponDiscountEngineTest extends TestCase
{
    use RefreshDatabase;

    protected DiscountCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->calculator = app(DiscountCalculator::class);
    }

    public function test_percentage_discount_calculates_accurately_with_cap(): void
    {
        $coupon = Coupon::factory()->create([
            'type' => CouponType::PERCENTAGE,
            'value' => 50.0,
            'max_discount_amount' => 30.0, // Cap at $30
        ]);

        $discountMoney = $this->calculator->calculate($coupon, subtotal: 100.0);

        // 50% of $100 is $50, but capped at $30.00
        $this->assertEquals(30.0, $discountMoney->getFormattedAmount());
    }

    public function test_fixed_amount_discount_does_not_exceed_subtotal(): void
    {
        $coupon = Coupon::factory()->create([
            'type' => CouponType::FIXED_AMOUNT,
            'value' => 75.0,
        ]);

        $discountMoney = $this->calculator->calculate($coupon, subtotal: 50.0);

        // $75 discount on $50 subtotal gives $50 (no negative total)
        $this->assertEquals(50.0, $discountMoney->getFormattedAmount());
    }

    public function test_free_shipping_discount_applies_to_shipping_cost(): void
    {
        $coupon = Coupon::factory()->create([
            'type' => CouponType::FREE_SHIPPING,
            'value' => 0.0,
        ]);

        $discountMoney = $this->calculator->calculate(
            coupon: $coupon,
            subtotal: 100.0,
            shippingCost: 18.50
        );

        $this->assertEquals(18.50, $discountMoney->getFormattedAmount());
    }

    public function test_category_restriction_discounts_only_qualifying_items(): void
    {
        $electronics = Category::factory()->create(['name' => 'Electronics']);
        $apparel = Category::factory()->create(['name' => 'Apparel']);

        $laptop = Product::factory()->create([
            'base_price' => 100.0,
            'category_id' => $electronics->id,
            'status' => ProductStatus::ACTIVE,
            'is_active' => true,
        ]);
        $shirt = Product::factory()->create([
            'base_price' => 40.0,
            'category_id' => $apparel->id,
            'status' => ProductStatus::ACTIVE,
            'is_active' => true,
        ]);

        $coupon = Coupon::factory()->create([
            'type' => CouponType::PERCENTAGE,
            'value' => 20.0, // 20%
        ]);
        $coupon->categories()->sync([$electronics->id]);

        $cartItems = [
            ['product_id' => $laptop->id, 'category_id' => $electronics->id, 'unit_price' => 100.0, 'quantity' => 1],
            ['product_id' => $shirt->id, 'category_id' => $apparel->id, 'unit_price' => 40.0, 'quantity' => 1],
        ];

        $discountMoney = $this->calculator->calculate(
            coupon: $coupon,
            subtotal: 140.0,
            cartItems: $cartItems
        );

        // Only $100 laptop qualifies: 20% of $100 = $20.00
        $this->assertEquals(20.0, $discountMoney->getFormattedAmount());
    }
}
