<?php

declare(strict_types=1);

namespace App\Modules\Cart\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Cart\Contracts\WishlistRepositoryInterface;
use App\Modules\Cart\Models\Wishlist;
use App\Modules\Cart\Models\WishlistItem;

/**
 * Eloquent Wishlist Repository
 */
class EloquentWishlistRepository extends AbstractRepository implements WishlistRepositoryInterface
{
    public function __construct(Wishlist $model)
    {
        parent::__construct($model);
    }

    public function getOrCreateForUser(string $userId, string $name = 'My Wishlist'): Wishlist
    {
        $wishlist = $this->model->newQuery()
            ->with(['items.product.primaryImage', 'items.variant'])
            ->where('user_id', $userId)
            ->first();

        if ($wishlist) {
            return $wishlist;
        }

        return $this->create([
            'user_id' => $userId,
            'name' => $name,
            'is_public' => false,
        ]);
    }

    public function findItem(string $wishlistId, string $productId, ?string $variantId = null): ?WishlistItem
    {
        $query = WishlistItem::where('wishlist_id', $wishlistId)
            ->where('product_id', $productId);

        if ($variantId !== null) {
            $query->where('variant_id', $variantId);
        } else {
            $query->whereNull('variant_id');
        }

        return $query->first();
    }

    public function addItem(string $wishlistId, string $productId, ?string $variantId = null, ?string $notes = null): WishlistItem
    {
        $existing = $this->findItem($wishlistId, $productId, $variantId);

        if ($existing) {
            if ($notes !== null) {
                $existing->notes = $notes;
                $existing->save();
            }
            return $existing;
        }

        return WishlistItem::create([
            'wishlist_id' => $wishlistId,
            'product_id' => $productId,
            'variant_id' => $variantId,
            'notes' => $notes,
        ]);
    }

    public function removeItemByProductId(string $wishlistId, string $productId): bool
    {
        return (bool) WishlistItem::where('wishlist_id', $wishlistId)
            ->where('product_id', $productId)
            ->delete();
    }

    public function isProductWishlisted(string $userId, string $productId): bool
    {
        return WishlistItem::whereHas('wishlist', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->where('product_id', $productId)->exists();
    }
}
