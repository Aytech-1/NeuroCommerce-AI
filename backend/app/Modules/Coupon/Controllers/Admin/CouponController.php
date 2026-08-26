<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Coupon\Requests\CreateCouponRequest;
use App\Modules\Coupon\Requests\UpdateCouponRequest;
use App\Modules\Coupon\Resources\CouponResource;
use App\Modules\Coupon\Resources\CouponUsageResource;
use App\Modules\Coupon\Services\CouponService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class CouponController
 *
 * Admin API for managing coupons, discount rules, and reviewing usage history.
 *
 * @package App\Modules\Coupon\Controllers\Admin
 */
class CouponController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly CouponService $couponService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Coupon::class);

        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['is_active', 'type', 'search']);

        $coupons = $this->couponService->listCoupons($filters, $perPage);

        return ResponseHelper::paginated($coupons, CouponResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $coupon = $this->couponService->getCouponById($id);
        $this->authorize('view', $coupon);

        return ResponseHelper::success(
            new CouponResource($coupon),
            'Coupon retrieved successfully.'
        );
    }

    public function store(CreateCouponRequest $request): JsonResponse
    {
        $this->authorize('create', Coupon::class);

        $coupon = $this->couponService->createCoupon($request->toDTO());

        return ResponseHelper::created(
            new CouponResource($coupon),
            'Coupon created successfully.'
        );
    }

    public function update(string $id, UpdateCouponRequest $request): JsonResponse
    {
        $coupon = $this->couponService->getCouponById($id);
        $this->authorize('update', $coupon);

        $updated = $this->couponService->updateCoupon($id, $request->toDTO());

        return ResponseHelper::success(
            new CouponResource($updated),
            'Coupon updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $coupon = $this->couponService->getCouponById($id);
        $this->authorize('delete', $coupon);

        $this->couponService->deleteCoupon($id);

        return ResponseHelper::noContent('Coupon deleted successfully.');
    }

    public function usage(string $id, Request $request): JsonResponse
    {
        $coupon = $this->couponService->getCouponById($id);
        $this->authorize('view', $coupon);

        $perPage = PaginationHelper::getPerPage($request);
        $usages = $this->couponService->getUsageHistory($id, $perPage);

        return ResponseHelper::paginated($usages, CouponUsageResource::class);
    }
}
