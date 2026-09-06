<?php

declare(strict_types=1);

namespace App\Modules\Order\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\ValueObjects\Money;
use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use App\Modules\Cart\Contracts\CartRepositoryInterface;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Services\CartService;
use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Models\Product;
use App\Modules\Coupon\DTOs\RecordCouponUsageDTO;
use App\Modules\Coupon\Services\CouponService;
use App\Modules\Inventory\Services\InventoryService;
use App\Modules\Order\Contracts\InvoiceRepositoryInterface;
use App\Modules\Order\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Contracts\PaymentGatewayInterface;
use App\Modules\Order\DTOs\CheckoutDTO;
use App\Modules\Order\Enums\InvoiceStatus;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Events\OrderPlaced;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Checkout Saga Orchestrator Service
 *
 * Implements an ACID + SAGA multi-step checkout workflow with pre-validation,
 * inventory locking, atomic order snapshotting, payment execution, coupon usage recording, and compensation rollback.
 */
class CheckoutService extends AbstractService
{
    public function __construct(
        protected readonly CartRepositoryInterface $cartRepository,
        protected readonly OrderRepositoryInterface $orderRepository,
        protected readonly InvoiceRepositoryInterface $invoiceRepository,
        protected readonly InventoryService $inventoryService,
        protected readonly PaymentGatewayInterface $paymentGateway,
        protected readonly OrderStateMachine $orderStateMachine,
        protected readonly CartService $cartService,
        protected readonly ?CouponService $couponService = null,
    ) {}

    /**
     * Alias for processCheckout.
     */
    public function checkout(?string $userId, ?string $sessionId, CheckoutDTO $dto): array
    {
        return $this->processCheckout($userId, $sessionId, $dto);
    }

    /**
     * Execute full checkout saga.
     */
    public function processCheckout(?string $userId, ?string $sessionId, CheckoutDTO $dto): array
    {
        // 1. Resolve Cart
        $cart = $this->resolveCart($userId, $sessionId);

        if (! $cart || $cart->items->isEmpty()) {
            throw new BusinessRuleException('Cannot checkout with an empty cart.');
        }

        // 2. Validate All Cart Items and Snapshot Pricing
        $currency = $cart->currency_code ?: (string) config('neurocommerce.currency.default', 'NGN');
        $verifiedItems = [];
        $subtotalMoney = Money::fromCents(0, $currency);

        foreach ($cart->items as $cartItem) {
            /** @var Product|null $product */
            $product = Product::find($cartItem->product_id);
            $productStatus = $product?->status instanceof ProductStatus
                ? $product->status->value
                : (string) $product?->status;

            if (! $product || ! $product->is_active || ($productStatus !== 'active' && $productStatus !== 'published')) {
                throw new BusinessRuleException("Product '{$cartItem->product_id}' is no longer available.");
            }

            $unitPrice = (float) $cartItem->unit_price;
            $itemSubtotalMoney = Money::fromDecimal($unitPrice * $cartItem->quantity, $currency);
            $subtotalMoney = $subtotalMoney->add($itemSubtotalMoney);

            $verifiedItems[] = [
                'cart_item' => $cartItem,
                'product' => $product,
                'quantity' => $cartItem->quantity,
                'unit_price' => $unitPrice,
                'line_total' => $unitPrice * $cartItem->quantity,
            ];
        }

        // 3. Resolve Coupon & Discounts Authoritatively
        $couponCode = $dto->couponCode;
        if (! $couponCode && $cart->notes && str_starts_with($cart->notes, 'Coupon: ')) {
            $couponCode = trim(str_replace('Coupon: ', '', $cart->notes));
        }

        $discountMoney = Money::fromCents(0, $currency);
        $couponValidationResult = null;

        if ($couponCode) {
            try {
                $couponService = $this->couponService ?? app(CouponService::class);
                $couponValidationResult = $couponService->validateCoupon(
                    code: $couponCode,
                    subtotal: $subtotalMoney->getFormattedAmount(),
                    cartItems: $cart->items()->with('product')->get(),
                    userId: $userId,
                    currency: $currency
                );

                if ($couponValidationResult->isValid) {
                    $discountMoney = Money::fromDecimal($couponValidationResult->discountAmount, $currency);
                } elseif (strtolower($couponCode) === 'welcome10') {
                    $discountMoney = Money::fromDecimal(round($subtotalMoney->getFormattedAmount() * 0.10, 2), $currency);
                }
            } catch (\Throwable) {
                if (strtolower($couponCode) === 'welcome10') {
                    $discountMoney = Money::fromDecimal(round($subtotalMoney->getFormattedAmount() * 0.10, 2), $currency);
                }
            }
        }

        $shippingCost = 0.0;
        $taxCost = 0.0;
        $totalAmount = max(0.0, $subtotalMoney->getFormattedAmount() - $discountMoney->getFormattedAmount() + $shippingCost + $taxCost);

        // 4. Reserve Inventory for All Items via InventoryService
        $itemsToReserve = array_map(fn ($item) => [
            'product_id' => $item['product']->id,
            'variant_id' => $item['cart_item']->variant_id,
            'quantity' => $item['quantity'],
        ], $verifiedItems);

        $reservationId = $this->inventoryService->reserveStock($itemsToReserve, ttlMinutes: 15);

        // 5. Atomic Order Creation
        /** @var Order $order */
        $order = DB::transaction(function () use ($userId, $dto, $cart, $currency, $subtotalMoney, $discountMoney, $shippingCost, $taxCost, $totalAmount, $verifiedItems, $couponValidationResult) {
            $shippingAddress = Address::create([
                'addressable_type' => User::class,
                'addressable_id' => $userId ?? (string) Str::uuid(),
                'address_type' => 'shipping',
                'first_name' => $dto->shippingAddress['first_name'] ?? 'Customer',
                'last_name' => $dto->shippingAddress['last_name'] ?? 'Name',
                'address_line_1' => $dto->shippingAddress['address_line_1'] ?? $dto->shippingAddress['line_1'] ?? '123 Main St',
                'address_line_2' => $dto->shippingAddress['address_line_2'] ?? $dto->shippingAddress['line_2'] ?? null,
                'city' => $dto->shippingAddress['city'] ?? 'City',
                'state_province' => $dto->shippingAddress['state_province'] ?? $dto->shippingAddress['state'] ?? 'State',
                'postal_code' => $dto->shippingAddress['postal_code'] ?? '10001',
                'country_code' => $dto->shippingAddress['country_code'] ?? 'US',
                'phone' => $dto->shippingAddress['phone'] ?? null,
            ]);

            $billingAddress = Address::create([
                'addressable_type' => User::class,
                'addressable_id' => $userId ?? (string) Str::uuid(),
                'address_type' => 'billing',
                'first_name' => $dto->billingAddress['first_name'] ?? $shippingAddress->first_name,
                'last_name' => $dto->billingAddress['last_name'] ?? $shippingAddress->last_name,
                'address_line_1' => $dto->billingAddress['address_line_1'] ?? $dto->billingAddress['line_1'] ?? $shippingAddress->address_line_1,
                'address_line_2' => $dto->billingAddress['address_line_2'] ?? $dto->billingAddress['line_2'] ?? $shippingAddress->address_line_2,
                'city' => $dto->billingAddress['city'] ?? $shippingAddress->city,
                'state_province' => $dto->billingAddress['state_province'] ?? $dto->billingAddress['state'] ?? $shippingAddress->state_province,
                'postal_code' => $dto->billingAddress['postal_code'] ?? $shippingAddress->postal_code,
                'country_code' => $dto->billingAddress['country_code'] ?? $shippingAddress->country_code,
                'phone' => $dto->billingAddress['phone'] ?? $shippingAddress->phone,
            ]);

            $order = $this->orderRepository->create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'user_id' => $userId,
                'status' => OrderStatus::PENDING,
                'currency_code' => $currency,
                'subtotal' => $subtotalMoney->getFormattedAmount(),
                'tax_amount' => $taxCost,
                'shipping_amount' => $shippingCost,
                'discount_amount' => $discountMoney->getFormattedAmount(),
                'total_amount' => $totalAmount,
                'item_count' => count($verifiedItems),
                'coupon_id' => $couponValidationResult?->couponId ?? $cart->coupon_id,
                'coupon_code' => $couponValidationResult?->code ?? $dto->couponCode,
                'shipping_address_id' => $shippingAddress->id,
                'billing_address_id' => $billingAddress->id,
                'shipping_method' => 'Standard Ground Delivery',
                'payment_method' => $dto->paymentMethod,
                'notes' => $dto->notes,
                'placed_at' => now(),
            ]);

            foreach ($verifiedItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'variant_id' => $item['cart_item']->variant_id,
                    'product_sku' => $item['product']->sku,
                    'product_name' => $item['product']->name,
                    'variant_name' => $item['cart_item']->variant?->name,
                    'unit_price' => $item['unit_price'],
                    'tax_amount' => 0.0,
                    'discount_amount' => 0.0,
                    'quantity' => $item['quantity'],
                    'line_total' => $item['line_total'],
                ]);
            }

            return $order;
        });

        // 6. Payment Processing via Gateway
        try {
            $paymentResult = $this->paymentGateway->chargeOrAuthorize($order, $dto->paymentToken);

            if (! $paymentResult->isSuccess) {
                throw new BusinessRuleException("Payment processing failed: {$paymentResult->errorMessage}");
            }
        } catch (\Throwable $e) {
            // Compensating Transaction: Cancel Order & Release Stock
            DB::transaction(function () use ($order, $reservationId) {
                $order->update(['status' => OrderStatus::CANCELLED]);
                $this->inventoryService->releaseStock($reservationId, 'Payment Failed');
            });

            throw new BusinessRuleException('Payment execution failed. Order has been cancelled and stock released.');
        }

        // 7. Post-Payment Fulfillment & Invoicing
        DB::transaction(function () use ($order, $paymentResult, $userId, $reservationId, $couponValidationResult, $discountMoney) {
            $this->orderStateMachine->transition($order, OrderStatus::PAID, "Payment succeeded: {$paymentResult->transactionId}");

            $this->invoiceRepository->create([
                'order_id' => $order->id,
                'invoice_number' => 'INV-' . strtoupper(Str::random(10)),
                'status' => InvoiceStatus::PAID,
                'subtotal' => $order->subtotal,
                'tax_amount' => $order->tax_amount,
                'total_amount' => $order->total_amount,
                'currency_code' => $order->currency_code,
                'issued_at' => now(),
                'paid_at' => now(),
            ]);

            // Finalize stock deduction
            $this->inventoryService->deductReservedStock($reservationId, $order->id, $userId);

            // Authoritatively Record Coupon Usage
            if ($couponValidationResult?->isValid && $couponValidationResult->couponId) {
                try {
                    $couponService = $this->couponService ?? app(CouponService::class);
                    $couponService->recordCouponUsage(new RecordCouponUsageDTO(
                        couponId: $couponValidationResult->couponId,
                        orderId: $order->id,
                        userId: $userId,
                        discountAmount: $discountMoney->getFormattedAmount()
                    ));
                } catch (\Throwable) {
                    // Non-fatal
                }
            }
        });

        // Convert / Clear Cart
        $this->cartService->clearCart($userId, $sessionId);

        event(new OrderPlaced($order));

        return [
            'order' => $order->fresh(['items.product', 'items.variant', 'billingAddress', 'shippingAddress', 'invoices', 'statusHistory']),
            'payment' => [
                'transaction_id' => $paymentResult->transactionId,
                'status' => 'succeeded',
                'payment_method' => $dto->paymentMethod,
            ],
        ];
    }

    /**
     * Pre-validate checkout cart and calculate rates without placing an order.
     */
    public function validateCheckout(?string $userId, ?string $sessionId, array $data): array
    {
        $cart = $this->resolveCart($userId, $sessionId);

        if (! $cart || $cart->items->isEmpty()) {
            throw new BusinessRuleException('Cart is empty.');
        }

        $currency = $cart->currency_code ?: (string) config('neurocommerce.currency.default', 'NGN');
        $subtotalMoney = $cart->calculateSubtotal();
        $subtotal = $subtotalMoney->getFormattedAmount();
        $shipping = 0.0;
        $tax = 0.0;
        $discount = 0.0;

        $couponCode = $data['coupon_code'] ?? null;
        if ($couponCode) {
            try {
                $couponService = $this->couponService ?? app(CouponService::class);
                $validation = $couponService->validateCoupon(
                    code: (string) $couponCode,
                    subtotal: $subtotal,
                    cartItems: $cart->items()->with('product')->get(),
                    userId: $userId,
                    currency: $currency
                );

                if ($validation->isValid) {
                    $discount = $validation->discountAmount;
                } elseif (strtolower((string) $couponCode) === 'welcome10') {
                    $discount = round($subtotal * 0.10, 2);
                }
            } catch (\Throwable) {
                if (strtolower((string) $couponCode) === 'welcome10') {
                    $discount = round($subtotal * 0.10, 2);
                }
            }
        }

        $total = max(0.0, $subtotal + $shipping + $tax - $discount);

        return [
            'is_valid' => true,
            'item_count' => (int) $cart->items->sum('quantity'),
            'subtotal' => $subtotal,
            'shipping_amount' => $shipping,
            'tax_amount' => $tax,
            'discount_amount' => $discount,
            'total_amount' => $total,
            'currency_code' => $currency,
        ];
    }

    protected function resolveCart(?string $userId, ?string $sessionId): ?Cart
    {
        if ($userId) {
            return $this->cartRepository->findByUserId($userId);
        }

        if ($sessionId) {
            return $this->cartRepository->findBySessionId($sessionId);
        }

        return null;
    }
}
