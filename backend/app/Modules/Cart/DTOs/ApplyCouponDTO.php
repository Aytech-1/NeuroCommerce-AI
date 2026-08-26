<?php

declare(strict_types=1);

namespace App\Modules\Cart\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * ApplyCouponDTO
 */
class ApplyCouponDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $code,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            code: trim((string) $data['code']),
        );
    }
}
