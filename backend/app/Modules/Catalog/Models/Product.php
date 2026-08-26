<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Enums\ProductVisibility;
use App\Modules\Catalog\Enums\WeightUnit;
use App\Modules\Core\Models\Currency;
use App\Modules\Catalog\Database\Factories\ProductFactory;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class Product
 *
 * @property string $id
 * @property string $sku
 * @property string $slug
 * @property string $name
 * @property string|null $description
 * @property string|null $short_description
 * @property string|null $category_id
 * @property string|null $brand_id
 * @property string $base_price
 * @property string|null $compare_at_price
 * @property string|null $cost_price
 * @property string $currency_code
 * @property string $tax_class
 * @property string|null $weight
 * @property WeightUnit $weight_unit
 * @property string|null $length
 * @property string|null $width
 * @property string|null $height
 * @property bool $is_digital
 * @property bool $is_featured
 * @property bool $is_active
 * @property ProductStatus $status
 * @property ProductVisibility $visibility
 * @property string $avg_rating
 * @property int $review_count
 * @property int $total_sold
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property CarbonInterface|null $published_at
 * @property-read Category|null $category
 * @property-read Brand|null $brand
 * @property-read Collection|ProductVariant[] $variants
 * @property-read Collection|ProductImage[] $images
 * @property-read ProductImage|null $primaryImage
 * @property-read Collection|Category[] $categories
 * @property-read Collection|Tag[] $tags
 * @property-read Collection|ProductTranslation[] $translations
 *
 * @package App\Modules\Catalog\Models
 */
class Product extends Model implements AuditableContract
{
    use HasUuid;
    use HasFactory;
    use SoftDeletes;
    use Auditable;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): ProductFactory
    {
        return ProductFactory::new();
    }

    protected $table = 'products';

    protected $fillable = [
        'sku',
        'slug',
        'name',
        'description',
        'short_description',
        'category_id',
        'brand_id',
        'base_price',
        'compare_at_price',
        'cost_price',
        'currency_code',
        'tax_class',
        'weight',
        'weight_unit',
        'length',
        'width',
        'height',
        'is_digital',
        'is_featured',
        'is_active',
        'status',
        'visibility',
        'avg_rating',
        'review_count',
        'total_sold',
        'meta_title',
        'meta_description',
        'published_at',
    ];

    protected $casts = [
        'status' => ProductStatus::class,
        'visibility' => ProductVisibility::class,
        'weight_unit' => WeightUnit::class,
        'is_digital' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'base_price' => 'decimal:4',
        'compare_at_price' => 'decimal:4',
        'cost_price' => 'decimal:4',
        'weight' => 'decimal:4',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'avg_rating' => 'decimal:2',
        'review_count' => 'integer',
        'total_sold' => 'integer',
        'published_at' => 'datetime',
    ];

    /**
     * Primary category relationship.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Secondary categories relationship.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'product_categories', 'product_id', 'category_id');
    }

    /**
     * Brand relationship.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    /**
     * Currency relationship.
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_code', 'code');
    }

    /**
     * Product variants relationship.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'product_id')->orderBy('sort_order', 'asc');
    }

    /**
     * Gallery images relationship.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id')->orderBy('sort_order', 'asc');
    }

    /**
     * Primary product image.
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class, 'product_id')->where('is_primary', true);
    }

    /**
     * Translations relationship.
     */
    public function translations(): HasMany
    {
        return $this->hasMany(ProductTranslation::class, 'product_id');
    }

    /**
     * Tags relationship.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tags', 'product_id', 'tag_id');
    }

    /**
     * Scope for active products.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for published products.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ProductStatus::ACTIVE->value);
    }

    /**
     * Scope for visible products in public storefront.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('status', ProductStatus::ACTIVE->value)
            ->whereIn('visibility', [
                ProductVisibility::VISIBLE->value,
                ProductVisibility::CATALOG_ONLY->value,
                ProductVisibility::SEARCH_ONLY->value,
            ]);
    }

    /**
     * Scope for featured products.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for products with active sale discounts.
     */
    public function scopeOnSale(Builder $query): Builder
    {
        return $query->whereNotNull('compare_at_price')
            ->whereColumn('compare_at_price', '>', 'base_price');
    }
}
