<?php

declare(strict_types=1);

namespace App\Shared\Enums;

/**
 * Enum UserType
 *
 * Represents the type of user in the system.
 *
 * @package App\Shared\Enums
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
enum UserType: string
{
    case CUSTOMER = 'customer';
    case STAFF = 'staff';
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super_admin';

    /**
     * Get the human-readable label for the user type.
     *
     * @return string
     */
    public function label(): string
    {
        return match ($this) {
            self::CUSTOMER => 'Customer',
            self::STAFF => 'Staff',
            self::ADMIN => 'Admin',
            self::SUPER_ADMIN => 'Super Admin',
        };
    }
}
