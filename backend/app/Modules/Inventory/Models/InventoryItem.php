<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Inventory\Database\Factories\InventoryItemFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class InventoryItem
 *
 * @property string $id
 * @property string $product_id
 * @property string|null $variant_id
 * @property string $warehouse_id
 * @property int $quantity_on_hand
 * @property int $quantity_reserved
 * @property int $quantity_available
 * @property int $reorder_point
 * @property int $reorder_quantity
 * @property-read Product $product
 * @property-read ProductVariant|null $variant
 * @property-read Warehouse $warehouse
 * @property-read Collection|StockMovement[] $stockMovements
 *
 * @package App\Modules\Inventory\Models
 */
class InventoryItem extends Model implements AuditableContract
{
    use HasUuid;
    use HasFactory;
    use Auditable;

    public const CREATED_AT = null;
    public const UPDATED_AT = 'updated_at';

    protected $table = 'inventory_items';

    protected $fillable = [
        'product_id',
        'variant_id',
        'warehouse_id',
        'quantity_on_hand',
        'quantity_reserved',
        'reorder_point',
        'reorder_quantity',
    ];

    protected $casts = [
        'quantity_on_hand' => 'integer',
        'quantity_reserved' => 'integer',
        'quantity_available' => 'integer',
        'reorder_point' => 'integer',
        'reorder_quantity' => 'integer',
    ];

    protected static function newFactory(): InventoryItemFactory
    {
        return InventoryItemFactory::new();
    }

    /**
     * Parent Product relationship.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Specific Variant relationship.
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /**
     * Warehouse location relationship.
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    /**
     * Immutable stock movements history.
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'inventory_item_id');
    }

    /**
     * Scope low stock items.
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereRaw('quantity_on_hand - quantity_reserved <= reorder_point')
                     ->whereRaw('quantity_on_hand - quantity_reserved > 0');
    }

    /**
     * Scope out of stock items.
     */
    public function scopeOutOfStock(Builder $query): Builder
    {
        return $query->whereRaw('quantity_on_hand - quantity_reserved <= 0');
    }

    /**
     * Scope available in-stock items.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->whereRaw('quantity_on_hand - quantity_reserved > 0');
    }

    /**
     * Check if item is low on stock.
     */
    public function isLowStock(): bool
    {
        return $this->quantity_available <= $this->reorder_point && $this->quantity_available > 0;
    }

    /**
     * Check if item is completely exhausted.
     */
    public function isOutOfStock(): bool
    {
        return $this->quantity_available <= 0;
    }
}
