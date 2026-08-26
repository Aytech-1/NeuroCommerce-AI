<?php

declare(strict_types=1);

namespace App\Modules\Cart\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\CartItem;
use Carbon\CarbonInterface;

/**
 * Cart Repository Interface
 *
 * Provides data access abstraction for shopping carts and cart items.
 */
interface CartRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find active cart for an authenticated user.
     */
    public function findByUserId(string $userId): ?Cart;

    /**
     * Find active cart for an anonymous session.
     */
    public function findBySessionId(string $sessionId): ?Cart;

    /**
     * Get or create a cart for an authenticated user.
     */
    public function getOrCreateForUser(string $userId, string $currency = 'USD'): Cart;

    /**
     * Get or create a cart for an anonymous session.
     */
    public function getOrCreateForSession(string $sessionId, string $currency = 'USD', int $ttlDays = 7): Cart;

    /**
     * Find a specific item inside a cart.
     */
    public function findItem(string $cartId, string $productId, ?string $variantId = null): ?CartItem;

    /**
     * Add or increment an item in a cart.
     */
    public function addItem(string $cartId, string $productId, ?string $variantId, int $quantity, float $unitPrice): CartItem;

    /**
     * Update quantity for a cart item.
     */
    public function updateItemQuantity(string $itemId, int $quantity): CartItem;

    /**
     * Remove a cart item.
     */
    public function removeItem(string $itemId): bool;

    /**
     * Clear all items in a cart.
     */
    public function clearCart(string $cartId): bool;

    /**
     * Delete expired guest carts.
     */
    public function deleteExpired(CarbonInterface $before): int;
}
