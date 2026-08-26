<?php

declare(strict_types=1);

namespace App\Modules\Cart\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Cart\Contracts\WishlistRepositoryInterface;
use App\Modules\Cart\DTOs\AddCartItemDTO;
use App\Modules\Cart\DTOs\AddWishlistDTO;
use App\Modules\Cart\Events\WishlistItemAdded;
use App\Modules\Cart\Models\CartItem;
use App\Modules\Cart\Models\Wishlist;
use App\Modules\Cart\Models\WishlistItem;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Support\Facades\Cache;

/**
 * Wishlist Domain Service
 */
class WishlistService extends AbstractService
{
    protected const CACHE_PREFIX = 'nc_wishlist_user_';

    public function __construct(
        protected readonly WishlistRepositoryInterface $wishlistRepository,
        protected readonly CartService $cartService,
    ) {}

    /**
     * Get or create customer wishlist with eager-loaded products and variants.
     */
    public function getWishlist(string $userId): Wishlist
    {
        return $this->wishlistRepository->getOrCreateForUser($userId);
    }

    /**
     * Get a public/shared wishlist by ID.
     */
    public function getSharedWishlist(string $wishlistId): Wishlist
    {
        $wishlist = Wishlist::with(['items.product.primaryImage', 'items.variant'])
            ->where('id', $wishlistId)
            ->where('is_public', true)
            ->first();

        if (! $wishlist) {
            throw new EntityNotFoundException('Wishlist', $wishlistId);
        }

        return $wishlist;
    }

    /**
     * Add product to wishlist.
     */
    public function addItem(string $userId, AddWishlistDTO $dto): WishlistItem
    {
        return $this->executeInTransaction(function () use ($userId, $dto) {
            $wishlist = $this->wishlistRepository->getOrCreateForUser($userId);

            // Enforce maximum wishlist limit of 500 items (FR-WSH-010)
            if ($wishlist->items()->count() >= 500) {
                throw new BusinessRuleException('Wishlist limit of 500 items reached.');
            }

            // Validate product exists and is active
            $product = Product::find($dto->productId);
            if (! $product || ! $product->is_active) {
                throw new BusinessRuleException('Cannot wishlist an inactive or non-existent product.');
            }

            if ($dto->variantId !== null) {
                $variant = ProductVariant::where('id', $dto->variantId)->where('product_id', $product->id)->first();
                if (! $variant || ! $variant->is_active) {
                    throw new BusinessRuleException('Cannot wishlist an inactive or invalid product variant.');
                }
            }

            $item = $this->wishlistRepository->addItem(
                wishlistId: $wishlist->id,
                productId: $dto->productId,
                variantId: $dto->variantId,
                notes: $dto->notes
            );

            $this->clearCache($userId);

            event(new WishlistItemAdded($item, $userId));

            return $item->load(['product.primaryImage', 'variant']);
        });
    }

    /**
     * Remove product from wishlist.
     */
    public function removeItem(string $userId, string $productId): bool
    {
        return $this->executeInTransaction(function () use ($userId, $productId) {
            $wishlist = $this->wishlistRepository->getOrCreateForUser($userId);
            $deleted = $this->wishlistRepository->removeItemByProductId($wishlist->id, $productId);
            $this->clearCache($userId);
            return $deleted;
        });
    }

    /**
     * Move an item from wishlist to active shopping cart atomically.
     */
    public function moveToCart(string $userId, string $productId): CartItem
    {
        return $this->executeInTransaction(function () use ($userId, $productId) {
            $wishlist = $this->wishlistRepository->getOrCreateForUser($userId);
            $item = $this->wishlistRepository->findItem($wishlist->id, $productId);

            if (! $item) {
                throw new EntityNotFoundException('WishlistItem', $productId);
            }

            // Add to cart with full server-side price & stock verification
            $cartItem = $this->cartService->addItem(
                userId: $userId,
                sessionId: null,
                dto: new AddCartItemDTO(
                    productId: $item->product_id,
                    variantId: $item->variant_id,
                    quantity: 1
                )
            );

            // Remove from wishlist only after successful cart addition
            $this->wishlistRepository->removeItemByProductId($wishlist->id, $productId);
            $this->clearCache($userId);

            return $cartItem;
        });
    }

    /**
     * Check if product is in user's wishlist.
     */
    public function isWishlisted(string $userId, string $productId): bool
    {
        return $this->wishlistRepository->isProductWishlisted($userId, $productId);
    }

    /**
     * Remove purchased products from customer wishlist (FR-WSH-008).
     */
    public function removePurchasedItems(string $userId, array $productIds): void
    {
        if (empty($productIds)) {
            return;
        }

        $this->executeInTransaction(function () use ($userId, $productIds) {
            $wishlist = $this->wishlistRepository->getOrCreateForUser($userId);
            WishlistItem::where('wishlist_id', $wishlist->id)
                ->whereIn('product_id', $productIds)
                ->delete();

            $this->clearCache($userId);
        });
    }

    /**
     * Clear user wishlist cache.
     */
    public function clearCache(string $userId): void
    {
        Cache::forget(self::CACHE_PREFIX . $userId);
    }
}
