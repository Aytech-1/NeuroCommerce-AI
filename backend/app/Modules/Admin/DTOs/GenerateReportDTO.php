<?php

declare(strict_types=1);

namespace App\Modules\Admin\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Admin\Enums\ReportFormat;
use App\Modules\Admin\Enums\ReportType;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Class GenerateReportDTO
 *
 * @package App\Modules\Admin\DTOs
 */
class GenerateReportDTO extends AbstractDTO
{
    public function __construct(
        public readonly string|ReportType $type,
        public readonly string|ReportFormat $format,
        public readonly CarbonInterface $startDate,
        public readonly CarbonInterface $endDate,
        public readonly ?array $filters = null,
        public readonly ?string $requestedByUserId = null
    ) {
    }

    public static function fromArray(array $data, ?string $userId = null): self
    {
        $now = CarbonImmutable::now();
        $start = !empty($data['date_from']) ? CarbonImmutable::parse($data['date_from'])->startOfDay() : $now->subDays(30)->startOfDay();
        $end = !empty($data['date_to']) ? CarbonImmutable::parse($data['date_to'])->endOfDay() : $now->endOfDay();

        return new self(
            type: $data['type'] ?? ReportType::ORDERS->value,
            format: $data['format'] ?? ReportFormat::CSV->value,
            startDate: $start,
            endDate: $end,
            filters: $data['filters'] ?? [],
            requestedByUserId: $userId
        );
    }
}
