<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Catalog\Database\Factories\AttributeValueFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Class AttributeValue
 *
 * @property string $id
 * @property string $attribute_id
 * @property string $value
 * @property string $slug
 * @property string|null $color_hex
 * @property int $sort_order
 * @property-read ProductAttribute $attribute
 * @property-read Collection|ProductVariant[] $variants
 *
 * @package App\Modules\Catalog\Models
 */
class AttributeValue extends Model
{
    use HasUuid;
    use HasFactory;

    protected static function newFactory(): AttributeValueFactory
    {
        return AttributeValueFactory::new();
    }

    public $timestamps = false;

    protected $table = 'attribute_values';

    protected $fillable = [
        'attribute_id',
        'value',
        'slug',
        'color_hex',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Parent attribute definition.
     */
    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ProductAttribute::class, 'attribute_id');
    }

    /**
     * Variants linked to this attribute option value.
     */
    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductVariant::class,
            'product_variant_attributes',
            'attribute_value_id',
            'variant_id'
        );
    }
}
