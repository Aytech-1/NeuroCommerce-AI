<?php

declare(strict_types=1);

namespace App\Modules\Payment\Enums;

/**
 * Enum TransactionStatus
 *
 * @package App\Modules\Payment\Enums
 */
enum TransactionStatus: string
{
    case SUCCESS = 'success';
    case FAILED = 'failed';
    case PENDING = 'pending';

    public function label(): string
    {
        return match ($this) {
            self::SUCCESS => 'Success',
            self::FAILED => 'Failed',
            self::PENDING => 'Pending',
        };
    }
}
