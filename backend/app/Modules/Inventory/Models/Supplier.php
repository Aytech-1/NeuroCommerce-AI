<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\Address;
use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Database\Factories\SupplierFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class Supplier
 *
 * @property string $id
 * @property string $name
 * @property string $code
 * @property string|null $contact_name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $website
 * @property string|null $address_id
 * @property bool $is_active
 * @property-read Address|null $address
 * @property-read Collection|Product[] $products
 *
 * @package App\Modules\Inventory\Models
 */
class Supplier extends Model implements AuditableContract
{
    use HasUuid;
    use HasFactory;
    use SoftDeletes;
    use Auditable;

    protected $table = 'suppliers';

    protected $fillable = [
        'name',
        'code',
        'contact_name',
        'email',
        'phone',
        'website',
        'address_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function newFactory(): SupplierFactory
    {
        return SupplierFactory::new();
    }

    /**
     * Supplier physical address.
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    /**
     * Supplied products.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_suppliers',
            'supplier_id',
            'product_id'
        )->withPivot(['supplier_sku', 'cost_price', 'lead_time_days', 'is_preferred']);
    }

    /**
     * Scope active suppliers.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
