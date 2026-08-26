<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Coupon\Database\Factories\DiscountRuleFactory;
use App\Modules\Coupon\Enums\DiscountRuleType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class DiscountRule
 *
 * @package App\Modules\Coupon\Models
 * @property string $id
 * @property string $coupon_id
 * @property DiscountRuleType $rule_type
 * @property string|null $rule_entity_id
 * @property string|null $rule_value
 * @property \Carbon\CarbonInterface $created_at
 * @property-read Coupon $coupon
 */
class DiscountRule extends Model
{
    use HasUuid;
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'discount_rules';

    protected $fillable = [
        'coupon_id',
        'rule_type',
        'rule_entity_id',
        'rule_value',
    ];

    protected $casts = [
        'rule_type' => DiscountRuleType::class,
        'created_at' => 'datetime',
    ];

    protected static function newFactory(): DiscountRuleFactory
    {
        return DiscountRuleFactory::new();
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class, 'coupon_id');
    }
}
