<?php

declare(strict_types=1);

namespace App\Modules\Cart\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Cart\Requests\AddWishlistRequest;
use App\Modules\Cart\Resources\CartItemResource;
use App\Modules\Cart\Resources\WishlistItemResource;
use App\Modules\Cart\Resources\WishlistResource;
use App\Modules\Cart\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Customer Wishlist Controller
 */
class WishlistController extends Controller
{
    public function __construct(
        protected readonly WishlistService $wishlistService,
    ) {}

    /**
     * Get customer's wishlist.
     */
    public function index(Request $request): JsonResponse
    {
        $wishlist = $this->wishlistService->getWishlist((string) $request->user()->id);
        $wishlist->load(['items.product.primaryImage', 'items.variant']);

        return ResponseHelper::success(new WishlistResource($wishlist));
    }

    /**
     * Add product to wishlist.
     */
    public function store(AddWishlistRequest $request): JsonResponse
    {
        $item = $this->wishlistService->addItem((string) $request->user()->id, $request->toDTO());

        return ResponseHelper::created(new WishlistItemResource($item), 'Product added to wishlist.');
    }

    /**
     * Remove product from wishlist.
     */
    public function destroy(Request $request, string $productId): JsonResponse
    {
        $this->wishlistService->removeItem((string) $request->user()->id, $productId);

        return ResponseHelper::success(null, 'Product removed from wishlist.');
    }

    /**
     * Move wishlist item to active cart.
     */
    public function moveToCart(Request $request, string $productId): JsonResponse
    {
        $cartItem = $this->wishlistService->moveToCart((string) $request->user()->id, $productId);

        return ResponseHelper::success(new CartItemResource($cartItem), 'Item moved to cart.');
    }

    /**
     * Check if a product is wishlisted.
     */
    public function check(Request $request, string $productId): JsonResponse
    {
        $isWishlisted = $this->wishlistService->isWishlisted((string) $request->user()->id, $productId);

        return ResponseHelper::success(['is_wishlisted' => $isWishlisted]);
    }
}
