<?php

declare(strict_types=1);

namespace App\Modules\Cart\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * WishlistItem Eloquent Model
 *
 * Represents an individual saved product/variant in a customer wishlist.
 *
 * @property string $id
 * @property string $wishlist_id
 * @property string $product_id
 * @property string|null $variant_id
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon $created_at
 */
class WishlistItem extends Model implements AuditableContract
{
    use HasUuid;
    use Auditable;
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'wishlist_items';

    protected $fillable = [
        'wishlist_id',
        'product_id',
        'variant_id',
        'notes',
    ];

    /**
     * Parent wishlist.
     */
    public function wishlist(): BelongsTo
    {
        return $this->belongsTo(Wishlist::class, 'wishlist_id');
    }

    /**
     * Associated product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Associated product variant (optional).
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return \App\Modules\Cart\Database\Factories\WishlistItemFactory::new();
    }
}
