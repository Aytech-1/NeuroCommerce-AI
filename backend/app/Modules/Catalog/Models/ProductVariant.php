<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Catalog\Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class ProductVariant
 *
 * @property string $id
 * @property string $product_id
 * @property string $sku
 * @property string|null $name
 * @property string|null $price
 * @property string|null $compare_at_price
 * @property string|null $cost_price
 * @property string|null $weight
 * @property string|null $barcode
 * @property string|null $image_url
 * @property bool $is_active
 * @property int $sort_order
 * @property-read Product $product
 * @property-read Collection|AttributeValue[] $attributeValues
 * @property-read Collection|ProductAttribute[] $attributes
 *
 * @package App\Modules\Catalog\Models
 */
class ProductVariant extends Model implements AuditableContract
{
    use HasUuid;
    use SoftDeletes;
    use Auditable;

    protected $table = 'product_variants';

    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'price',
        'compare_at_price',
        'cost_price',
        'weight',
        'barcode',
        'image_url',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'price' => 'decimal:4',
        'compare_at_price' => 'decimal:4',
        'cost_price' => 'decimal:4',
        'weight' => 'decimal:4',
    ];

    /**
     * Parent product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Attribute option values defining this variant.
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'product_variant_attributes',
            'variant_id',
            'attribute_value_id'
        )->withPivot('attribute_id');
    }

    /**
     * Attributes defining this variant.
     */
    public function attributes(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductAttribute::class,
            'product_variant_attributes',
            'variant_id',
            'attribute_id'
        );
    }

    /**
     * Scope for active variants.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
