<?php

declare(strict_types=1);

namespace App\Modules\Cart\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Core\ValueObjects\Money;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * CartItem Eloquent Model
 *
 * Represents an individual line item in a shopping cart with a snapshotted unit price.
 *
 * @property string $id
 * @property string $cart_id
 * @property string $product_id
 * @property string|null $variant_id
 * @property int $quantity
 * @property string $unit_price
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class CartItem extends Model implements AuditableContract
{
    use HasUuid;
    use Auditable;
    use HasFactory;

    protected $table = 'cart_items';

    protected $fillable = [
        'cart_id',
        'product_id',
        'variant_id',
        'quantity',
        'unit_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:4',
        ];
    }

    /**
     * Parent cart relationship.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'cart_id');
    }

    /**
     * Associated catalog product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Associated catalog product variant (optional).
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /**
     * Calculate line total as a Money ValueObject.
     */
    public function calculateLineTotal(): Money
    {
        $currency = $this->cart?->currency_code ?: 'USD';
        $unitMoney = Money::fromDecimal((float) $this->unit_price, $currency);

        return Money::fromCents($unitMoney->getAmount() * $this->quantity, $currency);
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return \App\Modules\Cart\Database\Factories\CartItemFactory::new();
    }
}
