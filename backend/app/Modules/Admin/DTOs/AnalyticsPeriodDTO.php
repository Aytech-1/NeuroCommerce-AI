<?php

declare(strict_types=1);

namespace App\Modules\Admin\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Class AnalyticsPeriodDTO
 *
 * @package App\Modules\Admin\DTOs
 */
class AnalyticsPeriodDTO extends AbstractDTO
{
    public function __construct(
        public readonly CarbonInterface $startDate,
        public readonly CarbonInterface $endDate,
        public readonly string $period = 'last_30_days',
        public readonly string $granularity = 'daily',
        public readonly ?string $segment = null,
        public readonly ?string $sortBy = 'revenue',
        public readonly int $limit = 10
    ) {
    }

    public static function fromArray(array $data): self
    {
        $period = $data['period'] ?? 'last_30_days';
        $now = CarbonImmutable::now();

        switch ($period) {
            case 'today':
                $start = $now->startOfDay();
                $end = $now->endOfDay();
                break;
            case 'yesterday':
                $start = $now->subDay()->startOfDay();
                $end = $now->subDay()->endOfDay();
                break;
            case 'last_7_days':
                $start = $now->subDays(7)->startOfDay();
                $end = $now->endOfDay();
                break;
            case 'last_30_days':
                $start = $now->subDays(30)->startOfDay();
                $end = $now->endOfDay();
                break;
            case 'this_month':
                $start = $now->startOfMonth();
                $end = $now->endOfMonth();
                break;
            case 'last_month':
                $start = $now->subMonth()->startOfMonth();
                $end = $now->subMonth()->endOfMonth();
                break;
            case 'this_year':
                $start = $now->startOfYear();
                $end = $now->endOfYear();
                break;
            case 'custom':
                $start = !empty($data['date_from']) ? CarbonImmutable::parse($data['date_from'])->startOfDay() : $now->subDays(30)->startOfDay();
                $end = !empty($data['date_to']) ? CarbonImmutable::parse($data['date_to'])->endOfDay() : $now->endOfDay();
                break;
            default:
                $start = $now->subDays(30)->startOfDay();
                $end = $now->endOfDay();
                break;
        }

        return new self(
            startDate: $start,
            endDate: $end,
            period: $period,
            granularity: $data['granularity'] ?? 'daily',
            segment: $data['segment'] ?? null,
            sortBy: $data['sort_by'] ?? 'revenue',
            limit: isset($data['limit']) ? (int) $data['limit'] : 10
        );
    }
}
