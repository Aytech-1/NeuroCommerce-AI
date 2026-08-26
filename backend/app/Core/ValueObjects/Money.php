<?php

declare(strict_types=1);

namespace App\Core\ValueObjects;

use InvalidArgumentException;

/**
 * Class Money
 *
 * Immutable value object for monetary amounts.
 *
 * @package   App\Core\ValueObjects
 * @author    NeuroCommerce AI
 * @since     1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
final class Money
{
    /**
     * Money constructor.
     *
     * @param int $amount Amount in cents.
     * @param string $currency The ISO 4217 currency code.
     */
    private function __construct(
        private readonly int $amount,
        private readonly string $currency
    ) {
    }

    /**
     * Create a Money instance from cents.
     *
     * @param int $amount
     * @param string $currency
     * @return self
     */
    public static function fromCents(int $amount, string $currency): self
    {
        return new self($amount, strtoupper($currency));
    }

    /**
     * Create a Money instance from a decimal amount.
     *
     * @param float $amount
     * @param string $currency
     * @return self
     */
    public static function fromDecimal(float $amount, string $currency): self
    {
        return new self((int) round($amount * 100), strtoupper($currency));
    }

    /**
     * Get the amount in cents.
     *
     * @return int
     */
    public function getAmount(): int
    {
        return $this->amount;
    }

    /**
     * Get the currency code.
     *
     * @return string
     */
    public function getCurrency(): string
    {
        return $this->currency;
    }

    /**
     * Get the formatted decimal amount.
     *
     * @return float
     */
    public function getFormattedAmount(): float
    {
        return $this->amount / 100;
    }

    /**
     * Add another Money instance.
     *
     * @param Money $money
     * @return self
     * @throws InvalidArgumentException
     */
    public function add(Money $money): self
    {
        $this->assertSameCurrency($money);
        return new self($this->amount + $money->getAmount(), $this->currency);
    }

    /**
     * Subtract another Money instance.
     *
     * @param Money $money
     * @return self
     * @throws InvalidArgumentException
     */
    public function subtract(Money $money): self
    {
        $this->assertSameCurrency($money);
        return new self($this->amount - $money->getAmount(), $this->currency);
    }

    /**
     * Multiply the amount by a multiplier.
     *
     * @param float $multiplier
     * @return self
     */
    public function multiply(float $multiplier): self
    {
        return new self((int) round($this->amount * $multiplier), $this->currency);
    }

    /**
     * Check if this instance equals another Money instance.
     *
     * @param Money $money
     * @return bool
     */
    public function equals(Money $money): bool
    {
        return $this->amount === $money->getAmount() && $this->currency === $money->getCurrency();
    }

    /**
     * Check if the amount is zero.
     *
     * @return bool
     */
    public function isZero(): bool
    {
        return $this->amount === 0;
    }

    /**
     * Check if the amount is strictly positive.
     *
     * @return bool
     */
    public function isPositive(): bool
    {
        return $this->amount > 0;
    }

    /**
     * Convert the value object to an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'amount'   => $this->amount,
            'currency' => $this->currency,
        ];
    }

    /**
     * Ensure the given Money has the same currency.
     *
     * @param Money $money
     * @return void
     * @throws InvalidArgumentException
     */
    private function assertSameCurrency(Money $money): void
    {
        if ($this->currency !== $money->getCurrency()) {
            throw new InvalidArgumentException(sprintf(
                'Currency mismatch: expected %s, got %s',
                $this->currency,
                $money->getCurrency()
            ));
        }
    }
}
