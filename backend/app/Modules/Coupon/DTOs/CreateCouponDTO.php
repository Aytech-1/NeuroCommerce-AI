<?php

declare(strict_types=1);

namespace App\Modules\Coupon\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateCouponDTO
 *
 * @package App\Modules\Coupon\DTOs
 */
class CreateCouponDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description,
        public readonly string $type,
        public readonly float $value,
        public readonly ?float $minOrderAmount = null,
        public readonly ?float $maxDiscountAmount = null,
        public readonly ?int $usageLimit = null,
        public readonly int $usageLimitPerUser = 1,
        public readonly ?string $startsAt = null,
        public readonly ?string $expiresAt = null,
        public readonly bool $isActive = true,
        public readonly array $categoryIds = [],
        public readonly array $productIds = [],
        public readonly array $rules = [],
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            code: strtoupper(trim((string) $data['code'])),
            name: (string) $data['name'],
            description: isset($data['description']) ? (string) $data['description'] : null,
            type: (string) $data['type'],
            value: (float) $data['value'],
            minOrderAmount: isset($data['min_order_amount']) ? (float) $data['min_order_amount'] : null,
            maxDiscountAmount: isset($data['max_discount_amount']) ? (float) $data['max_discount_amount'] : null,
            usageLimit: isset($data['usage_limit']) ? (int) $data['usage_limit'] : null,
            usageLimitPerUser: isset($data['usage_limit_per_user']) ? (int) $data['usage_limit_per_user'] : 1,
            startsAt: isset($data['starts_at']) ? (string) $data['starts_at'] : null,
            expiresAt: isset($data['expires_at']) ? (string) $data['expires_at'] : null,
            isActive: isset($data['is_active']) ? (bool) $data['is_active'] : true,
            categoryIds: $data['category_ids'] ?? [],
            productIds: $data['product_ids'] ?? [],
            rules: $data['rules'] ?? [],
        );
    }
}
