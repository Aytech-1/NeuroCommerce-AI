<?php

declare(strict_types=1);

namespace App\Modules\Cart\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Core\ValueObjects\Money;
use App\Modules\Cart\Contracts\CartRepositoryInterface;
use App\Modules\Cart\DTOs\AddCartItemDTO;
use App\Modules\Cart\DTOs\ApplyCouponDTO;
use App\Modules\Cart\DTOs\CartSummaryDTO;
use App\Modules\Cart\DTOs\UpdateCartItemDTO;
use App\Modules\Cart\Events\CartItemAdded;
use App\Modules\Cart\Events\CartItemRemoved;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\CartItem;
use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Coupon\Services\CouponService;
use App\Modules\Inventory\Services\InventoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Cart Domain Service
 *
 * Orchestrates shopping cart lifecycles, item additions, pricing snapshots,
 * stock availability checks, coupon discounts, and guest-to-authenticated cart merges.
 */
class CartService extends AbstractService
{
    public function __construct(
        protected readonly CartRepositoryInterface $cartRepository,
        protected readonly InventoryService $inventoryService,
        protected readonly ?CouponService $couponService = null,
    ) {}

    /**
     * Resolve or initialize active cart for a user or session.
     */
    public function getOrCreateCart(?string $userId, ?string $sessionId, string $currency = 'USD'): Cart
    {
        if ($userId !== null) {
            return $this->cartRepository->getOrCreateForUser($userId, $currency);
        }

        if ($sessionId !== null) {
            return $this->cartRepository->getOrCreateForSession($sessionId, $currency);
        }

        // Generate a new fallback session ID if neither is provided
        $generatedSessionId = (string) Str::uuid();
        return $this->cartRepository->getOrCreateForSession($generatedSessionId, $currency);
    }

    /**
     * Add an item to the shopping cart with authoritative server pricing and stock checking.
     */
    public function addItem(?string $userId, ?string $sessionId, AddCartItemDTO $dto): CartItem
    {
        return $this->executeInTransaction(function () use ($userId, $sessionId, $dto) {
            $cart = $this->getOrCreateCart($userId, $sessionId);

            // 1. Authoritative Product Validation
            $product = Product::find($dto->productId);
            $statusValue = $product?->status instanceof ProductStatus
                ? $product->status->value
                : (string) $product?->status;

            if (! $product || ! $product->is_active || ($statusValue !== 'active' && $statusValue !== 'published')) {
                throw new BusinessRuleException('Product is not available for purchase.');
            }

            // 2. Authoritative Price Resolution
            $unitPrice = (float) $product->base_price;
            if ($dto->variantId !== null) {
                $variant = ProductVariant::where('id', $dto->variantId)
                    ->where('product_id', $product->id)
                    ->first();

                if (! $variant || ! $variant->is_active) {
                    throw new BusinessRuleException('Selected product variant is inactive or unavailable.');
                }

                $unitPrice = $variant->price !== null ? (float) $variant->price : $unitPrice;
            }

            // 3. Authoritative Stock Availability Check
            $availableStock = $this->inventoryService->getAvailableStock($dto->productId, $dto->variantId);
            $existingItem = $this->cartRepository->findItem($cart->id, $dto->productId, $dto->variantId);
            $existingQty = $existingItem ? $existingItem->quantity : 0;
            $newTotalQty = $existingQty + $dto->quantity;

            if ($newTotalQty > $availableStock) {
                throw new BusinessRuleException(
                    "Requested quantity ({$newTotalQty}) exceeds available inventory ({$availableStock})."
                );
            }

            // 4. Persistence with Unit Price Snapshot
            $cartItem = $this->cartRepository->addItem(
                $cart->id,
                $dto->productId,
                $dto->variantId,
                $dto->quantity,
                $unitPrice
            );

            // 5. Fire Domain Event
            $this->dispatchDomainEvent(new CartItemAdded(
                cartItem: $cartItem,
                userId: $userId,
                sessionId: $sessionId
            ));

            return $cartItem;
        });
    }

    /**
     * Update quantity for a cart line item with security and stock validation.
     */
    public function updateItem(?string $userId, ?string $sessionId, string $itemId, UpdateCartItemDTO $dto): CartItem
    {
        return $this->executeInTransaction(function () use ($userId, $sessionId, $itemId, $dto) {
            $cart = $this->getOrCreateCart($userId, $sessionId);
            $cartItem = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->first();

            if (! $cartItem) {
                throw new EntityNotFoundException('CartItem', $itemId);
            }

            $availableStock = $this->inventoryService->getAvailableStock($cartItem->product_id, $cartItem->variant_id);
            if ($dto->quantity > $availableStock) {
                throw new BusinessRuleException(
                    "Requested quantity ({$dto->quantity}) exceeds available inventory ({$availableStock})."
                );
            }

            return $this->cartRepository->updateItemQuantity($itemId, $dto->quantity);
        });
    }

    /**
     * Remove a cart line item securely.
     */
    public function removeItem(?string $userId, ?string $sessionId, string $itemId): bool
    {
        return $this->executeInTransaction(function () use ($userId, $sessionId, $itemId) {
            $cart = $this->getOrCreateCart($userId, $sessionId);
            $cartItem = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->first();

            if (! $cartItem) {
                throw new EntityNotFoundException('CartItem', $itemId);
            }

            $deleted = $this->cartRepository->removeItem($itemId);

            if ($deleted) {
                $this->dispatchDomainEvent(new CartItemRemoved(
                    cartId: $cart->id,
                    productId: $cartItem->product_id,
                    variantId: $cartItem->variant_id,
                    userId: $userId,
                    sessionId: $sessionId
                ));
            }

            return $deleted;
        });
    }

    /**
     * Clear all items in the cart.
     */
    public function clearCart(?string $userId, ?string $sessionId): bool
    {
        return $this->executeInTransaction(function () use ($userId, $sessionId) {
            $cart = $this->getOrCreateCart($userId, $sessionId);
            return $this->cartRepository->clearCart($cart->id);
        });
    }

    /**
     * Apply a coupon code to the cart.
     */
    public function applyCoupon(?string $userId, ?string $sessionId, ApplyCouponDTO $dto): Cart
    {
        $cart = $this->getOrCreateCart($userId, $sessionId);
        $cart->load('items.product');

        $couponService = $this->couponService ?? app(CouponService::class);
        $subtotal = $cart->calculateSubtotal()->getFormattedAmount();
        $items = $cart->items;

        $validation = $couponService->validateCoupon(
            code: $dto->code,
            subtotal: $subtotal,
            cartItems: $items,
            userId: $userId,
            currency: $cart->currency_code ?: 'USD'
        );

        if (!$validation->isValid) {
            throw new BusinessRuleException(
                $validation->errorMessage ?? 'Invalid coupon code.'
            );
        }

        $cart->coupon_id = $validation->couponId;
        $cart->notes = "Coupon: {$validation->code}";
        $cart->save();

        return $cart->load(['items.product.primaryImage', 'items.variant']);
    }

    /**
     * Remove applied coupon.
     */
    public function removeCoupon(?string $userId, ?string $sessionId): Cart
    {
        $cart = $this->getOrCreateCart($userId, $sessionId);
        $cart->coupon_id = null;
        $cart->notes = null;
        $cart->save();

        return $cart->load(['items.product.primaryImage', 'items.variant']);
    }

    /**
     * Calculate cart summary totals using Money arithmetic.
     */
    public function calculateSummary(Cart $cart): CartSummaryDTO
    {
        $cart->load('items.product');
        $subtotalMoney = $cart->calculateSubtotal();
        $subtotal = $subtotalMoney->getFormattedAmount();
        $currency = $cart->currency_code ?: 'USD';

        $discount = 0.0;
        $couponCode = null;

        if ($cart->notes && str_starts_with($cart->notes, 'Coupon: ')) {
            $couponCode = trim(str_replace('Coupon: ', '', $cart->notes));
        }

        if ($couponCode !== null) {
            try {
                $couponService = $this->couponService ?? app(CouponService::class);
                $items = $cart->items;
                $validation = $couponService->validateCoupon(
                    code: $couponCode,
                    subtotal: $subtotal,
                    cartItems: $items,
                    userId: $cart->user_id ? (string) $cart->user_id : null,
                    currency: $currency
                );

                if ($validation->isValid) {
                    $discount = $validation->discountAmount;
                }
            } catch (\Throwable) {
                $discount = 0.0;
            }
        }

        $tax = 0.0;
        $shipping = 0.0;
        $total = max(0.0, $subtotal - $discount + $tax + $shipping);

        return new CartSummaryDTO(
            itemCount: $cart->item_count,
            subtotal: $subtotal,
            discount: $discount,
            tax: $tax,
            shipping: $shipping,
            total: $total,
            currency: $currency,
            couponCode: $couponCode
        );
    }

    /**
     * Atomically merge a guest shopping cart into an authenticated customer cart upon login.
     */
    public function mergeGuestCart(string $userId, string $sessionId): Cart
    {
        return $this->executeInTransaction(function () use ($userId, $sessionId) {
            $guestCart = $this->cartRepository->findBySessionId($sessionId);
            $userCart = $this->cartRepository->getOrCreateForUser($userId);

            if (! $guestCart || $guestCart->items->isEmpty()) {
                return $userCart->load(['items.product.primaryImage', 'items.variant']);
            }

            foreach ($guestCart->items as $guestItem) {
                $available = $this->inventoryService->getAvailableStock($guestItem->product_id, $guestItem->variant_id);
                $existing = $this->cartRepository->findItem($userCart->id, $guestItem->product_id, $guestItem->variant_id);

                if ($existing) {
                    $combinedQty = min($existing->quantity + $guestItem->quantity, max(1, $available));
                    $existing->quantity = $combinedQty;
                    $existing->unit_price = $guestItem->unit_price;
                    $existing->save();
                } else {
                    $cappedQty = min($guestItem->quantity, max(1, $available));
                    CartItem::create([
                        'cart_id' => $userCart->id,
                        'product_id' => $guestItem->product_id,
                        'variant_id' => $guestItem->variant_id,
                        'quantity' => $cappedQty,
                        'unit_price' => $guestItem->unit_price,
                    ]);
                }
            }

            // Delete obsolete guest cart
            CartItem::where('cart_id', $guestCart->id)->delete();
            $guestCart->delete();

            return $userCart->load(['items.product.primaryImage', 'items.variant']);
        });
    }
}
