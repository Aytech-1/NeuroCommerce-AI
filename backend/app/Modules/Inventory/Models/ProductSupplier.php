<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Models;

use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Class ProductSupplier
 *
 * Pivot model for product-supplier relationships with vendor metadata.
 *
 * @property string $product_id
 * @property string $supplier_id
 * @property string|null $supplier_sku
 * @property string|null $cost_price
 * @property int|null $lead_time_days
 * @property bool $is_preferred
 *
 * @package App\Modules\Inventory\Models
 */
class ProductSupplier extends Pivot
{
    public $timestamps = false;
    public $incrementing = false;

    protected $table = 'product_suppliers';

    protected $fillable = [
        'product_id',
        'supplier_id',
        'supplier_sku',
        'cost_price',
        'lead_time_days',
        'is_preferred',
    ];

    protected $casts = [
        'cost_price' => 'decimal:4',
        'lead_time_days' => 'integer',
        'is_preferred' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }
}
