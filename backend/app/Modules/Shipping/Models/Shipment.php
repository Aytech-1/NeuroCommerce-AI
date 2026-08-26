<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Order\Models\Order;
use App\Modules\Shipping\Database\Factories\ShipmentFactory;
use App\Modules\Shipping\Enums\ShipmentStatus;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class Shipment
 *
 * @package App\Modules\Shipping\Models
 * @property string $id
 * @property string $order_id
 * @property string $warehouse_id
 * @property string $carrier
 * @property string|null $service_level
 * @property string|null $tracking_number
 * @property string|null $tracking_url
 * @property ShipmentStatus $status
 * @property \Carbon\CarbonInterface|null $shipped_at
 * @property string|null $estimated_delivery
 * @property \Carbon\CarbonInterface|null $delivered_at
 * @property float|null $weight
 * @property float|null $cost
 * @property string|null $label_url
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 * @property-read Order $order
 * @property-read Warehouse $warehouse
 * @property-read Collection|ShipTrackingEvent[] $trackingEvents
 */
class Shipment extends Model implements AuditableContract
{
    use HasUuid;
    use Auditable;
    use \OwenIt\Auditing\Auditable;
    use HasFactory;

    protected $table = 'shipments';

    protected $fillable = [
        'order_id',
        'warehouse_id',
        'carrier',
        'service_level',
        'tracking_number',
        'tracking_url',
        'status',
        'shipped_at',
        'estimated_delivery',
        'delivered_at',
        'weight',
        'cost',
        'label_url',
    ];

    protected $casts = [
        'status' => ShipmentStatus::class,
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'estimated_delivery' => 'date',
        'weight' => 'float',
        'cost' => 'float',
    ];

    protected static function newFactory(): ShipmentFactory
    {
        return ShipmentFactory::new();
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function trackingEvents(): HasMany
    {
        return $this->hasMany(ShipTrackingEvent::class, 'shipment_id')->orderBy('occurred_at', 'desc');
    }
}
