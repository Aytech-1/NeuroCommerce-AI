<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Shipping\Models\ShipRate;
use App\Modules\Shipping\Requests\CreateShippingMethodRequest;
use App\Modules\Shipping\Requests\UpdateShippingMethodRequest;
use App\Modules\Shipping\Resources\ShippingRateResource;
use App\Modules\Shipping\Services\ShippingRateService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class ShippingMethodController
 *
 * @package App\Modules\Shipping\Controllers\Admin
 */
class ShippingMethodController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ShippingRateService $rateService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ShipRate::class);

        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['zone_id', 'carrier', 'is_active']);

        $paginator = $this->rateService->paginateRates($filters, $perPage);

        return ResponseHelper::paginated($paginator, ShippingRateResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $rate = $this->rateService->getRateById($id);
        $this->authorize('view', $rate);

        $rate->load('zone');

        return ResponseHelper::success(
            data: new ShippingRateResource($rate),
            message: 'Shipping method retrieved successfully.'
        );
    }

    public function store(CreateShippingMethodRequest $request): JsonResponse
    {
        $this->authorize('create', ShipRate::class);

        $rate = $this->rateService->createRate($request->validated());

        return ResponseHelper::created(
            data: new ShippingRateResource($rate),
            message: 'Shipping method created successfully.'
        );
    }

    public function update(string $id, UpdateShippingMethodRequest $request): JsonResponse
    {
        $rate = $this->rateService->getRateById($id);
        $this->authorize('update', $rate);

        $updatedRate = $this->rateService->updateRate($id, $request->validated());

        return ResponseHelper::success(
            data: new ShippingRateResource($updatedRate),
            message: 'Shipping method updated successfully.'
        );
    }
}
