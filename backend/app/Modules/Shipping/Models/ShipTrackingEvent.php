<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Shipping\Database\Factories\ShipTrackingEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class ShipTrackingEvent
 *
 * @package App\Modules\Shipping\Models
 * @property string $id
 * @property string $shipment_id
 * @property string $status
 * @property string|null $location
 * @property string|null $description
 * @property \Carbon\CarbonInterface $occurred_at
 * @property \Carbon\CarbonInterface $created_at
 * @property-read Shipment $shipment
 */
class ShipTrackingEvent extends Model
{
    use HasUuid;
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'ship_tracking_events';

    protected $fillable = [
        'shipment_id',
        'status',
        'location',
        'description',
        'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    protected static function newFactory(): ShipTrackingEventFactory
    {
        return ShipTrackingEventFactory::new();
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class, 'shipment_id');
    }
}
