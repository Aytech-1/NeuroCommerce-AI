<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Catalog\Database\Factories\ProductAttributeFactory;
use App\Modules\Catalog\Enums\AttributeType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class ProductAttribute
 *
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property AttributeType $type
 * @property bool $is_filterable
 * @property bool $is_variant
 * @property int $sort_order
 * @property-read Collection|AttributeValue[] $values
 *
 * @package App\Modules\Catalog\Models
 */
class ProductAttribute extends Model
{
    use HasUuid;
    use HasFactory;

    protected static function newFactory(): ProductAttributeFactory
    {
        return ProductAttributeFactory::new();
    }

    public const UPDATED_AT = null;

    protected $table = 'product_attributes';

    protected $fillable = [
        'name',
        'slug',
        'type',
        'is_filterable',
        'is_variant',
        'sort_order',
    ];

    protected $casts = [
        'type' => AttributeType::class,
        'is_filterable' => 'boolean',
        'is_variant' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Predefined values / options for this attribute.
     */
    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class, 'attribute_id')->orderBy('sort_order', 'asc');
    }

    /**
     * Scope for filterable attributes.
     */
    public function scopeFilterable(Builder $query): Builder
    {
        return $query->where('is_filterable', true);
    }

    /**
     * Scope for variant-defining attributes.
     */
    public function scopeVariant(Builder $query): Builder
    {
        return $query->where('is_variant', true);
    }
}
