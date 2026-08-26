<?php

declare(strict_types=1);

namespace App\Modules\Review\Services;

use App\Modules\Order\Models\Order;
use App\Shared\Enums\OrderStatus;

/**
 * Class VerifiedPurchaseService
 *
 * Verifies whether a customer has genuinely purchased and received a product.
 *
 * @package App\Modules\Review\Services
 */
class VerifiedPurchaseService
{
    /**
     * Check if the user has purchased the product in an approved, completed order.
     *
     * @param string $userId
     * @param string $productId
     * @return array{is_verified: bool, order_id: string|null}
     */
    public function verifyPurchase(string $userId, string $productId): array
    {
        $qualifyingStatuses = [
            OrderStatus::CONFIRMED->value,
            OrderStatus::PROCESSING->value,
            OrderStatus::SHIPPED->value,
            OrderStatus::DELIVERED->value,
        ];

        $matchingOrder = Order::query()
            ->where('user_id', $userId)
            ->whereIn('status', $qualifyingStatuses)
            ->whereHas('items', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->latest('created_at')
            ->first();

        if ($matchingOrder !== null) {
            return [
                'is_verified' => true,
                'order_id' => $matchingOrder->id,
            ];
        }

        return [
            'is_verified' => false,
            'order_id' => null,
        ];
    }
}
