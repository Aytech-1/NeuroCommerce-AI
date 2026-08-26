<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Services;

use App\Core\ValueObjects\Money;
use App\Modules\Coupon\Enums\CouponType;
use App\Modules\Coupon\Models\Coupon;
use Illuminate\Support\Collection;

/**
 * Class DiscountCalculator
 *
 * Computes discount amounts accurately using immutable Money Value Objects.
 *
 * @package App\Modules\Coupon\Services
 */
class DiscountCalculator
{
    /**
     * Calculate discount amount for a given coupon and cart items / subtotal.
     *
     * @param Coupon $coupon
     * @param float $subtotal
     * @param Collection|array $cartItems
     * @param float $shippingCost
     * @param string $currency
     * @return Money
     */
    public function calculate(
        Coupon $coupon,
        float $subtotal,
        Collection|array $cartItems = [],
        float $shippingCost = 0.0,
        string $currency = 'USD'
    ): Money {
        $subtotalMoney = Money::fromDecimal($subtotal, $currency);

        $eligibleSubtotal = $this->calculateEligibleSubtotal($coupon, $cartItems, $subtotal, $currency);

        $discountMoney = match ($coupon->type) {
            CouponType::PERCENTAGE => $this->calculatePercentage($coupon, $eligibleSubtotal, $currency),
            CouponType::FIXED_AMOUNT => $this->calculateFixedAmount($coupon, $eligibleSubtotal, $currency),
            CouponType::FREE_SHIPPING => Money::fromDecimal(max(0.0, $shippingCost), $currency),
            CouponType::BUY_X_GET_Y => $this->calculateBuyXGetY($coupon, $cartItems, $currency),
        };

        // Enforce maximum discount cap if configured for percentage discounts or overall
        if ($coupon->max_discount_amount !== null && $coupon->max_discount_amount > 0) {
            $capMoney = Money::fromDecimal($coupon->max_discount_amount, $currency);
            if ($discountMoney->getAmount() > $capMoney->getAmount()) {
                $discountMoney = $capMoney;
            }
        }

        // Discount cannot exceed subtotal (unless free shipping which applies to shipping)
        if ($coupon->type !== CouponType::FREE_SHIPPING && $discountMoney->getAmount() > $subtotalMoney->getAmount()) {
            $discountMoney = $subtotalMoney;
        }

        return $discountMoney;
    }

    private function calculatePercentage(Coupon $coupon, Money $eligibleSubtotal, string $currency): Money
    {
        $percentage = (float) $coupon->value;
        $discountCents = (int) round(($eligibleSubtotal->getAmount() * $percentage) / 100);

        return Money::fromCents(max(0, $discountCents), $currency);
    }

    private function calculateFixedAmount(Coupon $coupon, Money $eligibleSubtotal, string $currency): Money
    {
        $fixedMoney = Money::fromDecimal((float) $coupon->value, $currency);

        return $fixedMoney->getAmount() > $eligibleSubtotal->getAmount()
            ? $eligibleSubtotal
            : $fixedMoney;
    }

    private function calculateBuyXGetY(Coupon $coupon, Collection|array $cartItems, string $currency): Money
    {
        $items = $cartItems instanceof Collection ? $cartItems : collect($cartItems);
        if ($items->isEmpty()) {
            return Money::fromCents(0, $currency);
        }

        // Buy X Get Y: if cart has >= 2 items, cheapest item or proportion is discounted
        $totalQuantity = $items->sum(fn ($item) => is_object($item) ? ($item->quantity ?? 1) : ($item['quantity'] ?? 1));
        if ($totalQuantity < 2) {
            return Money::fromCents(0, $currency);
        }

        // Discount the unit price of one qualifying item
        $minUnitPrice = null;
        foreach ($items as $item) {
            $price = is_object($item) ? (float) ($item->unit_price ?? 0) : (float) ($item['unit_price'] ?? 0);
            if ($minUnitPrice === null || $price < $minUnitPrice) {
                $minUnitPrice = $price;
            }
        }

        return Money::fromDecimal($minUnitPrice ?? 0.0, $currency);
    }

    private function calculateEligibleSubtotal(
        Coupon $coupon,
        Collection|array $cartItems,
        float $subtotal,
        string $currency
    ): Money {
        $items = $cartItems instanceof Collection ? $cartItems : collect($cartItems);
        $restrictedCategories = $coupon->relationLoaded('categories')
            ? $coupon->categories->pluck('id')->map(fn ($id) => (string) $id)->all()
            : $coupon->categories()->pluck('categories.id')->map(fn ($id) => (string) $id)->all();

        $restrictedProducts = $coupon->relationLoaded('products')
            ? $coupon->products->pluck('id')->map(fn ($id) => (string) $id)->all()
            : $coupon->products()->pluck('products.id')->map(fn ($id) => (string) $id)->all();

        if ((empty($restrictedCategories) && empty($restrictedProducts)) || $items->isEmpty()) {
            return Money::fromDecimal($subtotal, $currency);
        }

        $eligibleCents = 0;
        foreach ($items as $item) {
            $productId = is_object($item) ? (string) ($item->product_id ?? '') : (string) ($item['product_id'] ?? '');
            $categoryId = is_object($item) ? (string) ($item->product?->category_id ?? '') : (string) ($item['category_id'] ?? '');
            $unitPrice = is_object($item) ? (float) ($item->unit_price ?? 0) : (float) ($item['unit_price'] ?? 0);
            $qty = is_object($item) ? (int) ($item->quantity ?? 1) : (int) ($item['quantity'] ?? 1);

            $isProductMatch = empty($restrictedProducts) || in_array($productId, $restrictedProducts, true);
            $isCategoryMatch = empty($restrictedCategories) || in_array($categoryId, $restrictedCategories, true);

            if ($isProductMatch && $isCategoryMatch) {
                $eligibleCents += (int) round($unitPrice * 100) * $qty;
            }
        }

        return Money::fromCents($eligibleCents, $currency);
    }
}
