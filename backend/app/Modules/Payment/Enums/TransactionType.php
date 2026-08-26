<?php

declare(strict_types=1);

namespace App\Modules\Payment\Enums;

/**
 * Enum TransactionType
 *
 * @package App\Modules\Payment\Enums
 */
enum TransactionType: string
{
    case AUTHORIZATION = 'authorization';
    case CAPTURE = 'capture';
    case VOID = 'void';
    case REFUND = 'refund';
    case CHARGEBACK = 'chargeback';

    public function label(): string
    {
        return match ($this) {
            self::AUTHORIZATION => 'Authorization',
            self::CAPTURE => 'Capture',
            self::VOID => 'Void',
            self::REFUND => 'Refund',
            self::CHARGEBACK => 'Chargeback',
        };
    }
}
