<?php

declare(strict_types=1);

namespace App\Modules\Admin\Enums;

/**
 * Enum ReportFormat
 *
 * @package App\Modules\Admin\Enums
 */
enum ReportFormat: string
{
    case CSV = 'csv';
    case JSON = 'json';
    case PDF = 'pdf';
}
