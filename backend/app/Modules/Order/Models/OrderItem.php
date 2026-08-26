<?php

declare(strict_types=1);

namespace App\Modules\Order\Models;

use App\Core\Traits\HasUuid;
use App\Core\ValueObjects\Money;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Order\Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class OrderItem
 *
 * Immutable historical line item snapshot capturing product title, SKU,
 * variant details, unit pricing, taxes, and subtotal at the moment of order creation.
 *
 * @package App\Modules\Order\Models
 * @property string $id
 * @property string $order_id
 * @property string $product_id
 * @property string|null $variant_id
 * @property string $product_name
 * @property string $product_sku
 * @property string|null $variant_name
 * @property int $quantity
 * @property string $unit_price
 * @property string $tax_amount
 * @property string $discount_amount
 * @property string $line_total
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface|null $updated_at
 * @property-read Order $order
 * @property-read Product $product
 * @property-read ProductVariant|null $variant
 */
class OrderItem extends Model
{
    use HasUuid;
    use HasFactory;

    protected $table = 'order_items';

    protected $fillable = [
        'order_id',
        'product_id',
        'variant_id',
        'product_name',
        'product_sku',
        'variant_name',
        'quantity',
        'unit_price',
        'tax_amount',
        'discount_amount',
        'line_total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'float',
        'tax_amount' => 'float',
        'discount_amount' => 'float',
        'line_total' => 'float',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): OrderItemFactory
    {
        return OrderItemFactory::new();
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function calculateLineTotal(): Money
    {
        $currency = $this->order?->currency_code ?: 'USD';
        return Money::fromDecimal((float) $this->line_total, $currency);
    }
}
