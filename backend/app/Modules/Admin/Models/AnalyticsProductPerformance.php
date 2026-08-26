<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Admin\Database\Factories\AnalyticsProductPerformanceFactory;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class AnalyticsProductPerformance
 *
 * @property string $id
 * @property string $date
 * @property string $product_id
 * @property int $views
 * @property int $add_to_cart_count
 * @property int $purchase_count
 * @property float $revenue
 * @property float $conversion_rate
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read Product $product
 *
 * @package App\Modules\Admin\Models
 */
class AnalyticsProductPerformance extends Model
{
    use HasFactory;
    use HasUuid;
    use Filterable;
    use Sortable;

    protected $table = 'analytics_product_performance';

    protected $fillable = [
        'date',
        'product_id',
        'views',
        'add_to_cart_count',
        'purchase_count',
        'revenue',
        'conversion_rate',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'views' => 'integer',
        'add_to_cart_count' => 'integer',
        'purchase_count' => 'integer',
        'revenue' => 'decimal:4',
        'conversion_rate' => 'decimal:4',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    protected static function newFactory(): AnalyticsProductPerformanceFactory
    {
        return AnalyticsProductPerformanceFactory::new();
    }
}
