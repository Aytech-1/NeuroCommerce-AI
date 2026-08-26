<?php

declare(strict_types=1);

namespace App\Modules\Cart\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Cart\Models\Wishlist;
use App\Modules\Cart\Models\WishlistItem;

/**
 * Wishlist Repository Interface
 */
interface WishlistRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get or create default wishlist for a user.
     */
    public function getOrCreateForUser(string $userId, string $name = 'My Wishlist'): Wishlist;

    /**
     * Find item in wishlist.
     */
    public function findItem(string $wishlistId, string $productId, ?string $variantId = null): ?WishlistItem;

    /**
     * Add item to wishlist.
     */
    public function addItem(string $wishlistId, string $productId, ?string $variantId = null, ?string $notes = null): WishlistItem;

    /**
     * Remove item from wishlist by product ID.
     */
    public function removeItemByProductId(string $wishlistId, string $productId): bool;

    /**
     * Check if product is in user's wishlist.
     */
    public function isProductWishlisted(string $userId, string $productId): bool;
}
