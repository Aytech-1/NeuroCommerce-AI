<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Enums;

/**
 * Enum WeightUnit
 *
 * Supported units of measurement for product weight.
 *
 * @package App\Modules\Catalog\Enums
 */
enum WeightUnit: string
{
    case KG = 'kg';
    case G = 'g';
    case LB = 'lb';
    case OZ = 'oz';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::KG => 'Kilograms (kg)',
            self::G => 'Grams (g)',
            self::LB => 'Pounds (lb)',
            self::OZ => 'Ounces (oz)',
        };
    }
}
