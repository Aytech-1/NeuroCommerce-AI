<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Cart\DTOs\ApplyCouponDTO;
use App\Modules\Cart\Resources\CartResource;
use App\Modules\Cart\Services\CartService;
use App\Modules\Coupon\Requests\ApplyCouponRequest;
use App\Modules\Coupon\Requests\ValidateCouponRequest;
use App\Modules\Coupon\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class CouponController
 *
 * Storefront API for coupon validation and cart application.
 *
 * @package App\Modules\Coupon\Controllers\Api
 */
class CouponController extends Controller
{
    public function __construct(
        protected readonly CouponService $couponService,
        protected readonly CartService $cartService,
    ) {}

    /**
     * Validate a coupon code and preview discount.
     */
    public function validateCoupon(ValidateCouponRequest $request): JsonResponse
    {
        $code = (string) $request->input('code');
        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $subtotal = (float) ($request->input('subtotal') ?? 0.0);
        $cartId = $request->input('cart_id');

        $cartItems = [];
        if ($cartId) {
            $cart = \App\Modules\Cart\Models\Cart::with('items.product')->find($cartId);
            if ($cart) {
                $cartItems = $cart->items;
                $subtotal = $cart->calculateSubtotal()->getFormattedAmount();
            }
        }

        $result = $this->couponService->validateCoupon(
            code: $code,
            subtotal: $subtotal,
            cartItems: $cartItems,
            userId: $userId,
        );

        if (!$result->isValid) {
            return ResponseHelper::error(
                message: $result->errorMessage ?? 'Invalid coupon.',
                status: 422,
                code: $result->errorCode ?? 'INVALID_COUPON',
                errors: ['code' => [$result->errorMessage ?? 'Invalid coupon code.']]
            );
        }

        return ResponseHelper::success([
            'is_valid' => true,
            'coupon_id' => $result->couponId,
            'code' => $result->code,
            'type' => $result->type,
            'discount_amount' => $result->discountAmount,
            'currency' => $result->currency,
        ], 'Coupon is valid.');
    }

    /**
     * Apply coupon to current active cart.
     */
    public function applyToCart(ApplyCouponRequest $request): JsonResponse
    {
        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $sessionId = $request->header('X-Session-Id');

        $dto = new ApplyCouponDTO(
            code: (string) $request->input('code')
        );

        $cart = $this->cartService->applyCoupon($userId, $sessionId, $dto);

        return ResponseHelper::success(
            new CartResource($cart),
            'Coupon applied successfully.'
        );
    }

    /**
     * Remove coupon from current active cart.
     */
    public function removeFromCart(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $sessionId = $request->header('X-Session-Id');

        $cart = $this->cartService->removeCoupon($userId, $sessionId);

        return ResponseHelper::success(
            new CartResource($cart),
            'Coupon removed successfully.'
        );
    }
}
