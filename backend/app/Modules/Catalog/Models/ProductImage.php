<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class ProductImage
 *
 * @property string $id
 * @property string $product_id
 * @property string $url
 * @property string|null $alt_text
 * @property int $sort_order
 * @property bool $is_primary
 * @property-read Product $product
 *
 * @package App\Modules\Catalog\Models
 */
class ProductImage extends Model
{
    use HasUuid;

    public const UPDATED_AT = null;

    protected $table = 'product_images';

    protected $fillable = [
        'product_id',
        'url',
        'alt_text',
        'sort_order',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Parent product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
