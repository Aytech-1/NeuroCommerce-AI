<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Admin\Database\Factories\AnalyticsDailySalesFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class AnalyticsDailySales
 *
 * @property string $id
 * @property string $date
 * @property int $total_orders
 * @property float $total_revenue
 * @property float $total_tax
 * @property float $total_shipping
 * @property float $total_discounts
 * @property float $net_revenue
 * @property float $avg_order_value
 * @property int $total_items_sold
 * @property int $unique_customers
 * @property int $new_customers
 * @property int $returning_customers
 * @property int $refund_count
 * @property float $refund_amount
 * @property string $currency_code
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @package App\Modules\Admin\Models
 */
class AnalyticsDailySales extends Model
{
    use HasFactory;
    use HasUuid;
    use Filterable;
    use Sortable;

    protected $table = 'analytics_daily_sales';

    protected $fillable = [
        'date',
        'total_orders',
        'total_revenue',
        'total_tax',
        'total_shipping',
        'total_discounts',
        'net_revenue',
        'avg_order_value',
        'total_items_sold',
        'unique_customers',
        'new_customers',
        'returning_customers',
        'refund_count',
        'refund_amount',
        'currency_code',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'total_orders' => 'integer',
        'total_revenue' => 'decimal:4',
        'total_tax' => 'decimal:4',
        'total_shipping' => 'decimal:4',
        'total_discounts' => 'decimal:4',
        'net_revenue' => 'decimal:4',
        'avg_order_value' => 'decimal:4',
        'total_items_sold' => 'integer',
        'unique_customers' => 'integer',
        'new_customers' => 'integer',
        'returning_customers' => 'integer',
        'refund_count' => 'integer',
        'refund_amount' => 'decimal:4',
    ];

    protected static function newFactory(): AnalyticsDailySalesFactory
    {
        return AnalyticsDailySalesFactory::new();
    }
}
