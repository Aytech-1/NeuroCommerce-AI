<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Coupon\Contracts\DiscountRuleRepositoryInterface;
use App\Modules\Coupon\Models\DiscountRule;
use Illuminate\Support\Collection;

/**
 * Class EloquentDiscountRuleRepository
 *
 * @package App\Modules\Coupon\Repositories
 */
class EloquentDiscountRuleRepository extends AbstractRepository implements DiscountRuleRepositoryInterface
{
    public function __construct(DiscountRule $model)
    {
        parent::__construct($model);
    }

    public function getRulesForCoupon(string $couponId): Collection
    {
        return $this->model->newQuery()
            ->where('coupon_id', $couponId)
            ->get();
    }

    public function syncRulesForCoupon(string $couponId, array $rules): void
    {
        $this->model->newQuery()->where('coupon_id', $couponId)->delete();

        foreach ($rules as $rule) {
            $this->model->newQuery()->create([
                'coupon_id' => $couponId,
                'rule_type' => $rule['rule_type'],
                'rule_entity_id' => $rule['rule_entity_id'] ?? null,
                'rule_value' => $rule['rule_value'] ?? null,
            ]);
        }
    }
}
