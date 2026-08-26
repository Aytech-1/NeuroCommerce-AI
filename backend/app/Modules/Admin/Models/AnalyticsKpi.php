<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Admin\Database\Factories\AnalyticsKpiFactory;
use App\Modules\Admin\Enums\KpiPeriodType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class AnalyticsKpi
 *
 * @property string $id
 * @property string $metric_name
 * @property float $metric_value
 * @property KpiPeriodType $period_type
 * @property string $period_value
 * @property array|null $metadata
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @package App\Modules\Admin\Models
 */
class AnalyticsKpi extends Model
{
    use HasFactory;
    use HasUuid;
    use Filterable;
    use Sortable;

    protected $table = 'analytics_kpis';

    protected $fillable = [
        'metric_name',
        'metric_value',
        'period_type',
        'period_value',
        'metadata',
    ];

    protected $casts = [
        'metric_value' => 'decimal:4',
        'period_type' => KpiPeriodType::class,
        'metadata' => 'array',
    ];

    protected static function newFactory(): AnalyticsKpiFactory
    {
        return AnalyticsKpiFactory::new();
    }
}
