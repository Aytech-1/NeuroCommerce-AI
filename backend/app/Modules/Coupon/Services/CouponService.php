<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Coupon\Contracts\CouponRepositoryInterface;
use App\Modules\Coupon\Contracts\CouponUsageRepositoryInterface;
use App\Modules\Coupon\Contracts\DiscountRuleRepositoryInterface;
use App\Modules\Coupon\DTOs\CouponValidationResultDTO;
use App\Modules\Coupon\DTOs\CreateCouponDTO;
use App\Modules\Coupon\DTOs\UpdateCouponDTO;
use App\Modules\Coupon\Events\CouponApplied;
use App\Modules\Coupon\Events\CouponRedeemed;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Coupon\Models\CouponUsage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Class CouponService
 *
 * Orchestrates coupon management, validation, application, and atomic usage recording.
 *
 * @package App\Modules\Coupon\Services
 */
class CouponService extends AbstractService
{
    public function __construct(
        protected readonly CouponRepositoryInterface $couponRepository,
        protected readonly CouponUsageRepositoryInterface $usageRepository,
        protected readonly DiscountRuleRepositoryInterface $ruleRepository,
        protected readonly CouponValidator $validator,
        protected readonly DiscountCalculator $calculator,
    ) {}

    public function listCoupons(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->couponRepository->paginateForAdmin($filters, $perPage);
    }

    public function getCouponById(string $id): Coupon
    {
        /** @var Coupon|null $coupon */
        $coupon = $this->couponRepository->findById($id);
        if (!$coupon) {
            throw new EntityNotFoundException('Coupon', $id);
        }

        return $coupon->load(['rules', 'categories', 'products']);
    }

    public function getCouponByCode(string $code): ?Coupon
    {
        return $this->couponRepository->findByCode($code);
    }

    public function createCoupon(CreateCouponDTO $dto): Coupon
    {
        return $this->executeInTransaction(function () use ($dto) {
            /** @var Coupon $coupon */
            $coupon = $this->couponRepository->create([
                'code' => $dto->code,
                'name' => $dto->name,
                'description' => $dto->description,
                'type' => $dto->type,
                'value' => $dto->value,
                'min_order_amount' => $dto->minOrderAmount,
                'max_discount_amount' => $dto->maxDiscountAmount,
                'usage_limit' => $dto->usageLimit,
                'usage_limit_per_user' => $dto->usageLimitPerUser,
                'times_used' => 0,
                'starts_at' => $dto->startsAt,
                'expires_at' => $dto->expiresAt,
                'is_active' => $dto->isActive,
            ]);

            if (!empty($dto->categoryIds)) {
                $coupon->categories()->sync($dto->categoryIds);
            }

            if (!empty($dto->productIds)) {
                $coupon->products()->sync($dto->productIds);
            }

            if (!empty($dto->rules)) {
                $this->ruleRepository->syncRulesForCoupon((string) $coupon->id, $dto->rules);
            }

            return $coupon->load(['rules', 'categories', 'products']);
        });
    }

    public function updateCoupon(string $id, UpdateCouponDTO $dto): Coupon
    {
        return $this->executeInTransaction(function () use ($id, $dto) {
            $coupon = $this->getCouponById($id);

            $updateData = array_filter([
                'name' => $dto->name,
                'description' => $dto->description,
                'type' => $dto->type,
                'value' => $dto->value,
                'min_order_amount' => $dto->minOrderAmount,
                'max_discount_amount' => $dto->maxDiscountAmount,
                'usage_limit' => $dto->usageLimit,
                'usage_limit_per_user' => $dto->usageLimitPerUser,
                'starts_at' => $dto->startsAt,
                'expires_at' => $dto->expiresAt,
                'is_active' => $dto->isActive,
            ], fn ($val) => $val !== null);

            $this->couponRepository->update($id, $updateData);

            if ($dto->categoryIds !== null) {
                $coupon->categories()->sync($dto->categoryIds);
            }

            if ($dto->productIds !== null) {
                $coupon->products()->sync($dto->productIds);
            }

            if ($dto->rules !== null) {
                $this->ruleRepository->syncRulesForCoupon($id, $dto->rules);
            }

            return $this->getCouponById($id);
        });
    }

    public function deleteCoupon(string $id): bool
    {
        $this->getCouponById($id);
        return $this->couponRepository->delete($id);
    }

    public function getUsageHistory(string $couponId, int $perPage = 20): LengthAwarePaginator
    {
        $this->getCouponById($couponId);
        return $this->usageRepository->paginateForCoupon($couponId, $perPage);
    }

    /**
     * Validate a coupon code and calculate discount amount.
     */
    public function validateCoupon(
        string $code,
        float $subtotal,
        Collection|array $cartItems = [],
        ?string $userId = null,
        float $shippingCost = 0.0,
        string $currency = 'USD'
    ): CouponValidationResultDTO {
        $coupon = $this->couponRepository->findByCode($code);

        if (!$coupon) {
            return CouponValidationResultDTO::invalid('Coupon code not found.', 'COUPON_NOT_FOUND');
        }

        return $this->validator->validate($coupon, $subtotal, $cartItems, $userId, $shippingCost, $currency);
    }

    /**
     * Atomically record coupon usage for an order with pessimistic locking.
     */
    public function recordUsage(
        string $couponId,
        ?string $userId,
        string $orderId,
        float $discountAmount
    ): CouponUsage {
        return $this->executeInTransaction(function () use ($couponId, $userId, $orderId, $discountAmount) {
            /** @var Coupon|null $coupon */
            $coupon = Coupon::where('id', $couponId)->lockForUpdate()->first();

            if (!$coupon) {
                throw new EntityNotFoundException('Coupon', $couponId);
            }

            if ($coupon->usage_limit !== null && $coupon->times_used >= $coupon->usage_limit) {
                throw new BusinessRuleException('Coupon usage limit reached.', 'COUPON_LIMIT_REACHED');
            }

            if ($userId !== null && $coupon->usage_limit_per_user > 0) {
                $userCount = $this->couponRepository->getUserUsageCount($couponId, $userId);
                if ($userCount >= $coupon->usage_limit_per_user) {
                    throw new BusinessRuleException('User coupon usage limit reached.', 'COUPON_USER_LIMIT_REACHED');
                }
            }

            // Increment usage counter
            $coupon->increment('times_used');

            /** @var CouponUsage $usage */
            $usage = $this->usageRepository->recordUsage($couponId, $userId, $orderId, $discountAmount);

            $this->dispatchDomainEvent(new CouponRedeemed(
                couponId: $couponId,
                code: $coupon->code,
                userId: $userId,
                orderId: $orderId,
                discountAmount: $discountAmount
            ));

            return $usage;
        });
    }
}
