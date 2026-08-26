<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Coupon\Database\Factories\CouponFactory;
use App\Modules\Coupon\Enums\CouponType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class Coupon
 *
 * @package App\Modules\Coupon\Models
 * @property string $id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property CouponType $type
 * @property float $value
 * @property float|null $min_order_amount
 * @property float|null $max_discount_amount
 * @property int|null $usage_limit
 * @property int $usage_limit_per_user
 * @property int $times_used
 * @property \Carbon\CarbonInterface|null $starts_at
 * @property \Carbon\CarbonInterface|null $expires_at
 * @property bool $is_active
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 * @property \Carbon\CarbonInterface|null $deleted_at
 * @property-read Collection|CouponUsage[] $usages
 * @property-read Collection|DiscountRule[] $rules
 * @property-read Collection|Category[] $categories
 * @property-read Collection|Product[] $products
 */
class Coupon extends Model implements AuditableContract
{
    use HasUuid;
    use Auditable;
    use \OwenIt\Auditing\Auditable;
    use HasFactory;
    use SoftDeletes;

    protected $table = 'coupons';

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'usage_limit_per_user',
        'times_used',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'type' => CouponType::class,
        'value' => 'float',
        'min_order_amount' => 'float',
        'max_discount_amount' => 'float',
        'usage_limit' => 'integer',
        'usage_limit_per_user' => 'integer',
        'times_used' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected static function newFactory(): CouponFactory
    {
        return CouponFactory::new();
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class, 'coupon_id');
    }

    public function rules(): HasMany
    {
        return $this->hasMany(DiscountRule::class, 'coupon_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'coupon_categories', 'coupon_id', 'category_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'coupon_products', 'coupon_id', 'product_id');
    }

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        if ($this->usage_limit !== null && $this->times_used >= $this->usage_limit) {
            return false;
        }

        return true;
    }
}
