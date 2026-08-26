<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Models;

use App\Core\Traits\HasUuid;
use App\Core\ValueObjects\Money;
use App\Modules\Shipping\Database\Factories\ShipRateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class ShipRate
 *
 * @package App\Modules\Shipping\Models
 * @property string $id
 * @property string $zone_id
 * @property string $carrier
 * @property string $service_level
 * @property float $min_weight
 * @property float|null $max_weight
 * @property float $min_order_amount
 * @property float $rate
 * @property string $currency_code
 * @property int $estimated_days_min
 * @property int $estimated_days_max
 * @property bool $is_active
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 * @property-read ShipZone $zone
 */
class ShipRate extends Model
{
    use HasUuid;
    use HasFactory;

    protected $table = 'ship_rates';

    protected $fillable = [
        'zone_id',
        'carrier',
        'service_level',
        'min_weight',
        'max_weight',
        'min_order_amount',
        'rate',
        'currency_code',
        'estimated_days_min',
        'estimated_days_max',
        'is_active',
    ];

    protected $casts = [
        'min_weight' => 'float',
        'max_weight' => 'float',
        'min_order_amount' => 'float',
        'rate' => 'float',
        'estimated_days_min' => 'integer',
        'estimated_days_max' => 'integer',
        'is_active' => 'boolean',
    ];

    protected static function newFactory(): ShipRateFactory
    {
        return ShipRateFactory::new();
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(ShipZone::class, 'zone_id');
    }

    public function toMoney(): Money
    {
        return Money::fromDecimal((float) $this->rate, $this->currency_code);
    }
}
