<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Resources;

use App\Modules\Coupon\Models\DiscountRule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class DiscountRuleResource
 *
 * @package App\Modules\Coupon\Resources
 * @mixin DiscountRule
 */
class DiscountRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rule_type' => $this->rule_type instanceof \BackedEnum ? $this->rule_type->value : (string) $this->rule_type,
            'rule_entity_id' => $this->rule_entity_id,
            'rule_value' => $this->rule_value,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
