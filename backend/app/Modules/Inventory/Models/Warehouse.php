<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\Address;
use App\Modules\Inventory\Database\Factories\WarehouseFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class Warehouse
 *
 * @property string $id
 * @property string $name
 * @property string $code
 * @property string|null $address_id
 * @property bool $is_active
 * @property bool $is_default
 * @property int $priority
 * @property-read Address|null $address
 * @property-read Collection|InventoryItem[] $inventoryItems
 *
 * @package App\Modules\Inventory\Models
 */
class Warehouse extends Model implements AuditableContract
{
    use HasUuid;
    use HasFactory;
    use Auditable;

    protected $table = 'warehouses';

    protected $fillable = [
        'name',
        'code',
        'address_id',
        'is_active',
        'is_default',
        'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'priority' => 'integer',
    ];

    protected static function newFactory(): WarehouseFactory
    {
        return WarehouseFactory::new();
    }

    /**
     * Address relationship.
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    /**
     * Inventory items in this warehouse.
     */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'warehouse_id');
    }

    /**
     * Scope active warehouses.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
