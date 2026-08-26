<?php

declare(strict_types=1);

namespace App\Core\ValueObjects;

/**
 * Class Address
 *
 * Immutable address value object.
 *
 * @package   App\Core\ValueObjects
 * @author    NeuroCommerce AI
 * @since     1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
final class Address
{
    /**
     * Address constructor.
     *
     * @param string $line1
     * @param string|null $line2
     * @param string $city
     * @param string|null $state
     * @param string $postalCode
     * @param string $countryCode
     * @param string|null $phone
     */
    public function __construct(
        private readonly string $line1,
        private readonly ?string $line2,
        private readonly string $city,
        private readonly ?string $state,
        private readonly string $postalCode,
        private readonly string $countryCode,
        private readonly ?string $phone = null
    ) {
    }

    /**
     * Convert the address to an array.
     *
     * @return array<string, string|null>
     */
    public function toArray(): array
    {
        return [
            'line1'       => $this->line1,
            'line2'       => $this->line2,
            'city'        => $this->city,
            'state'       => $this->state,
            'postalCode'  => $this->postalCode,
            'countryCode' => $this->countryCode,
            'phone'       => $this->phone,
        ];
    }

    /**
     * Check if this address equals another Address instance.
     *
     * @param Address $address
     * @return bool
     */
    public function equals(Address $address): bool
    {
        return $this->toArray() === $address->toArray();
    }

    /**
     * Get the full address as a formatted string.
     *
     * @return string
     */
    public function getFullAddress(): string
    {
        $parts = [
            $this->line1,
            $this->line2,
            $this->city,
            $this->state,
            $this->postalCode,
            $this->countryCode,
        ];

        // Filter out null or empty strings and join
        return implode(', ', array_filter($parts, fn($part) => !empty($part)));
    }
}
