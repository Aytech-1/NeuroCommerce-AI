<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Services;

use App\Modules\Coupon\Contracts\CouponRepositoryInterface;
use App\Modules\Coupon\DTOs\CouponValidationResultDTO;
use App\Modules\Coupon\Models\Coupon;
use Illuminate\Support\Collection;

/**
 * Class CouponValidator
 *
 * Validates eligibility, dates, usage limits, per-user limits, and restriction rules.
 *
 * @package App\Modules\Coupon\Services
 */
class CouponValidator
{
    public function __construct(
        protected readonly CouponRepositoryInterface $couponRepository,
        protected readonly DiscountCalculator $discountCalculator,
    ) {}

    /**
     * Validate a coupon against customer and order context.
     *
     * @param Coupon $coupon
     * @param float $subtotal
     * @param Collection|array $cartItems
     * @param string|null $userId
     * @param float $shippingCost
     * @param string $currency
     * @return CouponValidationResultDTO
     */
    public function validate(
        Coupon $coupon,
        float $subtotal,
        Collection|array $cartItems = [],
        ?string $userId = null,
        float $shippingCost = 0.0,
        ?string $currency = null
    ): CouponValidationResultDTO {
        $currency = $currency ?? (string) config('neurocommerce.currency.default', 'NGN');
        $now = now();

        // 1. Active status
        if (!$coupon->is_active) {
            return CouponValidationResultDTO::invalid('Coupon is not active or has been disabled.', 'COUPON_INACTIVE', $currency);
        }

        // 2. Starts at date
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            return CouponValidationResultDTO::invalid('Coupon is not yet active.', 'COUPON_NOT_STARTED');
        }

        // 3. Expires at date
        if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
            return CouponValidationResultDTO::invalid('Coupon has expired.', 'COUPON_EXPIRED');
        }

        // 4. Global usage limit
        if ($coupon->usage_limit !== null && $coupon->times_used >= $coupon->usage_limit) {
            return CouponValidationResultDTO::invalid('Coupon usage limit has been reached.', 'COUPON_LIMIT_REACHED');
        }

        // 5. Per-user usage limit
        if ($userId !== null && $coupon->usage_limit_per_user > 0) {
            $userUsage = $this->couponRepository->getUserUsageCount((string) $coupon->id, $userId);
            if ($userUsage >= $coupon->usage_limit_per_user) {
                return CouponValidationResultDTO::invalid(
                    'You have already reached the maximum usage limit for this coupon.',
                    'COUPON_USER_LIMIT_REACHED'
                );
            }
        }

        // 6. Minimum spend / subtotal
        if ($coupon->min_order_amount !== null && $coupon->min_order_amount > 0) {
            if ($subtotal < (float) $coupon->min_order_amount) {
                return CouponValidationResultDTO::invalid(
                    sprintf('Minimum order amount of %s required for this coupon.', number_format((float) $coupon->min_order_amount, 2)),
                    'COUPON_MIN_ORDER_NOT_MET'
                );
            }
        }

        // 7. Product & Category restriction checks
        $restrictedCategories = $coupon->categories->pluck('id')->all();
        $restrictedProducts = $coupon->products->pluck('id')->all();
        $items = $cartItems instanceof Collection ? $cartItems : collect($cartItems);

        if (!empty($restrictedProducts) && $items->isNotEmpty()) {
            $hasMatchingProduct = $items->contains(function ($item) use ($restrictedProducts) {
                $pId = is_object($item) ? (string) ($item->product_id ?? '') : (string) ($item['product_id'] ?? '');
                return in_array($pId, $restrictedProducts, true);
            });

            if (!$hasMatchingProduct) {
                return CouponValidationResultDTO::invalid(
                    'This coupon is only valid for specific products.',
                    'COUPON_PRODUCT_RESTRICTION'
                );
            }
        }

        if (!empty($restrictedCategories) && $items->isNotEmpty()) {
            $hasMatchingCategory = $items->contains(function ($item) use ($restrictedCategories) {
                $cId = is_object($item) ? (string) ($item->product?->category_id ?? '') : (string) ($item['category_id'] ?? '');
                return in_array($cId, $restrictedCategories, true);
            });

            if (!$hasMatchingCategory) {
                return CouponValidationResultDTO::invalid(
                    'This coupon is only valid for specific categories.',
                    'COUPON_CATEGORY_RESTRICTION'
                );
            }
        }

        // Calculate discount amount
        $discountMoney = $this->discountCalculator->calculate($coupon, $subtotal, $cartItems, $shippingCost, $currency);

        return CouponValidationResultDTO::valid(
            couponId: (string) $coupon->id,
            code: $coupon->code,
            type: $coupon->type->value,
            discountAmount: $discountMoney->getFormattedAmount(),
            currency: $currency
        );
    }
}
