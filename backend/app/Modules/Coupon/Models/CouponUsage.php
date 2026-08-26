<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use App\Modules\Coupon\Database\Factories\CouponUsageFactory;
use App\Modules\Order\Models\Order;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class CouponUsage
 *
 * @package App\Modules\Coupon\Models
 * @property string $id
 * @property string $coupon_id
 * @property string|null $user_id
 * @property string $order_id
 * @property float $discount_amount
 * @property \Carbon\CarbonInterface $created_at
 * @property-read Coupon $coupon
 * @property-read User|null $user
 * @property-read Order $order
 */
class CouponUsage extends Model
{
    use HasUuid;
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'coupon_usage';

    protected $fillable = [
        'coupon_id',
        'user_id',
        'order_id',
        'discount_amount',
    ];

    protected $casts = [
        'discount_amount' => 'float',
        'created_at' => 'datetime',
    ];

    protected static function newFactory(): CouponUsageFactory
    {
        return CouponUsageFactory::new();
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class, 'coupon_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
