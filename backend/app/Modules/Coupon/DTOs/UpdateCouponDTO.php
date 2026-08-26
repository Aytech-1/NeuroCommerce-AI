<?php

declare(strict_types=1);

namespace App\Modules\Coupon\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateCouponDTO
 *
 * @package App\Modules\Coupon\DTOs
 */
class UpdateCouponDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $description = null,
        public readonly ?string $type = null,
        public readonly ?float $value = null,
        public readonly ?float $minOrderAmount = null,
        public readonly ?float $maxDiscountAmount = null,
        public readonly ?int $usageLimit = null,
        public readonly ?int $usageLimitPerUser = null,
        public readonly ?string $startsAt = null,
        public readonly ?string $expiresAt = null,
        public readonly ?bool $isActive = null,
        public readonly ?array $categoryIds = null,
        public readonly ?array $productIds = null,
        public readonly ?array $rules = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: isset($data['name']) ? (string) $data['name'] : null,
            description: array_key_exists('description', $data) ? ($data['description'] !== null ? (string) $data['description'] : null) : null,
            type: isset($data['type']) ? (string) $data['type'] : null,
            value: isset($data['value']) ? (float) $data['value'] : null,
            minOrderAmount: array_key_exists('min_order_amount', $data) ? ($data['min_order_amount'] !== null ? (float) $data['min_order_amount'] : null) : null,
            maxDiscountAmount: array_key_exists('max_discount_amount', $data) ? ($data['max_discount_amount'] !== null ? (float) $data['max_discount_amount'] : null) : null,
            usageLimit: array_key_exists('usage_limit', $data) ? ($data['usage_limit'] !== null ? (int) $data['usage_limit'] : null) : null,
            usageLimitPerUser: isset($data['usage_limit_per_user']) ? (int) $data['usage_limit_per_user'] : null,
            startsAt: array_key_exists('starts_at', $data) ? ($data['starts_at'] !== null ? (string) $data['starts_at'] : null) : null,
            expiresAt: array_key_exists('expires_at', $data) ? ($data['expires_at'] !== null ? (string) $data['expires_at'] : null) : null,
            isActive: isset($data['is_active']) ? (bool) $data['is_active'] : null,
            categoryIds: $data['category_ids'] ?? null,
            productIds: $data['product_ids'] ?? null,
            rules: $data['rules'] ?? null,
        );
    }
}
