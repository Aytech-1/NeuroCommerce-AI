<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Enums;

/**
 * Enum AttributeType
 *
 * Defines the data type of a product attribute.
 *
 * @package App\Modules\Catalog\Enums
 */
enum AttributeType: string
{
    case SELECT = 'select';
    case TEXT = 'text';
    case NUMBER = 'number';
    case BOOLEAN = 'boolean';
    case COLOR = 'color';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::SELECT => 'Select (Dropdown)',
            self::TEXT => 'Text',
            self::NUMBER => 'Number',
            self::BOOLEAN => 'Boolean',
            self::COLOR => 'Color Swatch',
        };
    }
}
