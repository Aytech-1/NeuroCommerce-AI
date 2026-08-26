<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class ProductTranslation
 *
 * @property string $id
 * @property string $product_id
 * @property string $locale
 * @property string $name
 * @property string|null $description
 * @property string|null $short_description
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property-read Product $product
 *
 * @package App\Modules\Catalog\Models
 */
class ProductTranslation extends Model
{
    use HasUuid;

    protected $table = 'product_translations';

    protected $fillable = [
        'product_id',
        'locale',
        'name',
        'description',
        'short_description',
        'meta_title',
        'meta_description',
    ];

    /**
     * Parent product relationship.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
