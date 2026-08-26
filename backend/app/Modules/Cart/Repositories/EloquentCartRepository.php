<?php

declare(strict_types=1);

namespace App\Modules\Cart\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Cart\Contracts\CartRepositoryInterface;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\CartItem;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Eloquent Cart Repository
 */
class EloquentCartRepository extends AbstractRepository implements CartRepositoryInterface
{
    public function __construct(Cart $model)
    {
        parent::__construct($model);
    }

    public function findByUserId(string $userId): ?Cart
    {
        return $this->model->newQuery()
            ->with(['items.product.primaryImage', 'items.variant'])
            ->where('user_id', $userId)
            ->first();
    }

    public function findBySessionId(string $sessionId): ?Cart
    {
        return $this->model->newQuery()
            ->with(['items.product.primaryImage', 'items.variant'])
            ->where('session_id', $sessionId)
            ->whereNull('user_id')
            ->first();
    }

    public function getOrCreateForUser(string $userId, string $currency = 'USD'): Cart
    {
        $cart = $this->findByUserId($userId);

        if ($cart) {
            return $cart;
        }

        return $this->create([
            'user_id' => $userId,
            'currency_code' => $currency,
        ]);
    }

    public function getOrCreateForSession(string $sessionId, string $currency = 'USD', int $ttlDays = 7): Cart
    {
        $cart = $this->findBySessionId($sessionId);

        if ($cart) {
            return $cart;
        }

        return $this->create([
            'session_id' => $sessionId,
            'currency_code' => $currency,
            'expires_at' => now()->addDays($ttlDays),
        ]);
    }

    public function findItem(string $cartId, string $productId, ?string $variantId = null): ?CartItem
    {
        $query = CartItem::where('cart_id', $cartId)
            ->where('product_id', $productId);

        if ($variantId !== null) {
            $query->where('variant_id', $variantId);
        } else {
            $query->whereNull('variant_id');
        }

        return $query->first();
    }

    public function addItem(string $cartId, string $productId, ?string $variantId, int $quantity, float $unitPrice): CartItem
    {
        $existing = $this->findItem($cartId, $productId, $variantId);

        if ($existing) {
            $existing->quantity += $quantity;
            $existing->unit_price = $unitPrice;
            $existing->save();
            return $existing;
        }

        return CartItem::create([
            'cart_id' => $cartId,
            'product_id' => $productId,
            'variant_id' => $variantId,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
        ]);
    }

    public function updateItemQuantity(string $itemId, int $quantity): CartItem
    {
        $item = CartItem::findOrFail($itemId);
        $item->quantity = $quantity;
        $item->save();

        return $item;
    }

    public function removeItem(string $itemId): bool
    {
        return (bool) CartItem::where('id', $itemId)->delete();
    }

    public function clearCart(string $cartId): bool
    {
        CartItem::where('cart_id', $cartId)->delete();
        return true;
    }

    public function deleteExpired(CarbonInterface $before): int
    {
        return $this->model->newQuery()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $before)
            ->delete();
    }
}
