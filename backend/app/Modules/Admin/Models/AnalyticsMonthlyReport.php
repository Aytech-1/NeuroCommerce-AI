<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Admin\Database\Factories\AnalyticsMonthlyReportFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class AnalyticsMonthlyReport
 *
 * @property string $id
 * @property string $year_month
 * @property float $total_revenue
 * @property int $total_orders
 * @property int $total_new_customers
 * @property int $total_returning_customers
 * @property float $avg_order_value
 * @property array|null $top_products
 * @property array|null $top_categories
 * @property float $conversion_rate
 * @property \Carbon\Carbon $generated_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @package App\Modules\Admin\Models
 */
class AnalyticsMonthlyReport extends Model
{
    use HasFactory;
    use HasUuid;
    use Filterable;
    use Sortable;

    protected $table = 'analytics_monthly_reports';

    protected $fillable = [
        'year_month',
        'total_revenue',
        'total_orders',
        'total_new_customers',
        'total_returning_customers',
        'avg_order_value',
        'top_products',
        'top_categories',
        'conversion_rate',
        'generated_at',
    ];

    protected $casts = [
        'total_revenue' => 'decimal:4',
        'total_orders' => 'integer',
        'total_new_customers' => 'integer',
        'total_returning_customers' => 'integer',
        'avg_order_value' => 'decimal:4',
        'top_products' => 'array',
        'top_categories' => 'array',
        'conversion_rate' => 'decimal:4',
        'generated_at' => 'datetime',
    ];

    protected static function newFactory(): AnalyticsMonthlyReportFactory
    {
        return AnalyticsMonthlyReportFactory::new();
    }
}
