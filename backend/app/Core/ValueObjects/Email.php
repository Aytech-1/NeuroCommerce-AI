<?php

declare(strict_types=1);

namespace App\Core\ValueObjects;

use InvalidArgumentException;

/**
 * Class Email
 *
 * Immutable email value object with validation.
 *
 * @package   App\Core\ValueObjects
 * @author    NeuroCommerce AI
 * @since     1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
final class Email
{
    /**
     * @var string
     */
    private readonly string $value;

    /**
     * Email constructor.
     *
     * @param string $value
     * @throws InvalidArgumentException
     */
    public function __construct(string $value)
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException(sprintf('Invalid email address format: %s', $value));
        }

        $this->value = strtolower($value);
    }

    /**
     * Get the full email address.
     *
     * @return string
     */
    public function getValue(): string
    {
        return $this->value;
    }

    /**
     * Get the domain part of the email.
     *
     * @return string
     */
    public function getDomain(): string
    {
        $parts = explode('@', $this->value);
        return $parts[1] ?? '';
    }

    /**
     * Get the local part of the email.
     *
     * @return string
     */
    public function getLocal(): string
    {
        $parts = explode('@', $this->value);
        return $parts[0] ?? '';
    }

    /**
     * Check if this instance equals another Email instance.
     *
     * @param Email $email
     * @return bool
     */
    public function equals(Email $email): bool
    {
        return $this->value === $email->getValue();
    }

    /**
     * Convert the value object to a string.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->value;
    }

    /**
     * Magic method to cast to string.
     *
     * @return string
     */
    public function __toString(): string
    {
        return $this->value;
    }
}
