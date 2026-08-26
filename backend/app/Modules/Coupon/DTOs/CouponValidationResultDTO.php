<?php

declare(strict_types=1);

namespace App\Modules\Coupon\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Core\ValueObjects\Money;

/**
 * Class CouponValidationResultDTO
 *
 * @package App\Modules\Coupon\DTOs
 */
class CouponValidationResultDTO extends AbstractDTO
{
    public function __construct(
        public readonly bool $isValid,
        public readonly ?string $couponId,
        public readonly ?string $code,
        public readonly ?string $type,
        public readonly float $discountAmount,
        public readonly string $currency,
        public readonly ?string $errorMessage = null,
        public readonly ?string $errorCode = null,
    ) {}

    public static function valid(
        string $couponId,
        string $code,
        string $type,
        float $discountAmount,
        string $currency = 'USD'
    ): self {
        return new self(
            isValid: true,
            couponId: $couponId,
            code: $code,
            type: $type,
            discountAmount: $discountAmount,
            currency: $currency,
        );
    }

    public static function invalid(string $message, string $code = 'INVALID_COUPON'): self
    {
        return new self(
            isValid: false,
            couponId: null,
            code: null,
            type: null,
            discountAmount: 0.0,
            currency: 'USD',
            errorMessage: $message,
            errorCode: $code,
        );
    }

    public function toMoney(): Money
    {
        return Money::fromDecimal($this->discountAmount, $this->currency);
    }
}
