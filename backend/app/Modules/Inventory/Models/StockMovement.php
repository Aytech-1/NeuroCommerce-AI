<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Database\Factories\StockMovementFactory;
use App\Modules\Inventory\Enums\StockMovementType;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class StockMovement
 *
 * Immutable ledger entry recording each inventory modification.
 *
 * @property string $id
 * @property string $inventory_item_id
 * @property StockMovementType $movement_type
 * @property int $quantity
 * @property string|null $reference_type
 * @property string|null $reference_id
 * @property string|null $notes
 * @property string|null $performed_by
 * @property CarbonInterface $created_at
 * @property-read InventoryItem $inventoryItem
 * @property-read User|null $performer
 *
 * @package App\Modules\Inventory\Models
 */
class StockMovement extends Model implements AuditableContract
{
    use HasUuid;
    use HasFactory;
    use Auditable;

    public const UPDATED_AT = null;

    protected $table = 'inv_stock_movements';

    protected $fillable = [
        'inventory_item_id',
        'movement_type',
        'quantity',
        'reference_type',
        'reference_id',
        'notes',
        'performed_by',
    ];

    protected $casts = [
        'movement_type' => StockMovementType::class,
        'quantity' => 'integer',
        'created_at' => 'immutable_datetime',
    ];

    protected static function newFactory(): StockMovementFactory
    {
        return StockMovementFactory::new();
    }

    /**
     * Inventory item being moved.
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    /**
     * Staff member or user who initiated the stock movement.
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Polymorphic reference entity (Order, PurchaseOrder, etc.).
     */
    public function reference(): MorphTo
    {
        return $this->morphTo('reference', 'reference_type', 'reference_id');
    }

    /**
     * Scope movements by type.
     */
    public function scopeOfType(Builder $query, StockMovementType|string $type): Builder
    {
        $value = $type instanceof StockMovementType ? $type->value : $type;
        return $query->where('movement_type', $value);
    }
}
