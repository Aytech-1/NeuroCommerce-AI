<?php

declare(strict_types=1);

namespace App\Core\ValueObjects;

use Carbon\CarbonImmutable;
use InvalidArgumentException;

/**
 * Class DateRange
 *
 * Immutable date range value object.
 *
 * @package   App\Core\ValueObjects
 * @author    NeuroCommerce AI
 * @since     1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
final class DateRange
{
    /**
     * DateRange constructor.
     *
     * @param CarbonImmutable $startDate
     * @param CarbonImmutable $endDate
     * @throws InvalidArgumentException
     */
    public function __construct(
        private readonly CarbonImmutable $startDate,
        private readonly CarbonImmutable $endDate
    ) {
        if ($startDate->isAfter($endDate)) {
            throw new InvalidArgumentException('Start date must be before or equal to end date.');
        }
    }

    /**
     * Check if a date is within the date range (inclusive).
     *
     * @param CarbonImmutable $date
     * @return bool
     */
    public function contains(CarbonImmutable $date): bool
    {
        return $date->betweenIncluded($this->startDate, $this->endDate);
    }

    /**
     * Check if this date range overlaps with another date range.
     *
     * @param DateRange $range
     * @return bool
     */
    public function overlaps(DateRange $range): bool
    {
        return $this->startDate->lessThanOrEqualTo($range->endDate)
            && $this->endDate->greaterThanOrEqualTo($range->startDate);
    }

    /**
     * Get the total number of days in the range (inclusive).
     *
     * @return int
     */
    public function getDays(): int
    {
        return (int) $this->startDate->diffInDays($this->endDate) + 1;
    }

    /**
     * Convert the date range to an array.
     *
     * @return array<string, string>
     */
    public function toArray(): array
    {
        return [
            'startDate' => $this->startDate->toIso8601String(),
            'endDate'   => $this->endDate->toIso8601String(),
        ];
    }
}
