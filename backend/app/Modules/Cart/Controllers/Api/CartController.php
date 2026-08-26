<?php

declare(strict_types=1);

namespace App\Modules\Cart\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Cart\Requests\AddCartItemRequest;
use App\Modules\Cart\Requests\ApplyCouponRequest;
use App\Modules\Cart\Requests\UpdateCartItemRequest;
use App\Modules\Cart\Resources\CartItemResource;
use App\Modules\Cart\Resources\CartResource;
use App\Modules\Cart\Resources\CartSummaryResource;
use App\Modules\Cart\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Storefront Shopping Cart Controller
 */
class CartController extends Controller
{
    public function __construct(
        protected readonly CartService $cartService,
    ) {}

    /**
     * Get current active cart for customer or guest session.
     */
    public function show(Request $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $cart = $this->cartService->getOrCreateCart($userId, $sessionId);
        $cart->load(['items.product.primaryImage', 'items.variant']);

        return ResponseHelper::success(new CartResource($cart));
    }

    /**
     * Add line item to cart.
     */
    public function addItem(AddCartItemRequest $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $cartItem = $this->cartService->addItem($userId, $sessionId, $request->toDTO());

        return ResponseHelper::created(new CartItemResource($cartItem), 'Item added to cart.');
    }

    /**
     * Update quantity for a cart line item.
     */
    public function updateItem(UpdateCartItemRequest $request, string $id): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $cartItem = $this->cartService->updateItem($userId, $sessionId, $id, $request->toDTO());

        return ResponseHelper::success(new CartItemResource($cartItem), 'Cart item updated.');
    }

    /**
     * Remove line item from cart.
     */
    public function removeItem(Request $request, string $id): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $this->cartService->removeItem($userId, $sessionId, $id);

        return ResponseHelper::success(null, 'Item removed from cart.');
    }

    /**
     * Clear all items in the cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $this->cartService->clearCart($userId, $sessionId);

        return ResponseHelper::success(null, 'Cart cleared successfully.');
    }

    /**
     * Apply a coupon code.
     */
    public function applyCoupon(ApplyCouponRequest $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $cart = $this->cartService->applyCoupon($userId, $sessionId, $request->toDTO());

        return ResponseHelper::success(new CartResource($cart), 'Coupon applied successfully.');
    }

    /**
     * Remove applied coupon.
     */
    public function removeCoupon(Request $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $cart = $this->cartService->removeCoupon($userId, $sessionId);

        return ResponseHelper::success(new CartResource($cart), 'Coupon removed successfully.');
    }

    /**
     * Get cart financial summary and totals.
     */
    public function summary(Request $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $cart = $this->cartService->getOrCreateCart($userId, $sessionId);
        $cart->load(['items.product', 'items.variant']);

        $summary = $this->cartService->calculateSummary($cart);

        return ResponseHelper::success(new CartSummaryResource($summary));
    }
}
