<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Catalog\Database\Factories\TagFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Class Tag
 *
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property-read Collection|Product[] $products
 *
 * @package App\Modules\Catalog\Models
 */
class Tag extends Model
{
    use HasUuid;
    use HasFactory;

    protected static function newFactory(): TagFactory
    {
        return TagFactory::new();
    }

    protected $table = 'tags';

    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Products tagged with this tag.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_tags', 'tag_id', 'product_id');
    }
}
