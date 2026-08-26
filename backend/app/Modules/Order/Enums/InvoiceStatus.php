<?php

declare(strict_types=1);

namespace App\Modules\Order\Enums;

/**
 * Enum InvoiceStatus
 *
 * Lifecycle states for commercial invoices.
 *
 * @package App\Modules\Order\Enums
 */
enum InvoiceStatus: string
{
    case DRAFT = 'draft';
    case ISSUED = 'issued';
    case PAID = 'paid';
    case VOID = 'void';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::ISSUED => 'Issued',
            self::PAID => 'Paid',
            self::VOID => 'Void',
        };
    }
}
