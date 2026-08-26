<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Admin\Database\Factories\AnalyticsCustomerFactory;
use App\Modules\Admin\Enums\CustomerSegment;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class AnalyticsCustomer
 *
 * @property string $id
 * @property string $user_id
 * @property int $total_orders
 * @property float $total_spent
 * @property float $avg_order_value
 * @property \Carbon\Carbon|null $first_order_at
 * @property \Carbon\Carbon|null $last_order_at
 * @property CustomerSegment $customer_segment
 * @property float $lifetime_value
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read User $user
 *
 * @package App\Modules\Admin\Models
 */
class AnalyticsCustomer extends Model
{
    use HasFactory;
    use HasUuid;
    use Filterable;
    use Sortable;

    protected $table = 'analytics_customer';

    protected $fillable = [
        'user_id',
        'total_orders',
        'total_spent',
        'avg_order_value',
        'first_order_at',
        'last_order_at',
        'customer_segment',
        'lifetime_value',
    ];

    protected $casts = [
        'total_orders' => 'integer',
        'total_spent' => 'decimal:4',
        'avg_order_value' => 'decimal:4',
        'first_order_at' => 'datetime',
        'last_order_at' => 'datetime',
        'customer_segment' => CustomerSegment::class,
        'lifetime_value' => 'decimal:4',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected static function newFactory(): AnalyticsCustomerFactory
    {
        return AnalyticsCustomerFactory::new();
    }
}
